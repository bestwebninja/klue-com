import { Router } from "express";
import { z } from "zod";
import { fetchZipIntelligence } from "../services/zip-intelligence";
import { hasSupabaseAdmin, supabaseAdmin } from "../services/supabase-admin";
import { resolveSupabaseUser } from "../services/supabase-session";

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  companyName: z.string().trim().min(1),
  serviceType: z.string().trim().min(1),
  zipCode: z.string().trim().regex(/^\d{5}$/)
});

const patchProfileSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  companyName: z.string().trim().min(1).optional(),
  serviceType: z.string().trim().min(1).optional(),
  zipCode: z.string().trim().regex(/^\d{5}$/).optional(),
  phone: z.string().trim().optional(),
  coverageRadiusMiles: z.number().int().min(1).max(500).optional()
});


const quoteIntakeSchema = z.object({
  clientName: z.string().trim().min(1),
  projectAddress: z.string().trim().min(1),
  zipCode: z.string().trim().regex(/^\d{5}$/),
  phone: z.string().trim().min(1),
  email: z.string().email(),
  builder: z.string().trim().min(1),
  projectDate: z.string().trim().optional().default(""),
  realtorContact: z.string().trim().optional().default(""),
  attorneyEmail: z.string().trim().optional().default(""),
  selectedSupplier: z.string().trim().optional().default("Default Supplier Network"),
  selectedMaterials: z.array(z.string()).default([]),
  sections: z.record(z.object({ checked: z.boolean(), note: z.string() })),
  textFields: z.record(z.string()),
  weatherSummary: z.string().optional().default(""),
  workflowFlags: z.object({
    requestFinanceNow: z.boolean().default(false),
    notifyRealtor: z.boolean().default(false),
    generateEsignAfterAcceptance: z.boolean().default(true)
  })
});

const costPreviewSchema = z.object({
  supplier: z.string().trim().min(1),
  zipCode: z.string().trim().regex(/^\d{5}$/),
  selectedMaterials: z.array(z.string()).default([]),
  projectScope: z.string().trim().min(1)
});

const supplierBaseRates: Record<string, number> = {
  "Default Supplier Network": 12500,
  "Builder First Supply": 13200,
  "Kona Preferred Warehouse": 14100
};

const normalizeServiceTypeKey = (serviceType: string) =>
  serviceType.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "subcontractor-default";

const resolveTemplateKey = (serviceType: string) => {
  const normalized = serviceType.toLowerCase();
  if (normalized.includes("general contractor")) return "general-contractor";
  if (normalized.includes("hvac")) return "hvac";
  if (normalized.includes("plumb")) return "plumbing";
  if (normalized.includes("electr")) return "electrical";
  if (normalized.includes("roof")) return "roofing";
  if (normalized.includes("paint")) return "painting";
  if (normalized.includes("carpent")) return "carpentry";
  return "subcontractor-default";
};

const ensureAdmin = () => {
  if (!hasSupabaseAdmin || !supabaseAdmin) return null;
  return supabaseAdmin;
};

router.post("/signup", async (req, res, next) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const admin = ensureAdmin();
    if (!admin) {
      return res.status(500).json({ error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required" });
    }

    const { email, password, firstName, lastName, companyName, serviceType, zipCode } = parsed.data;
    const locationPayload = await fetchZipIntelligence(zipCode);
    const location = locationPayload.location;
    const templateKey = resolveTemplateKey(serviceType);

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        company_name: companyName,
        selected_services: [serviceType],
        service_type_label: serviceType,
        zip_code: zipCode,
        city: location.city,
        state: location.state,
        county: location.county,
        lat: location.latitude,
        lng: location.longitude,
        contractor_type: templateKey === "general-contractor" ? "general" : "sub"
      }
    });

    if (authError || !authData.user) {
      return res.status(400).json({ error: authError?.message ?? "Failed to create auth user" });
    }

    return res.status(201).json({
      userId: authData.user.id,
      dashboardTemplateKey: templateKey,
      location: {
        zipCode,
        city: location.city,
        state: location.state,
        county: location.county,
        lat: location.latitude,
        lng: location.longitude
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/profile/bootstrap", async (req, res, next) => {
  try {
    const admin = ensureAdmin();
    if (!admin) return res.status(500).json({ error: "SUPABASE admin unavailable" });

    const { user, error } = await resolveSupabaseUser(req);
    if (!user || error) return res.status(401).json({ error: "Unauthorized" });

    const [{ data: profile }, { data: preferences }, { data: template }] = await Promise.all([
      admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      admin.from("user_dashboard_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      admin.from("dashboard_templates").select("*").eq("key", (user.user_metadata?.dashboard_template_key as string) || "subcontractor-default").maybeSingle()
    ]);

    const zipCode = profile?.zip_code as string | null;
    const { data: geo } = zipCode
      ? await admin.from("geo_intelligence").select("*").eq("zip_code", zipCode).maybeSingle()
      : { data: null };

    return res.json({ profile, preferences, template, geoIntelligence: geo });
  } catch (error) {
    return next(error);
  }
});

router.patch("/profile", async (req, res, next) => {
  try {
    const parsed = patchProfileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const admin = ensureAdmin();
    if (!admin) return res.status(500).json({ error: "SUPABASE admin unavailable" });

    const { user, error } = await resolveSupabaseUser(req);
    if (!user || error) return res.status(401).json({ error: "Unauthorized" });

    const patch = parsed.data;
    let location = null as null | Awaited<ReturnType<typeof fetchZipIntelligence>>["location"];

    if (patch.zipCode) {
      const payload = await fetchZipIntelligence(patch.zipCode);
      location = payload.location;
    }

    const serviceTypeLabel = patch.serviceType;
    const serviceTypeKey = serviceTypeLabel ? normalizeServiceTypeKey(serviceTypeLabel) : undefined;
    const templateKey = serviceTypeLabel ? resolveTemplateKey(serviceTypeLabel) : undefined;

    const profilePatch = {
      first_name: patch.firstName,
      last_name: patch.lastName,
      full_name: patch.firstName || patch.lastName ? `${patch.firstName ?? ""} ${patch.lastName ?? ""}`.trim() : undefined,
      company_name: patch.companyName,
      phone: patch.phone,
      service_type_label: serviceTypeLabel,
      service_type_key: serviceTypeKey,
      services_offered: serviceTypeLabel ? [serviceTypeLabel] : undefined,
      zip_code: patch.zipCode,
      city: location?.city,
      state: location?.state,
      county: location?.county,
      lat: location?.latitude,
      lng: location?.longitude,
      latitude: location?.latitude,
      longitude: location?.longitude,
      coverage_radius_miles: patch.coverageRadiusMiles,
      dashboard_template_key: templateKey
    };

    const { data, error: updateError } = await admin
      .from("profiles")
      .update(profilePatch)
      .eq("id", user.id)
      .select("*")
      .single();

    if (updateError) return res.status(400).json({ error: updateError.message });

    if (templateKey) {
      await admin.from("user_dashboard_preferences").upsert({
        user_id: user.id,
        template_key: templateKey
      });
    }

    return res.json({ profile: data, dashboardTemplateKey: templateKey });
  } catch (error) {
    return next(error);
  }
});

router.get("/dashboard/config", async (req, res, next) => {
  try {
    const admin = ensureAdmin();
    if (!admin) return res.status(500).json({ error: "SUPABASE admin unavailable" });

    const { user, error } = await resolveSupabaseUser(req);
    if (!user || error) return res.status(401).json({ error: "Unauthorized" });

    const [{ data: profile }, { data: preferences }] = await Promise.all([
      admin.from("profiles").select("dashboard_template_key").eq("id", user.id).single(),
      admin.from("user_dashboard_preferences").select("*").eq("user_id", user.id).maybeSingle()
    ]);

    const templateKey = preferences?.template_key || profile?.dashboard_template_key || "subcontractor-default";
    const { data: template } = await admin.from("dashboard_templates").select("*").eq("key", templateKey).maybeSingle();

    return res.json({ template, preferences });
  } catch (error) {
    return next(error);
  }
});


router.post("/quote-intake/cost-preview", async (req, res, next) => {
  try {
    const parsed = costPreviewSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { supplier, selectedMaterials, projectScope } = parsed.data;
    const base = supplierBaseRates[supplier] ?? 13500;
    const materialMultiplier = 1 + selectedMaterials.length * 0.045;
    const scopeMultiplier = Math.max(1, Math.min(1.35, projectScope.length / 100));

    const totalLow = Math.round(base * materialMultiplier * scopeMultiplier);
    const totalHigh = Math.round(totalLow * 1.18);

    return res.json({
      supplier,
      totalLow,
      totalHigh,
      pricingTimestamp: new Date().toISOString(),
      pricingWindow: "Real-time target with 24h fallback",
      source: "supplier-feed-placeholder"
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/quote-intake", async (req, res, next) => {
  try {
    const parsed = quoteIntakeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const admin = ensureAdmin();
    if (!admin) return res.status(500).json({ error: "SUPABASE admin unavailable" });

    const authResolution = await resolveSupabaseUser(req);
    const requesterUserId = authResolution.user?.id ?? null;

    const { data, error } = await admin
      .from("contractor_quote_intakes")
      .insert({
        requester_user_id: requesterUserId,
        client_name: parsed.data.clientName,
        project_address: parsed.data.projectAddress,
        zip_code: parsed.data.zipCode,
        phone: parsed.data.phone,
        email: parsed.data.email,
        builder_name: parsed.data.builder,
        project_date: parsed.data.projectDate || null,
        realtor_contact: parsed.data.realtorContact || null,
        attorney_email: parsed.data.attorneyEmail || null,
        selected_supplier: parsed.data.selectedSupplier,
        selected_materials: parsed.data.selectedMaterials,
        checklist_json: parsed.data.sections,
        text_fields_json: parsed.data.textFields,
        weather_summary: parsed.data.weatherSummary,
        workflow_flags_json: parsed.data.workflowFlags,
        status: "draft"
      })
      .select("id, created_at")
      .single();

    if (error || !data) return res.status(400).json({ error: error?.message ?? "Could not save quote intake" });

    await admin.from("contractor_quote_workflow_events").insert([
      {
        quote_intake_id: data.id,
        event_type: "QUOTE_CREATED",
        event_payload_json: {
          channel: "internal",
          action: "awaiting_review"
        }
      },
      {
        quote_intake_id: data.id,
        event_type: "REQUEST_FINANCE_OPTION",
        event_payload_json: {
          requested: parsed.data.workflowFlags.requestFinanceNow
        }
      },
      {
        quote_intake_id: data.id,
        event_type: "ESIGN_FLOW_READY",
        event_payload_json: {
          enabled: parsed.data.workflowFlags.generateEsignAfterAcceptance,
          attorney_email: parsed.data.attorneyEmail || null
        }
      }
    ]);

    return res.status(201).json({
      quoteIntakeId: data.id,
      status: "draft",
      createdAt: data.created_at
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/geo-intelligence", async (req, res, next) => {
  try {
    const zipCode = z.string().regex(/^\d{5}$/).parse(req.query.zipCode);

    const admin = ensureAdmin();
    if (!admin) return res.status(500).json({ error: "SUPABASE admin unavailable" });

    const [{ data: cached }, freshPayload] = await Promise.all([
      admin.from("geo_intelligence").select("*").eq("zip_code", zipCode).maybeSingle(),
      fetchZipIntelligence(zipCode)
    ]);

    if (!cached) {
      await admin.from("geo_intelligence").upsert({
        zip_code: zipCode,
        weather_summary_json: freshPayload.weather,
        crime_summary_json: freshPayload.crime,
        weather_refreshed_at: new Date().toISOString(),
        crime_refreshed_at: new Date().toISOString()
      });
    }

    return res.json({
      zipCode,
      weather: cached?.weather_summary_json ?? freshPayload.weather,
      crime: cached?.crime_summary_json ?? freshPayload.crime,
      refreshedAt: cached?.updated_at ?? new Date().toISOString(),
      cacheStatus: cached ? "hit" : "miss"
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/internal/geo-intelligence/refresh", async (req, res, next) => {
  try {
    const zipCode = z.string().regex(/^\d{5}$/).parse(req.body.zipCode);

    const admin = ensureAdmin();
    if (!admin) return res.status(500).json({ error: "SUPABASE admin unavailable" });

    const payload = await fetchZipIntelligence(zipCode);
    const now = new Date().toISOString();
    await admin.from("geo_intelligence").upsert({
      zip_code: zipCode,
      weather_summary_json: payload.weather,
      crime_summary_json: payload.crime,
      weather_refreshed_at: now,
      crime_refreshed_at: now,
      updated_at: now
    });

    return res.json({ ok: true, zipCode, refreshedAt: now });
  } catch (error) {
    return next(error);
  }
});

export default router;
