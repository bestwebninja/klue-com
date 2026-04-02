import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_ADMIN_ALLOWLIST = ["divitiae.terrae.llc@gmail.com", "marcus@kluje.com"];

const resolveAdminAllowlist = (): string[] => {
  const configured = Deno.env.get("ADMIN_ALLOWLIST_EMAILS");
  if (!configured) return DEFAULT_ADMIN_ALLOWLIST;

  return configured
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

// Only these emails can ever be granted admin via this function.
const ADMIN_EMAILS = resolveAdminAllowlist();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const results: Record<string, string> = {};

    // List all users and match by email (service role required)
    const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) throw new Error(`Cannot list users: ${listErr.message}`);

    for (const email of ADMIN_EMAILS) {
      const user = usersData.users.find((u) => u.email?.toLowerCase() === email);
      if (!user) {
        results[email] = "not signed up yet";
        continue;
      }

      const { error: upsertErr } = await supabase
        .from("user_roles")
        .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });

      results[email] = upsertErr ? `error: ${upsertErr.message}` : "admin role granted";
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
