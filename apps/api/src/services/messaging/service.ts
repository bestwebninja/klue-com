import { messagingStore, type MessageRecord, type ReminderRecord, type ThreadRecord } from "./store";

export type CreateThreadInput = {
  tenantId: string;
  createdBy: string;
  participantIds: string[];
  leadId?: string;
  subject?: string;
  initialMessage?: string;
};

export type SendMessageInput = {
  tenantId: string;
  threadId: string;
  senderUserId: string;
  body: string;
};

const createNoResponseNudge = (input: {
  tenantId: string;
  threadId: string;
  recipientUserId?: string;
  senderUserId: string;
}): ReminderRecord => {
  const now = Date.now();
  const scheduledFor = new Date(now + 1000 * 60 * 60 * 24).toISOString();
  const createdAt = new Date(now).toISOString();

  return {
    id: crypto.randomUUID(),
    tenantId: input.tenantId,
    threadId: input.threadId,
    reminderType: "no_response_nudge",
    channel: "in_app",
    recipientUserId: input.recipientUserId,
    scheduledFor,
    status: "queued",
    payload: {
      reason: "no_response_24h",
      senderUserId: input.senderUserId,
      threadId: input.threadId,
    },
    createdAt,
    updatedAt: createdAt,
  };
};

export const messagingService = {
  async createThread(input: CreateThreadInput) {
    const now = new Date().toISOString();

    const thread: ThreadRecord = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      leadId: input.leadId,
      participantIds: Array.from(new Set([input.createdBy, ...input.participantIds])),
      subject: input.subject,
      status: "open",
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await messagingStore.saveThread(thread);

    let initialMessage: MessageRecord | null = null;
    if (input.initialMessage) {
      initialMessage = await this.sendMessage({
        tenantId: input.tenantId,
        threadId: thread.id,
        senderUserId: input.createdBy,
        body: input.initialMessage,
      });
    }

    await messagingStore.appendAuditEvent({
      tenantId: input.tenantId,
      eventType: "messaging.thread.created",
      payload: {
        threadId: thread.id,
        leadId: thread.leadId,
        createdBy: input.createdBy,
        participantIds: thread.participantIds,
      },
    });

    return { thread, initialMessage };
  },

  getThread(threadId: string, tenantId: string) {
    const thread = messagingStore.getThread(threadId);
    if (!thread || thread.tenantId !== tenantId) return null;

    const threadMessages = messagingStore.listMessages(threadId);
    return {
      ...thread,
      messages: threadMessages,
    };
  },

  async sendMessage(input: SendMessageInput) {
    const thread = messagingStore.getThread(input.threadId);
    if (!thread || thread.tenantId !== input.tenantId) {
      throw new Error("THREAD_NOT_FOUND");
    }

    const message: MessageRecord = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      threadId: input.threadId,
      senderUserId: input.senderUserId,
      body: input.body,
      messageType: "text",
      metadata: {},
      createdAt: new Date().toISOString(),
    };

    await messagingStore.saveMessage(message);
    await messagingStore.updateThread(input.threadId, {
      lastMessageAt: message.createdAt,
    });

    const recipientUserId = thread.participantIds.find((participantId) => participantId !== input.senderUserId);
    const nudge = createNoResponseNudge({
      tenantId: input.tenantId,
      threadId: input.threadId,
      recipientUserId,
      senderUserId: input.senderUserId,
    });
    await messagingStore.saveReminder(nudge);

    await messagingStore.appendAuditEvent({
      tenantId: input.tenantId,
      eventType: "messaging.message.sent",
      payload: {
        threadId: input.threadId,
        messageId: message.id,
        senderUserId: input.senderUserId,
      },
    });

    return message;
  },
};
