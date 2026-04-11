/**
 * command-center-supervisor — Neural Command OS Router
 *
 * The single intelligent entry point for Kluje's agentic platform.
 * Users send one natural language query; the supervisor handles the rest:
 *
 *   1. Classify intent from NL query (fast, structured OpenAI call)
 *   2. Build a routing plan (which agents, in what order)
 *   3. Create a supervisor_runs record
 *   4. Execute the plan (parallel stages where possible)
 *   5. Synthesize all agent outputs into a unified response
 *   6. Persist and return the full result
 *
 * POST body:
 *   {
 *     query: string,            // Natural language command ("Check my jobs for storm risk")
 *     businessUnitId?: string,  // Optional; can also be in payload
 *     payload?: object          // Extra context passed to every agent (zip, jobId, etc.)
 *   }
 *
 * Response:
 *   {
 *     ok: boolean,
 *     supervisorRunId: string,
 *     intent: string,
 *     intentSummary: string,
 *     routingPlan: RoutingPlan,
 *     agentOutputs: Record<string, unknown>,
 *     synthesis: SynthesisResult | null,
 *     agentRunIds: string[],
 *     hadPartialFailure: boolean
 *   }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, withCorsJson } from "../_shared/cors.ts";
import { classifyIntent, buildRoutingPlan } from "./intent-router.ts";
import { executeRoutingPlan } from "./orchestrator.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return withCorsJson({ error: "Method not allowed" }, 405);
  }

  // ---------------------------------------------------------------------------
  // 1. Parse request
  // ---------------------------------------------------------------------------
  let body: { query?: string; businessUnitId?: string; payload?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return withCorsJson({ error: "Invalid JSON body" }, 400);
  }

  const { query, payload = {}, businessUnitId } = body;

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return withCorsJson({ error: "query is required and must be a non-empty string" }, 400);
  }

  // ---------------------------------------------------------------------------
  // 2. Bootstrap env
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

  // Resolve businessUnitId (body > payload)
  const resolvedBusinessUnitId: string | null =
    businessUnitId ?? (payload.businessUnitId as string | undefined) ?? null;

  // Resolve caller user from JWT (optional)
  let callerUserId: string | null = null;
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (jwt) {
    const { data } = await supabase.auth.getUser(jwt);
    callerUserId = data?.user?.id ?? null;
  }

  // ---------------------------------------------------------------------------
  // 3. Classify intent
  // ---------------------------------------------------------------------------
  const classification = await classifyIntent(openAiKey, query.trim());
  const routingPlan = buildRoutingPlan(classification);

  // ---------------------------------------------------------------------------
  // 4. Create supervisor run record
  // ---------------------------------------------------------------------------
  const { data: runRecord } = await supabase
    .from("supervisor_runs")
    .insert({
      business_unit_id: resolvedBusinessUnitId,
      query: query.trim(),
      intent: routingPlan.intent,
      routing_plan: routingPlan.stages,
      status: "running",
      model: "gpt-4.1-mini",
      created_by: callerUserId,
    })
    .select("id")
    .single();

  const supervisorRunId: string = runRecord?.id ?? crypto.randomUUID();

  // ---------------------------------------------------------------------------
  // 5. Execute routing plan
  // ---------------------------------------------------------------------------
  const orchestratorResult = await executeRoutingPlan(
    routingPlan,
    { ...payload, businessUnitId: resolvedBusinessUnitId },
    resolvedBusinessUnitId,
    supabaseUrl,
    serviceKey,
    openAiKey
  );

  // ---------------------------------------------------------------------------
  // 6. Persist results
  // ---------------------------------------------------------------------------
  const finalStatus = orchestratorResult.hadPartialFailure
    ? "partial"
    : orchestratorResult.stagesCompleted === routingPlan.stages.length
    ? "succeeded"
    : "failed";

  await supabase
    .from("supervisor_runs")
    .update({
      agent_run_ids: orchestratorResult.agentRunIds,
      agent_outputs: orchestratorResult.agentOutputs,
      synthesis: orchestratorResult.synthesis,
      status: finalStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", supervisorRunId);

  // ---------------------------------------------------------------------------
  // 7. Return unified response
  // ---------------------------------------------------------------------------
  return withCorsJson({
    ok: finalStatus !== "failed",
    supervisorRunId,
    intent: routingPlan.intent,
    intentSummary: routingPlan.intentSummary,
    routingPlan,
    agentOutputs: orchestratorResult.agentOutputs,
    synthesis: orchestratorResult.synthesis,
    agentRunIds: orchestratorResult.agentRunIds,
    hadPartialFailure: orchestratorResult.hadPartialFailure,
    nudges: routingPlan.nudges,
  }, finalStatus === "failed" ? 500 : 200);
});
