import { hasSupabaseAdmin, supabaseAdmin } from "../supabase-admin";
import type { HandoffRecord, RoutingDecision, RoutingRunRecord } from "./types";

const runs = new Map<string, RoutingRunRecord>();
const handoffs = new Map<string, HandoffRecord[]>();
const decisions = new Map<string, RoutingDecision[]>();

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
  }
};
