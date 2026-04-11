import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RoutingStage {
  stage: number;
  agentKeys: string[];
  mode: "parallel" | "sequential";
  rationale: string;
}

export interface NudgeRule {
  trigger: string;
  suggestedAction: string;
  targetAgentKey?: string;
}

export interface RoutingPlan {
  intent: string;
  intentSummary: string;
  stages: RoutingStage[];
  nudges: NudgeRule[];
  allAgentKeys: string[];
}

export interface SynthesisResult {
  headline: string;
  narrative: string;
  actions: Array<{ priority: "high" | "medium" | "low"; action: string; sourceAgent: string }>;
  nudges: Array<{ trigger: string; suggestedAction: string }>;
  riskLevel: "low" | "moderate" | "elevated" | "high";
  confidence: number;
}

export interface SupervisorRunResponse {
  ok: boolean;
  supervisorRunId: string;
  intent: string;
  intentSummary: string;
  routingPlan: RoutingPlan;
  agentOutputs: Record<string, unknown>;
  synthesis: SynthesisResult | null;
  agentRunIds: string[];
  hadPartialFailure: boolean;
  nudges: NudgeRule[];
}

export interface SupervisorRun {
  id: string;
  businessUnitId: string | null;
  query: string;
  intent: string | null;
  routingPlan: RoutingStage[];
  agentRunIds: string[];
  agentOutputs: Record<string, unknown>;
  synthesis: SynthesisResult | null;
  status: "running" | "succeeded" | "partial" | "failed";
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Invocation
// ---------------------------------------------------------------------------

/**
 * Send a natural language query to the Neural Command OS supervisor.
 * The supervisor classifies intent, routes to appropriate agents, and
 * returns a synthesized unified response.
 */
export async function runSupervisor(
  query: string,
  options: {
    businessUnitId?: string;
    payload?: Record<string, unknown>;
  } = {}
): Promise<{ data: SupervisorRunResponse | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke("command-center-supervisor", {
    body: {
      query,
      businessUnitId: options.businessUnitId,
      payload: options.payload ?? {},
    },
  });

  if (error) {
    return { data: null, error: error.message };
  }

  const response = data as SupervisorRunResponse;
  return {
    data: response,
    error: response.ok ? null : "Supervisor run completed with errors.",
  };
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

/**
 * Fetch recent supervisor run history for a business unit.
 */
export async function listSupervisorRuns(
  businessUnitId: string,
  limit = 20
): Promise<{ data: SupervisorRun[]; error: string | null }> {
  const { data, error } = await supabase
    .from("supervisor_runs")
    .select(
      "id, business_unit_id, query, intent, routing_plan, agent_run_ids, agent_outputs, synthesis, status, error_message, created_at, updated_at"
    )
    .eq("business_unit_id", businessUnitId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { data: [], error: error.message };

  const runs = (data ?? []).map((r) => ({
    id: r.id as string,
    businessUnitId: r.business_unit_id as string | null,
    query: r.query as string,
    intent: r.intent as string | null,
    routingPlan: (r.routing_plan as RoutingStage[]) ?? [],
    agentRunIds: (r.agent_run_ids as string[]) ?? [],
    agentOutputs: (r.agent_outputs as Record<string, unknown>) ?? {},
    synthesis: (r.synthesis as SynthesisResult) ?? null,
    status: r.status as SupervisorRun["status"],
    errorMessage: r.error_message as string | null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }));

  return { data: runs, error: null };
}
