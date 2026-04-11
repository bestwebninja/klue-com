import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, withCorsJson } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    let user: { id: string } | null = null;

    if (authHeader) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );

      const {
        data: { user: authUser },
      } = await userClient.auth.getUser();

      user = authUser ? { id: authUser.id } : null;
    }

    const body = await req.json();
    const {
      organizationName,
      contactName,
      email,
      phone,
      website,
      partnershipType,
      budgetBand,
      campaignGoals,
      targetMarkets,
      launchTimeline,
    } = body ?? {};

    if (!organizationName || !contactName || !email || !phone || !partnershipType) {
      return withCorsJson({ error: "Missing required signup fields" }, 400);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: partner, error: partnerError } = await serviceClient
      .from("partners")
      .insert({
        created_by: user?.id ?? null,
        updated_by: user?.id ?? null,
        partner_type: partnershipType,
        entity_type: "business",
        offer_type: budgetBand ?? null,
        legal_business_name: organizationName,
        contact_name: contactName,
        email,
        phone,
        website: website ?? null,
        target_markets: targetMarkets ?? null,
        launch_timeline: launchTimeline ?? null,
        campaign_goals: campaignGoals ?? null,
        preferred_requested: false,
        status: "submitted",
        lifecycle_status: "submitted",
      })
      .select("id")
      .single();

    if (partnerError || !partner) {
      return withCorsJson({ error: partnerError?.message ?? "Could not create partner" }, 400);
    }

    await serviceClient.from("partner_contacts").insert({
      partner_id: partner.id,
      contact_type: "primary",
      name: contactName,
      email,
      phone,
    });

    await serviceClient.from("partner_audit_log").insert({
      partner_id: partner.id,
      actor_id: user?.id ?? null,
      action: "signup_submitted",
      details: { source: "partner_signup" },
    });

    return withCorsJson({ ok: true, partnerId: partner.id });
  } catch (error) {
    console.error("submit-partner-signup failed", error);
    return withCorsJson({ error: "Internal server error" }, 500);
  }
});
