import { supabase } from "@/integrations/supabase/client";

export interface AgentRunRequest {
  agentKey: string;
  payload: Record<string, unknown>;
  businessUnitId?: string;
}

export interface AgentRunResponse {
  ok: boolean;
  runId: string;
  agentKey: string;
  output: unknown;
  iterationCount: number;
  finishReason: "answer" | "max_iterations" | "error";
  steps: unknown[];
  error?: string;
}

/** Hard timeout for individual agent edge function calls (90 s). */
const AGENT_TIMEOUT_MS = 90_000;

/**
 * Invoke a command center agent via the Supabase edge function.
 * Returns the full ReAct result including reasoning steps.
 */
export async function runCommandCenterAgent(
  agentKey: string,
  payload: Record<string, unknown>,
  businessUnitId?: string
): Promise<{ data: AgentRunResponse | null; error: string | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);

  try {
    const { data, error } = await supabase.functions.invoke("command-center-ai", {
      body: { agentKey, payload, businessUnitId },
      signal: controller.signal,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    const response = data as AgentRunResponse;
    return { data: response, error: response.ok ? null : (response.error ?? "Agent run failed") };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { data: null, error: "Agent request timed out. Please try again." };
    }
    return { data: null, error: err instanceof Error ? err.message : "Unexpected error." };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch a single agent run record by ID from the database.
 * Useful for checking the status of a run that was started asynchronously.
 */
export async function getAgentRun(runId: string) {
  const { data, error } = await supabase
    .from("ai_agent_runs")
    .select(
      "id, agent_key, business_unit_id, status, input_payload, output_payload, error_message, reasoning_steps, model, iteration_count, created_at, updated_at"
    )
    .eq("id", runId)
    .maybeSingle();

  return { data, error };
}

/**
 * List recent agent runs for a business unit.
 */
export async function listAgentRuns(
  businessUnitId: string,
  options: { agentKey?: string; limit?: number } = {}
) {
  const { agentKey, limit = 20 } = options;

  let query = supabase
    .from("ai_agent_runs")
    .select(
      "id, agent_key, status, output_payload, error_message, iteration_count, created_at"
    )
    .eq("business_unit_id", businessUnitId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (agentKey) {
    query = query.eq("agent_key", agentKey);
  }

  return query;
}
