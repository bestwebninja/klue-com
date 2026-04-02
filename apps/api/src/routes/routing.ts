import { Router } from "express";
import { z } from "zod";
import { dispatchRoutingRun, evaluateRouting, getRoutingRun } from "../services/routing/routing-orchestrator";

const router = Router();

const evaluateSchema = z.object({
  tenantId: z.string().uuid(),
  leadId: z.string().uuid().optional(),
  leadSummary: z.string().trim().min(1),
  serviceCategory: z.string().trim().min(1),
  requestedTimeline: z.string().trim().optional(),
  dryRun: z.boolean().default(false),
  requester: z.object({
    email: z.string().email().optional(),
    orgName: z.string().trim().optional(),
    tags: z.array(z.string()).default([])
  }),
  attributes: z.record(z.unknown()).optional()
});

const dispatchSchema = z.object({
  runId: z.string().uuid()
});

const correlationFrom = (headerValue: string | string[] | undefined) => {
  if (Array.isArray(headerValue)) return headerValue[0] || crypto.randomUUID();
  return headerValue || crypto.randomUUID();
};

router.post("/evaluate", async (req, res, next) => {
  try {
    const parsed = evaluateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const correlationId = correlationFrom(req.header("x-correlation-id"));

    const evaluation = await evaluateRouting({
      ...parsed.data,
      correlationId
    });

    return res.status(200).json({
      ...evaluation,
      correlationId
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/dispatch", async (req, res, next) => {
  try {
    const parsed = dispatchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const correlationId = correlationFrom(req.header("x-correlation-id"));
    const result = await dispatchRoutingRun(parsed.data.runId, correlationId);

    if (!result || !result.run) return res.status(404).json({ error: "Routing run not found" });

    return res.status(200).json({
      runId: parsed.data.runId,
      status: result.run.status,
      handoffs: result.handoffs,
      dispatch: result.summary,
      correlationId
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/runs/:runId", (req, res) => {
  const runId = req.params.runId;
  const parsedRunId = z.string().uuid().safeParse(runId);
  if (!parsedRunId.success) return res.status(400).json({ error: "Invalid runId" });

  const record = getRoutingRun(parsedRunId.data);
  if (!record) return res.status(404).json({ error: "Routing run not found" });

  return res.status(200).json(record);
});

export default router;
