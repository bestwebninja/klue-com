import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  runSupervisor,
  listSupervisorRuns,
  SupervisorRunResponse,
  SupervisorRun,
  SynthesisResult,
} from "../ai/client/supervisorClient";

// ---------------------------------------------------------------------------
// Chat message type for the command bar UI
// ---------------------------------------------------------------------------

export type MessageRole = "user" | "assistant" | "system";

export interface SupervisorMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  /** Attached structured data when role=assistant */
  data?: {
    supervisorRunId?: string;
    intent?: string;
    synthesis?: SynthesisResult | null;
    agentOutputs?: Record<string, unknown>;
    agentRunIds?: string[];
    hadPartialFailure?: boolean;
    routingPlan?: SupervisorRunResponse["routingPlan"];
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseSupervisorOptions {
  businessUnitId?: string;
  /** Extra context to pass to every supervisor invocation */
  defaultPayload?: Record<string, unknown>;
}

export function useSupervisor(options: UseSupervisorOptions = {}) {
  const { businessUnitId, defaultPayload = {} } = options;

  const [messages, setMessages] = useState<SupervisorMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [history, setHistory] = useState<SupervisorRun[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Send a query to the supervisor
  // ---------------------------------------------------------------------------
  const sendQuery = useCallback(
    async (query: string) => {
      if (!query.trim() || isThinking) return;

      setError(null);

      // Append user message immediately
      const userMsg: SupervisorMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: query.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);

      const { data, error: runError } = await runSupervisor(query.trim(), {
        businessUnitId,
        payload: defaultPayload,
      });

      setIsThinking(false);

      if (runError || !data) {
        const errMsg: SupervisorMessage = {
          id: crypto.randomUUID(),
          role: "system",
          content: runError ?? "The supervisor could not complete the request. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
        setError(runError);
        return;
      }

      // Build assistant message from synthesis
      const synthesis = data.synthesis;
      const content = synthesis
        ? [
            synthesis.headline,
            "",
            synthesis.narrative,
            "",
            synthesis.actions.length > 0
              ? "**Next actions:**\n" +
                synthesis.actions
                  .map((a) => `• [${a.priority.toUpperCase()}] ${a.action}`)
                  .join("\n")
              : "",
          ]
            .filter(Boolean)
            .join("\n")
        : `Completed ${data.agentRunIds.length} agent run(s) for intent: ${data.intentSummary}`;

      const assistantMsg: SupervisorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
        data: {
          supervisorRunId: data.supervisorRunId,
          intent: data.intent,
          synthesis: data.synthesis,
          agentOutputs: data.agentOutputs,
          agentRunIds: data.agentRunIds,
          hadPartialFailure: data.hadPartialFailure,
          routingPlan: data.routingPlan,
        },
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Surface nudges as system messages
      for (const nudge of data.nudges ?? []) {
        const nudgeMsg: SupervisorMessage = {
          id: crypto.randomUUID(),
          role: "system",
          content: `Suggestion: ${nudge.suggestedAction}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, nudgeMsg]);
      }
    },
    [businessUnitId, defaultPayload, isThinking]
  );

  // ---------------------------------------------------------------------------
  // Clear conversation
  // ---------------------------------------------------------------------------
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Load run history
  // ---------------------------------------------------------------------------
  const loadHistory = useCallback(async () => {
    if (!businessUnitId) return;
    setHistoryLoading(true);
    const { data } = await listSupervisorRuns(businessUnitId);
    setHistory(data);
    setHistoryLoading(false);
  }, [businessUnitId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Live subscription: update history when new supervisor runs complete.
  // On CHANNEL_ERROR / TIMED_OUT (idle WebSocket drop), re-fetches history
  // so the UI never gets stuck showing stale data.
  useEffect(() => {
    if (!businessUnitId) return;

    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const channel = supabase
      .channel(`supervisor_runs_live_${businessUnitId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "supervisor_runs",
          filter: `business_unit_id=eq.${businessUnitId}`,
        },
        () => { loadHistory(); }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          retryTimer = setTimeout(() => loadHistory(), 2_000);
        }
      });

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      supabase.removeChannel(channel);
    };
  }, [businessUnitId, loadHistory]);

  return {
    messages,
    isThinking,
    error,
    sendQuery,
    clearMessages,
    history,
    historyLoading,
    refreshHistory: loadHistory,
  };
}
