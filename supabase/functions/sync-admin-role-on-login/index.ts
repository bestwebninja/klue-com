import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, withCorsJson } from "../_shared/cors.ts";

const ADMIN_ALLOWLIST = [
  "divitiae.terrae.llc@gmail.com",
  "marcus@kluje.com",
  "marcusmommsen@gmail.com",
] as const;

type SyncAdminRoleBody = {
  userId?: string;
  email?: string | null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, email }: SyncAdminRoleBody = await req.json();

    if (!userId) {
      return withCorsJson({ error: "userId is required" }, 400);
    }

    const normalizedEmail = email?.trim().toLowerCase() ?? null;

    if (!normalizedEmail || !ADMIN_ALLOWLIST.includes(normalizedEmail as typeof ADMIN_ALLOWLIST[number])) {
      return withCorsJson({ ok: true, granted: false });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

    if (error) {
      throw error;
    }

    return withCorsJson({ ok: true, granted: true });
  } catch (error) {
    console.error("sync-admin-role-on-login error:", error);
    return withCorsJson({ ok: false, error: String(error) }, 500);
  }
});
