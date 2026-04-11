import { Router } from "express";
import type { LeadIntakeResponse } from "@kluje/shared";
import { leadIntakeSchema, type LeadIntakeInput } from "../services/leads/schema";
import { normalizeAndEnrichIntake } from "../services/leads/intake";
import { z } from "zod";
import { env } from "../config/env";

type PriorityTier = "high" | "medium" | "low";
type RouteStrategy = "round_robin" | "category_based";
type RouteEventType = "created" | "routed" | "assigned" | "dispatched" | "disposition_updated";

type LeadRecord = LeadIntakeResponse & {
  priorityTier: PriorityTier;
};

type RouteLogRecord = {
  id: string;
  leadId: string;
  eventType: RouteEventType;
  strategy: RouteStrategy;
  timestamp: string;
  details: Record<string, unknown>;
};

const router = Router();

const routeSchema = z
  .object({
    strategy: z.enum(["round_robin", "category_based"]).default("round_robin"),
  })
  .default({ strategy: "round_robin" });

const dispositionSchema = z.object({
  status: z.enum(["accepted", "rejected"]).default("accepted"),
});

const defaultRoundRobinQueue = ["agent-01", "agent-02", "agent-03"];
const categoryQueues: Record<string, string[]> = {
  plumbing: ["agent-11", "agent-12"],
  electrical: ["agent-21", "agent-22"],
  hvac: ["agent-31", "agent-32"],
};
const tierWeight: Record<PriorityTier, number> = { high: 1000, medium: 100, low: 10 };

const leads = new Map<string, LeadRecord>();
const routeLogs: RouteLogRecord[] = [];
const roundRobinState = {
  defaultIndex: 0,
  categoryIndex: new Map<string, number>(),
};

const logRouteEvent = (
  leadId: string,
  eventType: RouteEventType,
  strategy: RouteStrategy,
  details: Record<string, unknown>,
) => {
  routeLogs.push({
    id: crypto.randomUUID(),
    leadId,
    eventType,
    strategy,
    timestamp: new Date().toISOString(),
    details,
  });
};

const nextFromQueue = (queue: string[], queueKey = "default"): string => {
  if (queue.length === 0) return "unassigned";

  if (queueKey === "default") {
    const index = roundRobinState.defaultIndex % queue.length;
    roundRobinState.defaultIndex += 1;
    return queue[index];
  }

  const current = roundRobinState.categoryIndex.get(queueKey) ?? 0;
  const index = current % queue.length;
  roundRobinState.categoryIndex.set(queueKey, current + 1);
  return queue[index];
};

const buildAssignmentQueue = (agents: string[], priorityTier: PriorityTier): string[] => {
  const weight = tierWeight[priorityTier];
  return [...agents].sort(
    (a, b) => (b.charCodeAt(b.length - 1) % weight) - (a.charCodeAt(a.length - 1) % weight),
  );
};

const dispatchWebhookPlaceholder = (lead: LeadRecord, strategy: RouteStrategy) => {
  const dispatchedAt = new Date().toISOString();
  return {
    status: "queued",
    webhook: "lead.routing.assigned",
    note: "Placeholder dispatch only. Integrate outbound webhook provider.",
    strategy,
    leadId: lead.id,
    dispatchedAt,
  };
};

const dispatchWebhook = async (lead: LeadRecord, strategy: RouteStrategy) => {
  if (!env.leadRoutingWebhookUrl) {
    return dispatchWebhookPlaceholder(lead, strategy);
  }

  const dispatchedAt = new Date().toISOString();
  const payload = {
    event: "lead.routing.assigned",
    strategy,
    dispatchedAt,
    lead,
  };

  try {
    const response = await fetch(env.leadRoutingWebhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        status: "failed",
        webhook: env.leadRoutingWebhookUrl,
        note: `Webhook returned ${response.status}`,
        strategy,
        leadId: lead.id,
        dispatchedAt,
      };
    }

    return {
      status: "sent",
      webhook: env.leadRoutingWebhookUrl,
      note: "Webhook delivered.",
      strategy,
      leadId: lead.id,
      dispatchedAt,
    };
  } catch (error) {
    return {
      status: "failed",
      webhook: env.leadRoutingWebhookUrl,
      note: `Webhook request failed: ${(error as Error).message}`,
      strategy,
      leadId: lead.id,
      dispatchedAt,
    };
  }
};

const resolveIntakeStatus = (input: LeadIntakeInput, intakeScore: number, missingCount: number) => {
  if (missingCount >= 3) return "needs_info" as const;
  if (missingCount > 0) return "in_review" as const;
  if ((input.intentScore >= 70 && intakeScore >= 70) || intakeScore >= 85) return "ready_for_routing" as const;
  return "pending" as const;
};

router.get("/", (_req, res) => {
  res.json({ data: Array.from(leads.values()) });
});

router.get("/:leadId", (req, res) => {
  const lead = leads.get(req.params.leadId);
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  return res.json({ data: lead });
});

router.get("/:id/logs", (req, res) => {
  const lead = leads.get(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const data = routeLogs.filter((entry) => entry.leadId === lead.id);
  return res.json({ data });
});

router.post("/", (req, res) => {
  const parsed = leadIntakeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const enrichment = normalizeAndEnrichIntake(parsed.data);
  const intakeStatus = resolveIntakeStatus(parsed.data, enrichment.intakeScore, enrichment.missingInformation.length);

  const lead: LeadRecord = {
    id,
    source: parsed.data.source,
    contactName: parsed.data.contactName,
    contactEmail: parsed.data.contactEmail,
    contactPhone: parsed.data.contactPhone,
    location: parsed.data.location,
    serviceCategory: parsed.data.serviceCategory,
    intentScore: parsed.data.intentScore,
    status: "new",
    intakeStatus,
    budgetMin: parsed.data.budgetMin,
    budgetMax: parsed.data.budgetMax,
    timeline: parsed.data.timeline,
    requirements: parsed.data.requirements,
    scope: enrichment.scope,
    attachments: parsed.data.attachments,
    normalizedCategory: enrichment.normalizedCategory,
    normalizedLocation: enrichment.normalizedLocation,
    intakeScore: enrichment.intakeScore,
    missingInformation: enrichment.missingInformation,
    enrichmentNotes: enrichment.enrichmentNotes,
    createdAt: now,
    updatedAt: now,
    assignmentQueue: [],
    priorityTier: parsed.data.priorityTier,
  };

  leads.set(id, lead);
  logRouteEvent(id, "created", "round_robin", {
    source: lead.source,
    serviceCategory: lead.serviceCategory,
    priorityTier: lead.priorityTier,
    normalizedCategory: lead.normalizedCategory,
    normalizedLocation: lead.normalizedLocation,
    intakeStatus: lead.intakeStatus,
    intakeScore: lead.intakeScore,
  });

  return res.status(201).json(lead);
});

router.post("/:id/route", async (req, res) => {
  const lead = leads.get(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const parsed = routeSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { strategy } = parsed.data;

  const targetPool =
    strategy === "category_based"
      ? categoryQueues[lead.normalizedCategory] ?? defaultRoundRobinQueue
      : defaultRoundRobinQueue;

  const assignedAgentId =
    strategy === "category_based"
      ? nextFromQueue(targetPool, lead.normalizedCategory)
      : nextFromQueue(targetPool);

  const assignmentQueue = buildAssignmentQueue(targetPool, lead.priorityTier);

  lead.assignedAgentId = assignedAgentId;
  lead.assignmentQueue = assignmentQueue;
  lead.status = "routed";
  lead.routedAt = new Date().toISOString();
  lead.updatedAt = lead.routedAt;

  leads.set(lead.id, lead);

  logRouteEvent(lead.id, "routed", strategy, {
    assignedAgentId,
    priorityTier: lead.priorityTier,
    serviceCategory: lead.serviceCategory,
    intakeStatus: lead.intakeStatus,
    intakeScore: lead.intakeScore,
  });

  logRouteEvent(lead.id, "assigned", strategy, {
    assignedAgentId,
    assignmentQueue,
  });

  const dispatch = await dispatchWebhook(lead, strategy);
  logRouteEvent(lead.id, "dispatched", strategy, dispatch);

  return res.json({
    id: lead.id,
    status: lead.status,
    strategy,
    assignedAgentId,
    assignmentQueue,
    dispatch,
  });
});

router.post("/:id/disposition", (req, res) => {
  const lead = leads.get(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const parsed = dispositionSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  lead.status = parsed.data.status;
  lead.updatedAt = new Date().toISOString();
  leads.set(lead.id, lead);

  logRouteEvent(lead.id, "disposition_updated", "round_robin", {
    status: lead.status,
  });

  return res.json({ id: lead.id, status: lead.status, updatedAt: lead.updatedAt });
});

export default router;
