import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { agentKey, payload } = await req.json();
    if (!agentKey || typeof payload !== "object") return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), { status: 503 });

    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openAiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4.1-mini", input: `Agent: ${agentKey}\nPayload: ${JSON.stringify(payload)}`, text: { format: { type: "json_object" } } }),
    });
    const result = await aiResponse.json();

    await supabase.from("ai_agent_runs").insert({ agent_key: agentKey, status: aiResponse.ok ? "succeeded" : "failed", input_payload: payload, output_payload: result });
    return new Response(JSON.stringify({ ok: aiResponse.ok, result }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
});
