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
      dbaName,
      contactName,
      contactTitle,
      email,
      phone,
      website,
      state,
      city,
      zip,
      addressLine1,
      addressLine2,
      entityType,
      partnershipType,
      budgetBand,
      campaignGoals,
      targetMarkets,
      launchTimeline,
      primaryTerritory,
      categories,
      feedType,
      preferredRequested,
      licenseNumber,
      licenseState,
      insuranceCarrier,
      insurancePolicy,
      implementationNotes,
    } = body ?? {};

    if (!organizationName || !contactName || !email || !phone || !partnershipType) {
      return withCorsJson({ error: "Missing required signup fields" }, 400);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const normalizedCategories = Array.isArray(categories)
      ? categories.filter((category) => typeof category === "string" && category.trim().length > 0)
      : [];

    const requestedPreferred = preferredRequested === true;

    const { data: partner, error: partnerError } = await serviceClient
      .from("partners")
      .insert({
        created_by: user?.id ?? null,
        updated_by: user?.id ?? null,
        partner_type: partnershipType,
        entity_type: entityType ?? "business",
        offer_type: budgetBand ?? null,
        legal_business_name: organizationName,
        dba_name: dbaName ?? null,
        contact_name: contactName,
        email,
        phone,
        website: website ?? null,
        state: state ?? null,
        city: city ?? null,
        zip: zip ?? null,
        primary_territory: primaryTerritory ?? null,
        target_markets: targetMarkets ?? null,
        launch_timeline: launchTimeline ?? null,
        campaign_goals: campaignGoals ?? null,
        preferred_requested: requestedPreferred,
        preferred_territory_status: requestedPreferred ? "under_review" : "not_requested",
        feed_type: feedType ?? null,
        feed_status: feedType && feedType !== "none" ? "pending" : "not_connected",
        status: "submitted",
        lifecycle_status: "submitted",
        source: "partner_signup",
        metadata: {
          contact_title: contactTitle ?? null,
          implementation_notes: implementationNotes ?? null,
          categories: normalizedCategories,
        },
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
      title: contactTitle ?? null,
    });

    if (addressLine1 || city || state || zip) {
      await serviceClient.from("partner_addresses").insert({
        partner_id: partner.id,
        address_type: "headquarters",
        line1: addressLine1 ?? null,
        line2: addressLine2 ?? null,
        city: city ?? null,
        state: state ?? null,
        zip: zip ?? null,
      });
    }

    if (primaryTerritory) {
      await serviceClient.from("partner_territories").insert({
        partner_id: partner.id,
        territory_label: primaryTerritory,
        territory_state: state ?? null,
        territory_city: city ?? null,
        territory_zip: zip ?? null,
        is_primary: true,
        is_preferred: requestedPreferred,
      });
    }

    if (normalizedCategories.length > 0) {
      const categoryRows = normalizedCategories.map((category) => ({
        partner_id: partner.id,
        category,
        source: "signup",
      }));
      await serviceClient.from("partner_categories").insert(categoryRows);
    }

    await serviceClient.from("partner_verifications").upsert({
      partner_id: partner.id,
      verification_tier: "tier-0",
      identity_verified: false,
      business_verified: false,
      license_verified: false,
      insurance_verified: false,
    });

    if (licenseNumber || licenseState) {
      await serviceClient.from("partner_license_records").insert({
        partner_id: partner.id,
        license_number: licenseNumber ?? null,
        issuing_state: licenseState ?? null,
        status: "pending",
      });
    }

    if (insuranceCarrier || insurancePolicy) {
      await serviceClient.from("partner_insurance_records").insert({
        partner_id: partner.id,
        carrier_name: insuranceCarrier ?? null,
        policy_number: insurancePolicy ?? null,
        status: "pending",
      });
    }

    if (feedType && feedType !== "none") {
      await serviceClient.from("partner_feed_connections").insert({
        partner_id: partner.id,
        feed_type: feedType,
        connection_status: "pending",
        metadata: {
          source: "partner_signup",
          implementation_notes: implementationNotes ?? null,
        },
      });
    }

    if (requestedPreferred) {
      await serviceClient.from("preferred_partner_applications").insert({
        partner_id: partner.id,
        requested_by: user?.id ?? null,
        request_notes: implementationNotes ?? null,
        status: "under_review",
      });
    }

    await serviceClient.from("partner_audit_log").insert({
      partner_id: partner.id,
      actor_id: user?.id ?? null,
      action: "signup_submitted",
      details: {
        source: "partner_signup",
        categories_count: normalizedCategories.length,
        preferred_requested: requestedPreferred,
      },
    });

    return withCorsJson({ ok: true, partnerId: partner.id });
  } catch (error) {
    console.error("submit-partner-signup failed", error);
    return withCorsJson({ error: "Internal server error" }, 500);
  }
});
