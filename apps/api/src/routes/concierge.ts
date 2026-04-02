import { Router } from "express";
import { z } from "zod";
import { fetchConciergeSession, respondConcierge } from "../services/concierge/concierge-orchestrator";
import type { TenantRequest } from "../middleware/tenant";

const router = Router();

const respondSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(4000),
  context: z
    .object({
      marketplace: z.string().trim().optional(),
      locale: z.string().trim().optional(),
      channel: z.enum(["web", "mobile", "partner_api", "unknown"]).optional(),
      metadata: z.record(z.unknown()).optional()
    })
    .optional()
});

router.post("/respond", async (req: TenantRequest, res, next) => {
  try {
    const parsed = respondSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const response = await respondConcierge({
      sessionId: parsed.data.sessionId,
      tenantId: req.tenantId ?? null,
      message: parsed.data.message,
      context: parsed.data.context
    });

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

router.get("/sessions/:sessionId", (req, res) => {
  const parsedSessionId = z.string().uuid().safeParse(req.params.sessionId);
  if (!parsedSessionId.success) return res.status(400).json({ error: "Invalid sessionId" });

  const session = fetchConciergeSession(parsedSessionId.data);
  if (!session) return res.status(404).json({ error: "Concierge session not found" });

  return res.status(200).json(session);
});

export default router;
