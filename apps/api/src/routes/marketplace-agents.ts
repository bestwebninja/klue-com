import { Router } from "express";
import { z } from "zod";
import type { MarketplaceAgentCode, MarketplaceAgentTaskCreateRequest } from "@kluje/shared";
import {
  createMarketplaceAgentTask,
  decideNextMarketplaceAgent,
  getMarketplaceAgentTask,
  listMarketplaceAgentTasks,
  listMarketplaceAgentWorkflowTemplates,
  transitionMarketplaceAgentTask
} from "../services/marketplace-agents/agent-backbone";

const router = Router();

const agentCodeSchema = z.enum([
  "A0_ROUTER_ORCHESTRATOR",
  "A1_CUSTOMER_CONCIERGE",
  "A2_JOB_INTAKE_SCOPING",
  "A3_MATCHING_QUOTE_DISPATCH",
  "A4_QUOTE_COMPARISON_ADVISOR",
  "A5_SCHEDULING_MESSAGING_COORDINATOR",
  "A6_ASK_EXPERT_MODERATOR",
  "A7_TRUST_VERIFICATION_COMPLIANCE",
  "A8_SUPPORT_DISPUTE_TRIAGE"
]);

const createTaskSchema = z.object({
  tenantId: z.string().uuid(),
  agentCode: agentCodeSchema,
  source: z.enum(["api", "workflow", "system", "manual"]),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  dedupeKey: z.string().trim().min(1).optional(),
  correlationId: z.string().trim().min(1).optional(),
  requestedBy: z.string().trim().min(1).optional(),
  summary: z.string().trim().min(10),
  input: z.record(z.unknown()),
  context: z.record(z.unknown()).optional()
});

const transitionSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(["queued", "in_progress", "waiting", "completed", "failed", "cancelled"]),
  output: z.record(z.unknown()).optional(),
  failureCode: z.string().trim().min(1).optional(),
  failureMessage: z.string().trim().min(1).optional()
});

router.get("/workflow-templates", (_req, res) => {
  return res.status(200).json({ data: listMarketplaceAgentWorkflowTemplates() });
});

router.post("/tasks", (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const task = createMarketplaceAgentTask(parsed.data as MarketplaceAgentTaskCreateRequest);
  return res.status(201).json({ data: task });
});

router.get("/tasks", (req, res) => {
  const tenantIdParsed = z.string().uuid().safeParse(req.query.tenantId);
  if (!tenantIdParsed.success) return res.status(400).json({ error: "tenantId query param is required and must be a UUID" });

  const agentCode = req.query.agentCode ? agentCodeSchema.safeParse(req.query.agentCode) : null;
  if (req.query.agentCode && !agentCode?.success) return res.status(400).json({ error: "Invalid agentCode" });

  const tasks = listMarketplaceAgentTasks(tenantIdParsed.data, agentCode?.success ? (agentCode.data as MarketplaceAgentCode) : undefined);
  return res.status(200).json({ data: tasks });
});

router.get("/tasks/:taskId", (req, res) => {
  const parsedTaskId = z.string().uuid().safeParse(req.params.taskId);
  if (!parsedTaskId.success) return res.status(400).json({ error: "Invalid taskId" });

  const task = getMarketplaceAgentTask(parsedTaskId.data);
  if (!task) return res.status(404).json({ error: "Marketplace agent task not found" });

  return res.status(200).json({ data: task });
});

router.post("/tasks/:taskId/decision", (req, res) => {
  const parsedTaskId = z.string().uuid().safeParse(req.params.taskId);
  if (!parsedTaskId.success) return res.status(400).json({ error: "Invalid taskId" });

  const task = getMarketplaceAgentTask(parsedTaskId.data);
  if (!task) return res.status(404).json({ error: "Marketplace agent task not found" });

  const decision = decideNextMarketplaceAgent(task);
  return res.status(200).json({ data: decision });
});

router.post("/tasks/transition", (req, res) => {
  const parsed = transitionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const task = transitionMarketplaceAgentTask(parsed.data);
  if (!task) return res.status(404).json({ error: "Marketplace agent task not found" });

  return res.status(200).json({ data: task });
});

export default router;
