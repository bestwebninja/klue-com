import { Router } from "express";
import { z } from "zod";

const router = Router();

const createThreadSchema = z.object({
  subject: z.string().trim().min(1),
  participantIds: z.array(z.string().uuid()).min(1),
  context: z.record(z.unknown()).optional()
});

const sendMessageSchema = z.object({
  senderId: z.string().uuid(),
  body: z.string().trim().min(1),
  metadata: z.record(z.unknown()).optional()
});

type Thread = z.infer<typeof createThreadSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

type ThreadMessage = z.infer<typeof sendMessageSchema> & {
  id: string;
  threadId: string;
  createdAt: string;
};

const threads = new Map<string, Thread>();
const threadMessages = new Map<string, ThreadMessage[]>();

router.post("/threads", (req, res) => {
  const parsed = createThreadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const now = new Date().toISOString();
  const thread: Thread = {
    id: crypto.randomUUID(),
    ...parsed.data,
    createdAt: now,
    updatedAt: now
  };
  threads.set(thread.id, thread);
  threadMessages.set(thread.id, []);

  return res.status(201).json({ data: thread });
});

router.get("/threads/:threadId", (req, res) => {
  const threadId = req.params.threadId;
  const parsed = z.string().uuid().safeParse(threadId);
  if (!parsed.success) return res.status(400).json({ error: "Invalid threadId" });

  const thread = threads.get(parsed.data);
  if (!thread) return res.status(404).json({ error: "Thread not found" });

  return res.status(200).json({ data: thread });
});

router.post("/threads/:threadId/messages", (req, res) => {
  const threadId = req.params.threadId;
  const parsedThreadId = z.string().uuid().safeParse(threadId);
  if (!parsedThreadId.success) return res.status(400).json({ error: "Invalid threadId" });
  if (!threads.has(parsedThreadId.data)) return res.status(404).json({ error: "Thread not found" });

  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const message: ThreadMessage = {
    id: crypto.randomUUID(),
    threadId: parsedThreadId.data,
    ...parsed.data,
    createdAt: new Date().toISOString()
  };

  const existing = threadMessages.get(parsedThreadId.data) || [];
  existing.push(message);
  threadMessages.set(parsedThreadId.data, existing);

  return res.status(201).json({ data: message });
});

export default router;
