import { useState } from "react";
import { Bot, CheckCircle2, Loader2, PlayCircle, Settings2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runCommandCenterAgent } from "../../ai/client/commandCenterAiClient";
import type { AgentConfig } from "../../templates/types";

type RunState = "idle" | "running" | "done" | "error";

interface AgentCardState {
  runState: RunState;
  lastRunId: string | null;
  errorMsg: string | null;
}

export function AgentPanel({
  agents,
  businessUnitId,
}: {
  agents: AgentConfig[];
  businessUnitId?: string;
}) {
  const [states, setStates] = useState<Record<string, AgentCardState>>(() =>
    Object.fromEntries(
      agents.map((a) => [a.key, { runState: "idle", lastRunId: null, errorMsg: null }])
    )
  );

  async function handleRun(agentKey: string) {
    setStates((prev) => ({
      ...prev,
      [agentKey]: { runState: "running", lastRunId: null, errorMsg: null },
    }));

    const { data, error } = await runCommandCenterAgent(
      agentKey,
      { businessUnitId },
      businessUnitId
    );

    if (error || !data?.ok) {
      setStates((prev) => ({
        ...prev,
        [agentKey]: {
          runState: "error",
          lastRunId: data?.runId ?? null,
          errorMsg: error ?? data?.error ?? "Run failed",
        },
      }));
      return;
    }

    setStates((prev) => ({
      ...prev,
      [agentKey]: { runState: "done", lastRunId: data.runId, errorMsg: null },
    }));
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Agents</h3>
        <p className="text-xs text-muted-foreground">Operational controls</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {agents.map((agent) => {
          const state = states[agent.key] ?? { runState: "idle", lastRunId: null, errorMsg: null };
          const isRunning = state.runState === "running";

          return (
            <Card key={agent.key} className="border-border/70 bg-card/70">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    {agent.label}
                  </CardTitle>
                  <RunStatusBadge runState={state.runState} agentStatus={agent.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{agent.description}</p>

                {state.errorMsg && (
                  <p className="text-xs text-destructive">{state.errorMsg}</p>
                )}

                {state.runState === "done" && state.lastRunId && (
                  <p className="text-[11px] text-muted-foreground/60">
                    Run ID: {state.lastRunId.slice(0, 8)}…
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => handleRun(agent.key)}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlayCircle className="h-4 w-4" />
                    )}
                    {isRunning ? "Running…" : "Run"}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Settings2 className="h-4 w-4" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function RunStatusBadge({
  runState,
  agentStatus,
}: {
  runState: RunState;
  agentStatus?: string;
}) {
  if (runState === "running") {
    return (
      <span className="flex items-center gap-1 text-xs rounded-full px-2 py-0.5 bg-primary/15 text-primary">
        <Loader2 className="h-3 w-3 animate-spin" />
        running
      </span>
    );
  }
  if (runState === "done") {
    return (
      <span className="flex items-center gap-1 text-xs rounded-full px-2 py-0.5 bg-emerald-500/15 text-emerald-300">
        <CheckCircle2 className="h-3 w-3" />
        done
      </span>
    );
  }
  if (runState === "error") {
    return (
      <span className="flex items-center gap-1 text-xs rounded-full px-2 py-0.5 bg-rose-500/15 text-rose-300">
        <XCircle className="h-3 w-3" />
        error
      </span>
    );
  }
  return (
    <span
      className={`text-xs rounded-full px-2 py-0.5 ${
        agentStatus === "active"
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-slate-500/25 text-slate-300"
      }`}
    >
      {agentStatus ?? "idle"}
    </span>
  );
}
