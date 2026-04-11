/**
 * Orchestrator — Neural Command OS
 *
 * Executes a routing plan produced by the intent router:
 * - Parallel agents within a stage run concurrently (Promise.all)
 * - Sequential stages run one after another
 * - Each agent is invoked via the command-center-ai edge function
 * - Results are collected into a keyed map for synthesis
 */

import { RoutingPlan, RoutingStage, SYNTHESIS_SYSTEM_PROMPT, ROUTER_MODEL } from "./intent-router.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentInvocationResult {
  agentKey: string;
  runId: string | null;
  ok: boolean;
  output: unknown;
  error?: string;
  durationMs: number;
}

export interface OrchestratorResult {
  agentOutputs: Record<string, unknown>;
  agentRunIds: string[];
  invocations: AgentInvocationResult[];
  synthesis: SynthesisResult | null;
  stagesCompleted: number;
  hadPartialFailure: boolean;
}

export interface SynthesisResult {
  headline: string;
  narrative: string;
  actions: Array<{ priority: "high" | "medium" | "low"; action: string; sourceAgent: string }>;
  nudges: Array<{ trigger: string; suggestedAction: string }>;
  riskLevel: "low" | "moderate" | "elevated" | "high";
  confidence: number;
}

// ---------------------------------------------------------------------------
// Core orchestrator
// ---------------------------------------------------------------------------

export async function executeRoutingPlan(
  plan: RoutingPlan,
  payload: Record<string, unknown>,
  businessUnitId: string | null,
  supabaseUrl: string,
  serviceKey: string,
  openAiKey: string
): Promise<OrchestratorResult> {
  const agentOutputs: Record<string, unknown> = {};
  const agentRunIds: string[] = [];
  const invocations: AgentInvocationResult[] = [];
  let stagesCompleted = 0;
  let hadPartialFailure = false;

  for (const stage of plan.stages) {
    const stageResults = await executeStage(
      stage,
      payload,
      businessUnitId,
      supabaseUrl,
      serviceKey
    );

    for (const result of stageResults) {
      invocations.push(result);
      agentOutputs[result.agentKey] = result.output;
      if (result.runId) agentRunIds.push(result.runId);
      if (!result.ok) hadPartialFailure = true;
    }

    stagesCompleted += 1;
  }

  // Synthesize all outputs into a unified response
  const synthesis = await synthesizeOutputs(
    plan,
    agentOutputs,
    openAiKey
  );

  return { agentOutputs, agentRunIds, invocations, synthesis, stagesCompleted, hadPartialFailure };
}

// ---------------------------------------------------------------------------
// Stage execution
// ---------------------------------------------------------------------------

async function executeStage(
  stage: RoutingStage,
  payload: Record<string, unknown>,
  businessUnitId: string | null,
  supabaseUrl: string,
  serviceKey: string
): Promise<AgentInvocationResult[]> {
  if (stage.mode === "parallel") {
    // All agents in this stage run concurrently
    return Promise.all(
      stage.agentKeys.map((key) =>
        invokeAgent(key, payload, businessUnitId, supabaseUrl, serviceKey)
      )
    );
  }

  // Sequential: run agents one after another
  const results: AgentInvocationResult[] = [];
  for (const key of stage.agentKeys) {
    const result = await invokeAgent(key, payload, businessUnitId, supabaseUrl, serviceKey);
    results.push(result);
  }
  return results;
}

// ---------------------------------------------------------------------------
// Agent invocation — calls the command-center-ai edge function
// ---------------------------------------------------------------------------

async function invokeAgent(
  agentKey: string,
  payload: Record<string, unknown>,
  businessUnitId: string | null,
  supabaseUrl: string,
  serviceKey: string
): Promise<AgentInvocationResult> {
  const start = Date.now();

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/command-center-ai`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agentKey, payload, businessUnitId }),
    });

    const durationMs = Date.now() - start;

    if (!res.ok) {
      const errText = await res.text();
      return {
        agentKey,
        runId: null,
        ok: false,
        output: null,
        error: `HTTP ${res.status}: ${errText.slice(0, 200)}`,
        durationMs,
      };
    }

    const data = await res.json() as {
      ok: boolean;
      runId?: string;
      output: unknown;
      error?: string;
    };

    return {
      agentKey,
      runId: data.runId ?? null,
      ok: data.ok,
      output: data.output,
      error: data.error,
      durationMs,
    };
  } catch (err) {
    return {
      agentKey,
      runId: null,
      ok: false,
      output: null,
      error: (err as Error).message ?? "Unknown error",
      durationMs: Date.now() - start,
    };
  }
}

// ---------------------------------------------------------------------------
// Synthesis — combines all agent outputs into a unified response
// ---------------------------------------------------------------------------

async function synthesizeOutputs(
  plan: RoutingPlan,
  agentOutputs: Record<string, unknown>,
  openAiKey: string
): Promise<SynthesisResult | null> {
  const successfulOutputs = Object.entries(agentOutputs).filter(([, v]) => v != null);
  if (successfulOutputs.length === 0) return null;

  const outputSummary = successfulOutputs
    .map(([key, output]) => `=== ${key} ===\n${JSON.stringify(output, null, 2)}`)
    .join("\n\n");

  const userMessage = [
    `User query intent: ${plan.intentSummary}`,
    "",
    "Agent outputs:",
    outputSummary,
    "",
    "Produce the unified synthesis JSON.",
  ].join("\n");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ROUTER_MODEL,
        messages: [
          { role: "system", content: SYNTHESIS_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json() as { choices: Array<{ message: { content: string } }> };
    return JSON.parse(data.choices[0].message.content) as SynthesisResult;
  } catch {
    return null;
  }
}
