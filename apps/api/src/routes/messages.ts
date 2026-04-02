import { Router } from "express";
import { z } from "zod";
import type { TenantRequest } from "../middleware/tenant";
import type { AuthRequest } from "../middleware/auth";
import { messagingService } from "../services/messaging/service";

const router = Router();

const createThreadSchema = z.object({
  leadId: z.string().uuid().optional(),
  participantIds: z.array(z.string().uuid()).min(1),
  subject: z.string().min(1).max(180).optional(),
  initialMessage: z.string().min(1).max(5000).optional(),
});

const sendMessageSchema = z.object({
  body: z.string().min(1).max(5000),
});

router.post("/threads", async (req: TenantRequest & AuthRequest, res) => {
  if (!req.user?.sub) return res.status(401).json({ error: "Unauthorized" });
  if (!req.tenantId) return res.status(400).json({ error: "Missing tenant context" });

  const parsed = createThreadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const record = await messagingService.createThread({
    tenantId: req.tenantId,
    createdBy: req.user.sub,
    participantIds: parsed.data.participantIds,
    leadId: parsed.data.leadId,
    subject: parsed.data.subject,
    initialMessage: parsed.data.initialMessage,
  });

  return res.status(201).json({ data: record });
});

router.get("/threads/:threadId", (req: TenantRequest, res) => {
  if (!req.tenantId) return res.status(400).json({ error: "Missing tenant context" });

  const threadId = z.string().uuid().safeParse(req.params.threadId);
  if (!threadId.success) return res.status(400).json({ error: "Invalid thread id" });

  const thread = messagingService.getThread(threadId.data, req.tenantId);
  if (!thread) return res.status(404).json({ error: "Thread not found" });

  return res.status(200).json({ data: thread });
});

router.post("/threads/:threadId/messages", async (req: TenantRequest & AuthRequest, res) => {
  if (!req.user?.sub) return res.status(401).json({ error: "Unauthorized" });
  if (!req.tenantId) return res.status(400).json({ error: "Missing tenant context" });

  const threadId = z.string().uuid().safeParse(req.params.threadId);
  if (!threadId.success) return res.status(400).json({ error: "Invalid thread id" });

  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const message = await messagingService.sendMessage({
      tenantId: req.tenantId,
      threadId: threadId.data,
      senderUserId: req.user.sub,
      body: parsed.data.body,
    });

    return res.status(201).json({ data: message });
  } catch (error) {
    if ((error as Error).message === "THREAD_NOT_FOUND") {
      return res.status(404).json({ error: "Thread not found" });
    }

    return res.status(500).json({ error: "Unexpected error" });
  }
});

export default router;
