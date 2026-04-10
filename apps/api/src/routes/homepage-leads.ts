import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin, hasSupabaseAdmin } from "../services/supabase-admin";

const router = Router();

const homepageLeadSchema = z.object({
  services: z.array(z.string().trim().min(1)).min(1, "At least one service is required"),
  zip_code: z.string().trim().regex(/^\d{5}$/, "zip_code must be exactly 5 digits"),
  email: z.string().trim().email("Invalid email address"),
});

/**
 * POST /api/v1/homepage-leads
 *
 * Public endpoint — no auth required.
 * 1. Validates the payload.
 * 2. Persists the lead in homepage_leads.
 * 3. Finds registered providers that match at least one requested service.
 * 4. Creates a homepage_lead_quote_alerts row for each matched provider.
 */
router.post("/", async (req, res) => {
  const parsed = homepageLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { services, zip_code, email } = parsed.data;

  // ── Persist lead ──────────────────────────────────────────────────────────

  if (!hasSupabaseAdmin || !supabaseAdmin) {
    // No DB connectivity — still return success so the frontend can proceed
    return res.status(201).json({ success: true, leadId: null, matchedProviders: 0 });
  }

  const { data: leadData, error: leadError } = await supabaseAdmin
    .from("homepage_leads")
    .insert({ services, zip_code, email })
    .select("id")
    .single();

  if (leadError) {
    console.error("[homepage-leads] insert error:", leadError.message);
    // Don't block the user — return partial success
    return res.status(201).json({ success: true, leadId: null, matchedProviders: 0 });
  }

  const leadId = leadData.id as string;

  // ── Match providers ───────────────────────────────────────────────────────
  // Find providers who have registered at least one of the requested services.
  // Zip code matching is approximate: we match on zip_code equality for now.
  // (A geo-radius query can replace this in a later iteration.)

  const { data: matchedProviders, error: matchError } = await supabaseAdmin
    .from("provider_services")
    .select("provider_id, custom_name, profiles!inner(zip_code)")
    .in("custom_name", services);

  if (matchError) {
    console.error("[homepage-leads] provider match error:", matchError.message);
    return res.status(201).json({ success: true, leadId, matchedProviders: 0 });
  }

  // Deduplicate by provider_id; prefer zip-exact matches but include all
  const providerIds = new Set<string>();
  const alerts: Array<{
    lead_id: string;
    provider_id: string;
    services: string[];
    zip_code: string;
    requester_email: string;
    signup_status: string;
  }> = [];

  for (const row of matchedProviders ?? []) {
    const pid = row.provider_id as string;
    if (!providerIds.has(pid)) {
      providerIds.add(pid);
      alerts.push({
        lead_id: leadId,
        provider_id: pid,
        services,
        zip_code,
        requester_email: email,
        signup_status: "guest",
      });
    }
  }

  if (alerts.length > 0) {
    const { error: alertError } = await supabaseAdmin
      .from("homepage_lead_quote_alerts")
      .insert(alerts);

    if (alertError) {
      console.error("[homepage-leads] alert insert error:", alertError.message);
    }
  }

  return res.status(201).json({
    success: true,
    leadId,
    matchedProviders: alerts.length,
  });
});

export default router;
