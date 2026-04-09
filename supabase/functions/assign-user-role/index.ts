import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, withCorsJson } from "../_shared/cors.ts";

type AssignUserRoleBody = {
  userId?: string;
  role?: "admin" | "moderator" | "user" | "provider";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return withCorsJson({ error: "Missing Authorization header" }, 401);
    }

    const userScopedClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await userScopedClient.auth.getUser();

    if (userError || !user) {
      return withCorsJson({ error: "Unauthorized" }, 401);
    }

    const { data: adminRole, error: roleReadError } = await userScopedClient
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleReadError) {
      return withCorsJson({ error: "Failed to verify caller role" }, 403);
    }

    if (!adminRole) {
      return withCorsJson({ error: "Only admins can assign roles" }, 403);
    }

    const body = (await req.json()) as AssignUserRoleBody;
    const userId = body.userId;
    const role = body.role;

    if (!userId || !role) {
      return withCorsJson({ error: "userId and role are required" }, 400);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: assignError } = await serviceClient.rpc("assign_user_role", {
      target_user_id: userId,
      target_role: role,
    });

    if (assignError) {
      return withCorsJson({ error: assignError.message }, 400);
    }

    return withCorsJson({ ok: true });
  } catch (error) {
    console.error("assign-user-role failed", error);
    return withCorsJson({ error: "Internal server error" }, 500);
  }
});
