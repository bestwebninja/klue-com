/**
 * command-center-ai — Kluje ReAct Agent Executor
 *
 * Replaces the single-shot OpenAI passthrough with a full ReAct loop:
 *   1. Validates request (agentKey, payload, businessUnitId)
 *   2. Looks up agent config (system prompt + allowed tools)
 *   3. Creates an ai_agent_runs record with status=running
 *   4. Runs the ReAct loop (Reason → Act → Observe, up to 8 iterations)
 *   5. Persists the result (output, reasoning steps, iteration count)
 *   6. Returns structured response to the caller
 *
 * POST body:
 *   { agentKey: string, payload: object, businessUnitId?: string }
 *
 * Response:
 *   { ok: boolean, runId: string, output: object, steps: ReActStep[], iterationCount: number }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, withCorsJson } from "../_shared/cors.ts";
import { getAgentConfig } from "./agent-config.ts";
import { executeTool, getToolDefinitions, ToolContext } from "./tools.ts";
import { runReActLoop } from "./react-loop.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return withCorsJson({ error: "Method not allowed" }, 405);
  }

  // ---------------------------------------------------------------------------
  // 1. Parse & validate request
  // ---------------------------------------------------------------------------
  let body: { agentKey?: string; payload?: Record<string, unknown>; businessUnitId?: string };
  try {
    body = await req.json();
  } catch {
    return withCorsJson({ error: "Invalid JSON body" }, 400);
  }

  const { agentKey, payload, businessUnitId } = body;

  if (!agentKey || typeof agentKey !== "string") {
    return withCorsJson({ error: "agentKey is required" }, 400);
  }
  if (!payload || typeof payload !== "object") {
    return withCorsJson({ error: "payload must be a non-null object" }, 400);
  }

  // ---------------------------------------------------------------------------
  // 2. Look up agent config
  // ---------------------------------------------------------------------------
  const agentConfig = getAgentConfig(agentKey);
  if (!agentConfig) {
    return withCorsJson({ error: `Unknown agent: ${agentKey}` }, 404);
  }

  // ---------------------------------------------------------------------------
  // 3. Bootstrap Supabase client
  // ---------------------------------------------------------------------------
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const openAiKey = Deno.env.get("OPENAI_API_KEY");

  if (!supabaseUrl || !serviceKey) {
    return withCorsJson({ error: "Supabase environment not configured" }, 503);
  }
  if (!openAiKey) {
    return withCorsJson({ error: "OPENAI_API_KEY not configured" }, 503);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Resolve businessUnitId — accept from payload or body
  const resolvedBusinessUnitId: string | null =
    businessUnitId ??
    (payload.businessUnitId as string | undefined) ??
    null;

  // ---------------------------------------------------------------------------
  // 4. Resolve the calling user from JWT (optional — for audit trail)
  // ---------------------------------------------------------------------------
  let callerUserId: string | null = null;
  const authHeader = req.headers.get("authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (jwt) {
    const { data: userData } = await supabase.auth.getUser(jwt);
    callerUserId = userData?.user?.id ?? null;
  }

  // ---------------------------------------------------------------------------
  // 5. Create run record with status=running
  // ---------------------------------------------------------------------------
  const { data: runRecord, error: runInsertError } = await supabase
    .from("ai_agent_runs")
    .insert({
      agent_key: agentKey,
      business_unit_id: resolvedBusinessUnitId,
      status: "running",
      input_payload: payload,
      created_by: callerUserId,
      model: "gpt-4.1-mini",
    })
    .select("id")
    .single();

  if (runInsertError || !runRecord) {
    // Non-fatal: proceed even if logging fails, but surface the warning
    console.warn("Failed to create run record:", runInsertError?.message);
  }

  const runId: string = runRecord?.id ?? crypto.randomUUID();

  // ---------------------------------------------------------------------------
  // 6. Build tool context and executor
  // ---------------------------------------------------------------------------
  const toolCtx: ToolContext = {
    supabase,
    businessUnitId: resolvedBusinessUnitId ?? "00000000-0000-0000-0000-000000000000",
  };

  const toolDefs = getToolDefinitions(agentConfig.allowedTools);

  // Build a user message from the payload — give the model full context
  const userMessage = buildUserMessage(agentKey, payload, resolvedBusinessUnitId);

  // ---------------------------------------------------------------------------
  // 7. Run the ReAct loop
  // ---------------------------------------------------------------------------
  const loopResult = await runReActLoop(
    openAiKey,
    agentConfig.systemPrompt,
    userMessage,
    toolDefs,
    (name, args) => executeTool(name, args, toolCtx)
  );

  // ---------------------------------------------------------------------------
  // 8. Persist results
  // ---------------------------------------------------------------------------
  const finalStatus =
    loopResult.finishReason === "error" ? "failed" : "succeeded";

  const { error: updateError } = await supabase
    .from("ai_agent_runs")
    .update({
      status: finalStatus,
      output_payload: loopResult.output ?? {},
      error_message: loopResult.error ?? null,
      reasoning_steps: loopResult.steps,
      model: loopResult.model,
      iteration_count: loopResult.iterationCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", runId);

  if (updateError) {
    console.warn("Failed to update run record:", updateError.message);
  }

  // ---------------------------------------------------------------------------
  // 9. Return response
  // ---------------------------------------------------------------------------
  const ok = finalStatus === "succeeded";
  return withCorsJson({
    ok,
    runId,
    agentKey,
    output: loopResult.output,
    iterationCount: loopResult.iterationCount,
    finishReason: loopResult.finishReason,
    steps: loopResult.steps,
    ...(loopResult.error ? { error: loopResult.error } : {}),
  }, ok ? 200 : 500);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildUserMessage(
  agentKey: string,
  payload: Record<string, unknown>,
  businessUnitId: string | null
): string {
  const lines: string[] = [
    `Run agent: ${agentKey}`,
    `Business Unit ID: ${businessUnitId ?? "not provided"}`,
    "",
    "Input context:",
    JSON.stringify(payload, null, 2),
    "",
    "Use your available tools to gather data, reason through the findings, and produce a structured JSON answer matching the output schema in your instructions.",
  ];
  return lines.join("\n");
}
