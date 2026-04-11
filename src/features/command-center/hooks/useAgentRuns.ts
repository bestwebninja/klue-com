import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AgentRunStatus = "queued" | "running" | "succeeded" | "failed";

export interface ReActToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface ReActStep {
  iteration: number;
  thought: string;
  toolCalls: ReActToolCall[];
  observation: string;
}

export interface AgentRun {
  id: string;
  agentKey: string;
  businessUnitId: string | null;
  status: AgentRunStatus;
  inputPayload: Record<string, unknown>;
  outputPayload: Record<string, unknown> | null;
  errorMessage: string | null;
  reasoningSteps: ReActStep[];
  model: string | null;
  iterationCount: number;
  createdAt: string;
  updatedAt: string;
}

function rowToRun(row: Record<string, unknown>): AgentRun {
  return {
    id: row.id as string,
    agentKey: row.agent_key as string,
    businessUnitId: (row.business_unit_id as string) ?? null,
    status: row.status as AgentRunStatus,
    inputPayload: (row.input_payload as Record<string, unknown>) ?? {},
    outputPayload: (row.output_payload as Record<string, unknown>) ?? null,
    errorMessage: (row.error_message as string) ?? null,
    reasoningSteps: (row.reasoning_steps as ReActStep[]) ?? [],
    model: (row.model as string) ?? null,
    iterationCount: (row.iteration_count as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

interface UseAgentRunsOptions {
  businessUnitId?: string;
  agentKey?: string;
  limit?: number;
}

export function useAgentRuns(options: UseAgentRunsOptions = {}) {
  const { businessUnitId, agentKey, limit = 20 } = options;
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("ai_agent_runs")
      .select(
        "id, agent_key, business_unit_id, status, input_payload, output_payload, error_message, reasoning_steps, model, iteration_count, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (businessUnitId) {
      query = query.eq("business_unit_id", businessUnitId);
    }
    if (agentKey) {
      query = query.eq("agent_key", agentKey);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setRuns((data ?? []).map((r) => rowToRun(r as Record<string, unknown>)));
    }
    setLoading(false);
  }, [businessUnitId, agentKey, limit]);

  // Initial fetch
  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // Live subscription — update run in place when status/output changes
  useEffect(() => {
    const channel = supabase
      .channel("agent_runs_live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ai_agent_runs",
          ...(businessUnitId ? { filter: `business_unit_id=eq.${businessUnitId}` } : {}),
        },
        (payload) => {
          const updated = payload.new as Record<string, unknown> | undefined;
          const deleted = payload.old as Record<string, unknown> | undefined;

          if (payload.eventType === "INSERT" && updated?.id) {
            setRuns((prev) => [rowToRun(updated), ...prev].slice(0, limit));
          } else if (payload.eventType === "UPDATE" && updated?.id) {
            setRuns((prev) =>
              prev.map((r) => (r.id === updated.id ? rowToRun(updated) : r))
            );
          } else if (payload.eventType === "DELETE" && deleted?.id) {
            setRuns((prev) => prev.filter((r) => r.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessUnitId, limit]);

  return { runs, loading, error, refetch: fetchRuns };
}

/** Subscribe to a single run by ID — useful for polling a just-triggered run to completion. */
export function useAgentRun(runId: string | null) {
  const [run, setRun] = useState<AgentRun | null>(null);
  const [loading, setLoading] = useState(!!runId);

  useEffect(() => {
    if (!runId) {
      setRun(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Initial fetch
    supabase
      .from("ai_agent_runs")
      .select(
        "id, agent_key, business_unit_id, status, input_payload, output_payload, error_message, reasoning_steps, model, iteration_count, created_at, updated_at"
      )
      .eq("id", runId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRun(rowToRun(data as Record<string, unknown>));
        setLoading(false);
      });

    // Live subscription for this specific run
    const channel = supabase
      .channel(`agent_run_${runId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ai_agent_runs", filter: `id=eq.${runId}` },
        (payload) => {
          const updated = payload.new as Record<string, unknown>;
          if (updated) setRun(rowToRun(updated));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [runId]);

  return { run, loading };
}
