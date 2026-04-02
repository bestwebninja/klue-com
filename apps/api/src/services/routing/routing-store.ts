import { hasSupabaseAdmin, supabaseAdmin } from "../supabase-admin";
import type { DispatchRecord, HandoffRecord, QuoteRequestRecord, RoutingDecision, RoutingRunRecord } from "./types";

const runs = new Map<string, RoutingRunRecord>();
const handoffs = new Map<string, HandoffRecord[]>();
const decisions = new Map<string, RoutingDecision[]>();
const quoteRequests = new Map<string, QuoteRequestRecord>();
const dispatches = new Map<string, DispatchRecord[]>();

const persistSupabase = async (table: string, payload: Record<string, unknown>) => {
  if (!hasSupabaseAdmin || !supabaseAdmin) return;

  const { error } = await supabaseAdmin.from(table).insert(payload);
  if (error) {
    console.warn(`[routing-store] failed to persist ${table}: ${error.message}`);
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
    console.warn(`[routing-store] failed to update ${table}: ${error.message}`);
  }
};

export const routingStore = {
  async saveRun(run: RoutingRunRecord) {
    runs.set(run.id, run);

    await persistSupabase("routing_runs", {
      id: run.id,
      tenant_id: run.tenantId,
      lead_id: run.leadId,
      correlation_id: run.correlationId,
      status: run.status,
      dry_run: run.dryRun,
      request_payload: run.requestPayload,
      response_payload: run.responsePayload,
      rule_version_id: run.ruleVersionId,
      decision_metadata: run.decisionMetadata,
      created_at: run.createdAt,
      updated_at: run.updatedAt
    });
  },

  async updateRun(runId: string, patch: Partial<RoutingRunRecord>) {
    const existing = runs.get(runId);
    if (!existing) return null;

    const next = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    runs.set(runId, next);

    await updateSupabase(
      "routing_runs",
      {
        status: next.status,
        response_payload: next.responsePayload,
        decision_metadata: next.decisionMetadata,
        updated_at: next.updatedAt
      },
      "id",
      runId
    );

    return next;
  },

  getRun(runId: string) {
    return runs.get(runId) ?? null;
  },

  async appendDecisions(runId: string, runDecisions: RoutingDecision[]) {
    const existing = decisions.get(runId) ?? [];
    decisions.set(runId, [...existing, ...runDecisions]);

    await Promise.all(
      runDecisions.map((decision) =>
        persistSupabase("routing_decisions", {
          id: decision.id,
          run_id: decision.runId,
          tenant_id: decision.tenantId,
          correlation_id: decision.correlationId,
          decision_type: decision.decisionType,
          rule_id: decision.ruleId,
          rule_version_id: decision.ruleVersionId,
          outcome: decision.outcome,
          score: decision.score,
          metadata: decision.metadata,
          created_at: decision.createdAt
        })
      )
    );
  },

  getDecisions(runId: string) {
    return decisions.get(runId) ?? [];
  },

  async appendHandoffs(runId: string, runHandoffs: HandoffRecord[]) {
    const existing = handoffs.get(runId) ?? [];
    handoffs.set(runId, [...existing, ...runHandoffs]);

    await Promise.all(
      runHandoffs.map((handoff) =>
        persistSupabase("handoffs", {
          id: handoff.id,
          run_id: handoff.runId,
          tenant_id: handoff.tenantId,
          correlation_id: handoff.correlationId,
          target_type: handoff.targetType,
          target_ref: handoff.targetRef,
          status: handoff.status,
          payload: handoff.payload,
          created_at: handoff.createdAt,
          updated_at: handoff.updatedAt
        })
      )
    );
  },

  getHandoffs(runId: string) {
    return handoffs.get(runId) ?? [];
  },

  async saveQuoteRequest(quoteRequest: QuoteRequestRecord) {
    quoteRequests.set(quoteRequest.id, quoteRequest);

    await persistSupabase("quote_requests", {
      id: quoteRequest.id,
      tenant_id: quoteRequest.tenantId,
      run_id: quoteRequest.runId,
      lead_id: quoteRequest.leadId,
      service_category: quoteRequest.serviceCategory,
      status: quoteRequest.status,
      requested_at: quoteRequest.requestedAt,
      quote_by_at: quoteRequest.quoteByAt,
      reasoning: quoteRequest.reasoning,
      outcomes: quoteRequest.outcomes,
      created_at: quoteRequest.createdAt,
      updated_at: quoteRequest.updatedAt
    });
  },

  async updateQuoteRequest(id: string, patch: Partial<QuoteRequestRecord>) {
    const existing = quoteRequests.get(id);
    if (!existing) return null;

    const next = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    quoteRequests.set(id, next);

    await updateSupabase(
      "quote_requests",
      {
        status: next.status,
        quote_by_at: next.quoteByAt,
        reasoning: next.reasoning,
        outcomes: next.outcomes,
        updated_at: next.updatedAt
      },
      "id",
      id
    );

    return next;
  },

  getQuoteRequest(id: string) {
    return quoteRequests.get(id) ?? null;
  },

  async appendDispatches(runId: string, runDispatches: DispatchRecord[]) {
    const existing = dispatches.get(runId) ?? [];
    dispatches.set(runId, [...existing, ...runDispatches]);

    await Promise.all(
      runDispatches.map((dispatch) =>
        persistSupabase("dispatches", {
          id: dispatch.id,
          run_id: dispatch.runId,
          quote_request_id: dispatch.quoteRequestId,
          tenant_id: dispatch.tenantId,
          provider_id: dispatch.providerId,
          correlation_id: dispatch.correlationId,
          status: dispatch.status,
          attempt_count: dispatch.attemptCount,
          last_error: dispatch.lastError,
          payload: dispatch.payload,
          created_at: dispatch.createdAt,
          updated_at: dispatch.updatedAt
        })
      )
    );
  },

  getDispatches(runId: string) {
    return dispatches.get(runId) ?? [];
  }
};
