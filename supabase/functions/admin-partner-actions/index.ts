import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, withCorsJson } from "../_shared/cors.ts";

type ActionName =
  | "approve_partner"
  | "reject_partner"
  | "request_more_info"
  | "approve_preferred_territory"
  | "reject_preferred_territory"
  | "update_verification_status"
  | "update_compliance_status"
  | "save_internal_note"
  | "refresh_contractor_links";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return withCorsJson({ error: "Missing Authorization header" }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return withCorsJson({ error: "Unauthorized" }, 401);
    }

    const { data: adminRole } = await userClient
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      return withCorsJson({ error: "Only admins can perform this action" }, 403);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const action = body?.action as ActionName;
    const partnerId = body?.partnerId as string | undefined;
    const payload = body?.payload as Record<string, unknown> | undefined;

    if (!action || !partnerId) {
      return withCorsJson({ error: "action and partnerId are required" }, 400);
    }

    let updates: Record<string, unknown> = { updated_by: user.id };

    switch (action) {
      case "approve_partner":
        updates = { ...updates, status: "approved", lifecycle_status: "approved" };
        break;
      case "reject_partner":
        updates = { ...updates, status: "rejected", lifecycle_status: "rejected" };
        break;
      case "request_more_info":
        updates = { ...updates, status: "needs_info", lifecycle_status: "needs_info" };
        break;
      case "approve_preferred_territory":
        updates = { ...updates, preferred_territory_status: "approved" };
        break;
      case "reject_preferred_territory":
        updates = { ...updates, preferred_territory_status: "rejected" };
        break;
      case "update_verification_status":
        updates = {
          ...updates,
          verification_tier: payload?.verification_tier ?? "tier-1",
        };
        break;
      case "update_compliance_status":
        updates = {
          ...updates,
          compliance_status: payload?.compliance_status ?? "in_review",
        };
        break;
      case "save_internal_note": {
        const note = `${payload?.note ?? ""}`.trim();
        const noteId = typeof payload?.note_id === "string" ? payload.note_id : null;
        if (!note) return withCorsJson({ error: "Note is required" }, 400);

        if (noteId) {
          const { error: noteUpdateError } = await serviceClient
            .from("partner_internal_notes")
            .update({ note, updated_by: user.id })
            .eq("id", noteId)
            .eq("partner_id", partnerId);
          if (noteUpdateError) return withCorsJson({ error: noteUpdateError.message }, 400);
        } else {
          const { error: noteInsertError } = await serviceClient.from("partner_internal_notes").insert({
            partner_id: partnerId,
            note,
            created_by: user.id,
            updated_by: user.id,
          });
          if (noteInsertError) return withCorsJson({ error: noteInsertError.message }, 400);
        }
        break;
      }
      case "refresh_contractor_links": {
        const { error: refreshError } = await serviceClient.rpc("refresh_partner_contractor_links", {
          target_partner_id: partnerId,
        });
        if (refreshError) return withCorsJson({ error: refreshError.message }, 400);
        break;
      }
      default:
        return withCorsJson({ error: "Unsupported action" }, 400);
    }

    if (!["save_internal_note", "refresh_contractor_links"].includes(action)) {
      const { error: updateError } = await serviceClient
        .from("partners")
        .update(updates)
        .eq("id", partnerId);
      if (updateError) return withCorsJson({ error: updateError.message }, 400);
    }

    const { error: auditError } = await serviceClient.from("partner_audit_log").insert({
      partner_id: partnerId,
      actor_id: user.id,
      action,
      details: payload ?? {},
    });

    if (auditError) {
      return withCorsJson({ error: auditError.message }, 400);
    }

    return withCorsJson({ ok: true });
  } catch (error) {
    console.error("admin-partner-actions failed", error);
    return withCorsJson({ error: "Internal server error" }, 500);
  }
});
