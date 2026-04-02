import { hasSupabaseAdmin, supabaseAdmin } from "../supabase-admin";
import type { ConciergeMessage, ConciergeSession, ConciergeSessionContext } from "@kluje/shared";

type ConciergeSessionRecord = ConciergeSession & {
  tenantId: string | null;
};

const sessions = new Map<string, ConciergeSessionRecord>();
const messages = new Map<string, ConciergeMessage[]>();

const insertSupabase = async (table: string, payload: Record<string, unknown>) => {
  if (!hasSupabaseAdmin || !supabaseAdmin) return;
  const { error } = await supabaseAdmin.from(table).insert(payload);
  if (error) {
    console.warn(`[concierge-store] failed to insert ${table}: ${error.message}`);
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
    console.warn(`[concierge-store] failed to update ${table}: ${error.message}`);
  }
};

export const conciergeStore = {
  async createSession(input: {
    tenantId: string | null;
    context: ConciergeSessionContext;
    guidanceState?: Record<string, unknown>;
  }): Promise<ConciergeSessionRecord> {
    const now = new Date().toISOString();
    const record: ConciergeSessionRecord = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      status: "active",
      context: input.context,
      guidanceState: input.guidanceState ?? {},
      createdAt: now,
      updatedAt: now
    };
    sessions.set(record.id, record);

    await insertSupabase("concierge_sessions", {
      id: record.id,
      tenant_id: record.tenantId,
      channel: record.context.channel ?? "web",
      status: record.status,
      marketplace_context: record.context,
      guidance_state: record.guidanceState,
      ai_extension_hook: {
        mode: "deterministic_v1",
        aiReady: true
      },
      created_at: record.createdAt,
      updated_at: record.updatedAt
    });

    return record;
  },

  async updateSession(sessionId: string, patch: Partial<ConciergeSessionRecord>) {
    const existing = sessions.get(sessionId);
    if (!existing) return null;

    const next: ConciergeSessionRecord = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString()
    };
    sessions.set(sessionId, next);

    await updateSupabase(
      "concierge_sessions",
      {
        status: next.status,
        marketplace_context: next.context,
        guidance_state: next.guidanceState,
        updated_at: next.updatedAt
      },
      "id",
      sessionId
    );

    return next;
  },

  getSession(sessionId: string) {
    return sessions.get(sessionId) ?? null;
  },

  async appendMessages(sessionId: string, nextMessages: ConciergeMessage[], tenantId: string | null) {
    const existing = messages.get(sessionId) ?? [];
    messages.set(sessionId, [...existing, ...nextMessages]);

    await Promise.all(
      nextMessages.map((message) =>
        insertSupabase("concierge_messages", {
          id: message.id,
          session_id: sessionId,
          tenant_id: tenantId,
          role: message.role,
          message_type: message.messageType,
          content: message.content,
          metadata: message.metadata,
          ai_extension_hook: {
            mode: "deterministic_v1",
            aiCandidate: true
          },
          created_at: message.createdAt
        })
      )
    );
  },

  getMessages(sessionId: string) {
    return messages.get(sessionId) ?? [];
  }
};
