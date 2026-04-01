Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  return new Response(JSON.stringify({ status: "ready_placeholder", sessionId: crypto.randomUUID(), note: "Wire realtime voice backend before production." }), { headers: { "Content-Type": "application/json" } });
});
