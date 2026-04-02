import { hasSupabaseAdmin, supabaseAdmin } from "../supabase-admin";

export type ThreadRecord = {
  id: string;
  tenantId: string;
  leadId?: string;
  participantIds: string[];
  subject?: string;
  status: "open" | "closed";
  createdBy: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type MessageRecord = {
  id: string;
  tenantId: string;
  threadId: string;
  senderUserId: string;
  body: string;
  messageType: "text" | "system";
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ReminderRecord = {
  id: string;
  tenantId: string;
  appointmentId?: string;
  threadId?: string;
  reminderType: "appointment" | "no_response_nudge";
  channel: "email" | "sms" | "in_app";
  recipientUserId?: string;
  scheduledFor: string;
  status: "queued" | "sent" | "cancelled";
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

const threads = new Map<string, ThreadRecord>();
const messages = new Map<string, MessageRecord[]>();
const reminders = new Map<string, ReminderRecord>();

const persistSupabase = async (table: string, payload: Record<string, unknown>) => {
  if (!hasSupabaseAdmin || !supabaseAdmin) return;

  const { error } = await supabaseAdmin.from(table).insert(payload);
  if (error) {
    console.warn(`[messaging-store] failed to persist ${table}: ${error.message}`);
  }
};

const updateSupabase = async (
  table: string,
  values: Record<string, unknown>,
  whereColumn: string,
  whereValue: string
) => {
  if (!hasSupabaseAdmin || !supabaseAdmin) return;

  const { error } = await supabaseAdmin.from(table).update(values).eq(whereColumn, whereValue);
  if (error) {
    console.warn(`[messaging-store] failed to update ${table}: ${error.message}`);
  }
};

export const messagingStore = {
  async saveThread(thread: ThreadRecord) {
    threads.set(thread.id, thread);

    await persistSupabase("threads", {
      id: thread.id,
      tenant_id: thread.tenantId,
      lead_id: thread.leadId,
      participant_ids: thread.participantIds,
      subject: thread.subject,
      status: thread.status,
      created_by: thread.createdBy,
      last_message_at: thread.lastMessageAt,
      created_at: thread.createdAt,
      updated_at: thread.updatedAt,
    });
  },

  getThread(threadId: string) {
    return threads.get(threadId) ?? null;
  },

  async updateThread(threadId: string, patch: Partial<ThreadRecord>) {
    const existing = threads.get(threadId);
    if (!existing) return null;

    const next = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    threads.set(threadId, next);

    await updateSupabase(
      "threads",
      {
        status: next.status,
        last_message_at: next.lastMessageAt,
        updated_at: next.updatedAt,
      },
      "id",
      threadId
    );

    return next;
  },

  async saveMessage(message: MessageRecord) {
    const existing = messages.get(message.threadId) ?? [];
    messages.set(message.threadId, [...existing, message]);

    await persistSupabase("messages", {
      id: message.id,
      tenant_id: message.tenantId,
      thread_id: message.threadId,
      sender_user_id: message.senderUserId,
      body: message.body,
      message_type: message.messageType,
      metadata: message.metadata,
      created_at: message.createdAt,
    });
  },

  listMessages(threadId: string) {
    return messages.get(threadId) ?? [];
  },

  async saveReminder(reminder: ReminderRecord) {
    reminders.set(reminder.id, reminder);

    await persistSupabase("reminders", {
      id: reminder.id,
      tenant_id: reminder.tenantId,
      appointment_id: reminder.appointmentId,
      thread_id: reminder.threadId,
      reminder_type: reminder.reminderType,
      channel: reminder.channel,
      recipient_user_id: reminder.recipientUserId,
      scheduled_for: reminder.scheduledFor,
      status: reminder.status,
      payload: reminder.payload,
      created_at: reminder.createdAt,
      updated_at: reminder.updatedAt,
    });
  },

  async updateReminder(reminderId: string, patch: Partial<ReminderRecord>) {
    const existing = reminders.get(reminderId);
    if (!existing) return null;

    const next = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    reminders.set(reminderId, next);

    await updateSupabase(
      "reminders",
      {
        status: next.status,
        payload: next.payload,
        updated_at: next.updatedAt,
      },
      "id",
      reminderId
    );

    return next;
  },

  async appendAuditEvent(input: { tenantId: string; eventType: string; payload: Record<string, unknown> }) {
    await persistSupabase("events", {
      tenant_id: input.tenantId,
      event_type: input.eventType,
      payload: input.payload,
    });
  },
};
