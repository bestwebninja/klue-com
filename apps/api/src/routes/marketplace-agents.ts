import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";

const router = Router();

const statusSchema = z.enum(["draft", "active", "paused", "archived"]);
const workflowStepSchema = z.object({
  id: z.string().trim().min(1),
  type: z.enum(["trigger", "action", "approval", "handoff"]),
  config: z.record(z.string(), z.unknown()).default({})
});

const contractSchema = z.object({
  id: z.string().trim().min(1),
  version: z.string().trim().min(1),
  inputSchema: z.record(z.string(), z.unknown()),
  outputSchema: z.record(z.string(), z.unknown())
});

const createMarketplaceAgentSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).max(4000).optional(),
  status: statusSchema.default("draft"),
  contracts: z.array(contractSchema).default([]),
  workflows: z.array(workflowStepSchema).default([]),
  metadata: z.record(z.string(), z.unknown()).default({})
});

const updateMarketplaceAgentSchema = createMarketplaceAgentSchema.partial();

type MarketplaceAgent = z.infer<typeof createMarketplaceAgentSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

const marketplaceAgents = new Map<string, MarketplaceAgent>();

router.get("/", (_req, res) => {
  return res.status(200).json({ data: Array.from(marketplaceAgents.values()) });
});

router.post("/", (req, res) => {
  const parsed = createMarketplaceAgentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const now = new Date().toISOString();
  const marketplaceAgent: MarketplaceAgent = {
    id: randomUUID(),
    ...parsed.data,
    createdAt: now,
    updatedAt: now
  };

  marketplaceAgents.set(marketplaceAgent.id, marketplaceAgent);
  return res.status(201).json({ data: marketplaceAgent });
});

router.get("/:agentId", (req, res) => {
  const parsedAgentId = z.string().uuid().safeParse(req.params.agentId);
  if (!parsedAgentId.success) return res.status(400).json({ error: "Invalid marketplace agent id" });

  const marketplaceAgent = marketplaceAgents.get(parsedAgentId.data);
  if (!marketplaceAgent) return res.status(404).json({ error: "Marketplace agent not found" });

  return res.status(200).json({ data: marketplaceAgent });
});

router.patch("/:agentId", (req, res) => {
  const parsedAgentId = z.string().uuid().safeParse(req.params.agentId);
  if (!parsedAgentId.success) return res.status(400).json({ error: "Invalid marketplace agent id" });

  const existingAgent = marketplaceAgents.get(parsedAgentId.data);
  if (!existingAgent) return res.status(404).json({ error: "Marketplace agent not found" });

  const parsedUpdate = updateMarketplaceAgentSchema.safeParse(req.body);
  if (!parsedUpdate.success) return res.status(400).json({ error: parsedUpdate.error.flatten() });

  const updatedAgent: MarketplaceAgent = {
    ...existingAgent,
    ...parsedUpdate.data,
    updatedAt: new Date().toISOString()
  };

  marketplaceAgents.set(updatedAgent.id, updatedAgent);
  return res.status(200).json({ data: updatedAgent });
});

export default router;
