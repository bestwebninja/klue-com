/**
 * Tool definitions and implementations for the ReAct agent loop.
 *
 * Each tool has:
 *   - An OpenAI-compatible function definition (for the model to call)
 *   - An execute() implementation (runs against Supabase or external APIs)
 *
 * Tools are scoped to a business_unit_id so all data access is tenant-isolated.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export interface ToolContext {
  supabase: SupabaseClient;
  businessUnitId: string;
}

export type ToolResult = Record<string, unknown> | unknown[] | string | null;

// ---------------------------------------------------------------------------
// Tool definitions (sent to the model)
// ---------------------------------------------------------------------------

export const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  list_jobs: {
    type: "function",
    function: {
      name: "list_jobs",
      description:
        "List active construction jobs for the business unit. Returns job IDs, descriptions, statuses, and ZIP codes.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of jobs to return (default 20, max 50).",
          },
        },
      },
    },
  },

  list_quotes: {
    type: "function",
    function: {
      name: "list_quotes",
      description:
        "List quotes and draw requests for the business unit. Returns quote IDs, amounts, line items, and status.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of quotes to return (default 20, max 50).",
          },
        },
      },
    },
  },

  get_risk_score: {
    type: "function",
    function: {
      name: "get_risk_score",
      description:
        "Retrieve the most recent area risk score for the business unit. Returns overall score, band (low/moderate/elevated/high), and individual risk factors: weatherDisruption, permitVolatility, logisticsFriction, marketVolatility, safetyLossExposure, collectionsRiskProxy.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },

  get_benchmarks: {
    type: "function",
    function: {
      name: "get_benchmarks",
      description:
        "Retrieve benchmark snapshot metrics for the business unit (e.g. avg_job_value, avg_draw_amount, on_time_completion_rate). Use these to detect deviations in quotes and job performance.",
      parameters: {
        type: "object",
        properties: {
          metricKeys: {
            type: "array",
            items: { type: "string" },
            description:
              "Specific metric keys to retrieve. Omit to get all available benchmarks.",
          },
        },
      },
    },
  },

  list_documents: {
    type: "function",
    function: {
      name: "list_documents",
      description:
        "List uploaded documents for the business unit (permits, quotes, draw requests, inspection reports, title commitments, etc.).",
      parameters: {
        type: "object",
        properties: {
          kind: {
            type: "string",
            description:
              "Filter by document kind: quote, permit, draw_request, title_commitment, closing_disclosure, inspection, other.",
          },
        },
      },
    },
  },

  get_document_entities: {
    type: "function",
    function: {
      name: "get_document_entities",
      description:
        "Retrieve extracted entities (addresses, dates, amounts, parties, license numbers) from a specific document.",
      parameters: {
        type: "object",
        properties: {
          documentId: {
            type: "string",
            description: "UUID of the document to retrieve entities from.",
          },
        },
        required: ["documentId"],
      },
    },
  },

  get_weather_forecast: {
    type: "function",
    function: {
      name: "get_weather_forecast",
      description:
        "Get a 7-day weather forecast for a ZIP code. Returns daily precipitation (inches), max wind speed (mph), max/min temperature (°F), and a plain-language summary.",
      parameters: {
        type: "object",
        properties: {
          zip: {
            type: "string",
            description: "5-digit US ZIP code to forecast.",
          },
        },
        required: ["zip"],
      },
    },
  },

  search_rebates: {
    type: "function",
    function: {
      name: "search_rebates",
      description:
        "Search for utility rebates, government incentive programs, and tax credits applicable to a project category in a given ZIP code.",
      parameters: {
        type: "object",
        properties: {
          zip: {
            type: "string",
            description: "5-digit US ZIP code for the project location.",
          },
          category: {
            type: "string",
            description:
              "Project category to search rebates for: hvac, insulation, windows, solar, ev_charger, heat_pump, water_heater, roofing, weatherization.",
          },
        },
        required: ["zip", "category"],
      },
    },
  },

  generate_project_timeline: {
    type: "function",
    function: {
      name: "generate_project_timeline",
      description:
        "Generate a phased Gantt-style project timeline with cost allocation for a renovation or construction project. Returns phases with start week, duration, cost percentage, and critical path flags.",
      parameters: {
        type: "object",
        properties: {
          tradeType: {
            type: "string",
            description:
              "Type of project: kitchen_remodel, bathroom_remodel, addition, full_renovation, roofing, hvac_replacement, electrical_upgrade, plumbing_rough_in, commercial_build_out, landscaping.",
          },
          scopeDescription: {
            type: "string",
            description: "Brief description of the project scope (e.g. 'Full kitchen gut and remodel, 200 sq ft').",
          },
          budgetUsd: {
            type: "number",
            description: "Total project budget in USD.",
          },
          startDate: {
            type: "string",
            description: "Planned start date in YYYY-MM-DD format. Defaults to today if omitted.",
          },
        },
        required: ["tradeType"],
      },
    },
  },

  simulate_cashflow: {
    type: "function",
    function: {
      name: "simulate_cashflow",
      description:
        "Simulate weekly cash flow for a project given a phase timeline and total budget. Returns weekly inflow/outflow projections, peak negative week, and total project cost.",
      parameters: {
        type: "object",
        properties: {
          phases: {
            type: "array",
            description: "Phase array from generate_project_timeline output.",
            items: { type: "object" },
          },
          totalBudgetUsd: {
            type: "number",
            description: "Total project budget in USD.",
          },
          paymentSchedule: {
            type: "string",
            description:
              "Payment schedule type: standard (10/20/30/25/15 split), front_loaded (50% deposit), milestone (equal at each phase). Defaults to standard.",
          },
        },
        required: ["phases", "totalBudgetUsd"],
      },
    },
  },

  score_permit_approval: {
    type: "function",
    function: {
      name: "score_permit_approval",
      description:
        "Score the probability of permit approval and estimate review timeline for a project. Uses the area risk engine's permit volatility factor plus project complexity heuristics.",
      parameters: {
        type: "object",
        properties: {
          zip: {
            type: "string",
            description: "5-digit project ZIP code.",
          },
          projectType: {
            type: "string",
            description:
              "Project type: new_construction, addition, renovation, change_of_use, demolition, grading, interior_only.",
          },
          tradeCount: {
            type: "number",
            description: "Number of trades involved (1 = simple, 3+ = complex).",
          },
          permitVolatility: {
            type: "number",
            description: "permitVolatility score (0–100) from get_risk_score. Provide if already fetched.",
          },
        },
        required: ["projectType"],
      },
    },
  },

  match_lenders: {
    type: "function",
    function: {
      name: "match_lenders",
      description:
        "Return a shortlist of lender types and products appropriate for a construction or renovation project based on budget, location, and project type.",
      parameters: {
        type: "object",
        properties: {
          projectType: {
            type: "string",
            description:
              "Project type: new_construction, renovation, addition, commercial, fix_and_flip, ground_up.",
          },
          budgetUsd: {
            type: "number",
            description: "Total project cost in USD.",
          },
          zip: {
            type: "string",
            description: "5-digit project ZIP code.",
          },
          ownerOccupied: {
            type: "boolean",
            description: "Whether the property is owner-occupied. Affects eligible products.",
          },
        },
        required: ["projectType", "budgetUsd"],
      },
    },
  },

  calculate_financing_readiness: {
    type: "function",
    function: {
      name: "calculate_financing_readiness",
      description:
        "Score how ready the business unit is to apply for construction or renovation financing. Checks documentation completeness, active quotes, risk profile, and benchmark data.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },

  generate_term_sheet: {
    type: "function",
    function: {
      name: "generate_term_sheet",
      description:
        "Generate an indicative term sheet for a construction loan based on loan amount, project risk score, and project type. Returns estimated rate, LTV, term, and monthly payment.",
      parameters: {
        type: "object",
        properties: {
          loanAmountUsd: {
            type: "number",
            description: "Requested loan amount in USD.",
          },
          riskScore: {
            type: "number",
            description: "Overall area risk score (0–100) from get_risk_score.",
          },
          projectType: {
            type: "string",
            description: "Project type: new_construction, renovation, addition, commercial, fix_and_flip.",
          },
          ownerOccupied: {
            type: "boolean",
            description: "Whether owner-occupied. Affects rate and max LTV.",
          },
        },
        required: ["loanAmountUsd", "projectType"],
      },
    },
  },

  save_project_timeline: {
    type: "function",
    function: {
      name: "save_project_timeline",
      description:
        "Persist a generated project timeline and cash-flow projection to the database for future reference.",
      parameters: {
        type: "object",
        properties: {
          tradeType: { type: "string" },
          scopeSummary: { type: "string" },
          totalBudgetUsd: { type: "number" },
          phases: { type: "array", items: { type: "object" } },
          cashflowProjections: { type: "array", items: { type: "object" } },
          totalWeeks: { type: "number" },
          estimatedCompletionDate: { type: "string" },
          riskItems: { type: "array", items: { type: "object" } },
        },
        required: ["phases"],
      },
    },
  },

  create_alert: {
    type: "function",
    function: {
      name: "create_alert",
      description:
        "Create a persistent alert in the command center dashboard for the business unit.",
      parameters: {
        type: "object",
        properties: {
          severity: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Alert severity level.",
          },
          title: {
            type: "string",
            description: "Short alert title (max 120 chars).",
          },
          detail: {
            type: "string",
            description: "Detailed description of the alert and recommended action.",
          },
        },
        required: ["severity", "title", "detail"],
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  switch (name) {
    case "list_jobs":
      return listJobs(args, ctx);
    case "list_quotes":
      return listQuotes(args, ctx);
    case "get_risk_score":
      return getRiskScore(ctx);
    case "get_benchmarks":
      return getBenchmarks(args, ctx);
    case "list_documents":
      return listDocuments(args, ctx);
    case "get_document_entities":
      return getDocumentEntities(args, ctx);
    case "get_weather_forecast":
      return getWeatherForecast(args);
    case "search_rebates":
      return searchRebates(args);
    case "create_alert":
      return createAlert(args, ctx);
    case "generate_project_timeline":
      return generateProjectTimeline(args);
    case "simulate_cashflow":
      return simulateCashflow(args);
    case "score_permit_approval":
      return scorePermitApproval(args);
    case "match_lenders":
      return matchLenders(args);
    case "calculate_financing_readiness":
      return calculateFinancingReadiness(ctx);
    case "generate_term_sheet":
      return generateTermSheet(args);
    case "save_project_timeline":
      return saveProjectTimeline(args, ctx);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

async function listJobs(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  const limit = Math.min(Number(args.limit ?? 20), 50);
  const { data, error } = await ctx.supabase
    .from("command_center_jobs")
    .select("id, payload, created_at, updated_at")
    .eq("business_unit_id", ctx.businessUnitId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };
  return data ?? [];
}

async function listQuotes(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  const limit = Math.min(Number(args.limit ?? 20), 50);
  const { data, error } = await ctx.supabase
    .from("command_center_quotes")
    .select("id, payload, created_at, updated_at")
    .eq("business_unit_id", ctx.businessUnitId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };
  return data ?? [];
}

async function getRiskScore(ctx: ToolContext): Promise<ToolResult> {
  const { data, error } = await ctx.supabase
    .from("risk_scores")
    .select("score, factors, created_at")
    .eq("business_unit_id", ctx.businessUnitId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { score: null, band: null, factors: null, message: "No risk score on record for this business unit." };

  const score = Number(data.score);
  const band =
    score >= 75 ? "high" : score >= 60 ? "elevated" : score >= 40 ? "moderate" : "low";

  return { score, band, factors: data.factors, recordedAt: data.created_at };
}

async function getBenchmarks(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  let query = ctx.supabase
    .from("benchmark_snapshots")
    .select("metric_key, metric_value, captured_at")
    .eq("business_unit_id", ctx.businessUnitId)
    .order("captured_at", { ascending: false });

  const keys = args.metricKeys as string[] | undefined;
  if (keys && keys.length > 0) {
    query = query.in("metric_key", keys);
  }

  const { data, error } = await query.limit(50);
  if (error) return { error: error.message };

  // Deduplicate to latest value per metric key
  const latest: Record<string, unknown> = {};
  for (const row of data ?? []) {
    if (!(row.metric_key in latest)) {
      latest[row.metric_key] = { value: row.metric_value, capturedAt: row.captured_at };
    }
  }
  return latest;
}

async function listDocuments(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  let query = ctx.supabase
    .from("documents")
    .select("id, kind, title, metadata, created_at, updated_at")
    .eq("business_unit_id", ctx.businessUnitId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (args.kind) {
    query = query.eq("kind", args.kind as string);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return data ?? [];
}

async function getDocumentEntities(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  const documentId = args.documentId as string;

  // Verify the document belongs to the business unit (tenant safety check)
  const { data: docCheck } = await ctx.supabase
    .from("documents")
    .select("id")
    .eq("id", documentId)
    .eq("business_unit_id", ctx.businessUnitId)
    .maybeSingle();

  if (!docCheck) return { error: "Document not found or access denied." };

  const { data, error } = await ctx.supabase
    .from("document_entities")
    .select("entity_type, entity_value, confidence, created_at")
    .eq("document_id", documentId)
    .order("confidence", { ascending: false });

  if (error) return { error: error.message };
  return data ?? [];
}

async function getWeatherForecast(args: Record<string, unknown>): Promise<ToolResult> {
  const zip = String(args.zip ?? "").trim();
  if (!/^\d{5}$/.test(zip)) return { error: "Invalid ZIP code." };

  // Step 1: Geocode ZIP → lat/lng via zippopotam.us
  let lat: number, lng: number, city: string, state: string;
  try {
    const geoRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!geoRes.ok) return { error: `ZIP ${zip} not found.` };
    const geoJson = await geoRes.json() as {
      places: Array<{ latitude: string; longitude: string; "place name": string; "state abbreviation": string }>;
    };
    const place = geoJson.places?.[0];
    if (!place) return { error: "No location data for ZIP." };
    lat = parseFloat(place.latitude);
    lng = parseFloat(place.longitude);
    city = place["place name"];
    state = place["state abbreviation"];
  } catch {
    return { error: "Failed to geocode ZIP code." };
  }

  // Step 2: Fetch 7-day forecast from Open-Meteo (free, no key needed)
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      precipitation_unit: "inch",
      timezone: "auto",
      forecast_days: "7",
    });
    const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!wxRes.ok) return { error: "Weather service unavailable." };
    const wx = await wxRes.json() as {
      daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
        wind_speed_10m_max: number[];
      };
    };

    const daily = wx.daily;
    const totalPrecip = daily.precipitation_sum.reduce((a, b) => a + b, 0);
    const maxWind = Math.max(...daily.wind_speed_10m_max);
    const minTemp = Math.min(...daily.temperature_2m_min);
    const maxTemp = Math.max(...daily.temperature_2m_max);
    const stormDays = daily.weather_code.filter((c) => c >= 80).length;

    const summary =
      stormDays >= 3
        ? `Stormy week ahead in ${city}, ${state} — ${stormDays} storm days, ${totalPrecip.toFixed(2)}" total precip.`
        : totalPrecip > 1
        ? `Wet week ahead in ${city}, ${state} — ${totalPrecip.toFixed(2)}" total precip, max wind ${maxWind.toFixed(0)} mph.`
        : `Mostly clear week in ${city}, ${state} — ${totalPrecip.toFixed(2)}" precip, highs up to ${maxTemp.toFixed(0)}°F.`;

    return {
      location: { zip, city, state, lat, lng },
      summary,
      totalPrecipitationInches: Math.round(totalPrecip * 100) / 100,
      maxWindMph: Math.round(maxWind),
      minTempF: Math.round(minTemp),
      maxTempF: Math.round(maxTemp),
      stormDayCount: stormDays,
      dailyForecast: daily.time.map((date, i) => ({
        date,
        precipitationIn: Math.round(daily.precipitation_sum[i] * 100) / 100,
        maxWindMph: Math.round(daily.wind_speed_10m_max[i]),
        maxTempF: Math.round(daily.temperature_2m_max[i]),
        minTempF: Math.round(daily.temperature_2m_min[i]),
        weatherCode: daily.weather_code[i],
      })),
    };
  } catch {
    return { error: "Failed to fetch weather forecast." };
  }
}

async function searchRebates(args: Record<string, unknown>): Promise<ToolResult> {
  const zip = String(args.zip ?? "").trim();
  const category = String(args.category ?? "").toLowerCase();

  // Knowledge-based rebate catalog — expanded with real program patterns.
  // In production this would call a database or rebate API (e.g. DSIRE, EnergyStar).
  const REBATE_CATALOG: Record<string, Array<{
    programName: string; estimatedValue: string; eligibilityConfidence: number;
    deadline: string | null; applicationUrl: string | null; notes: string;
  }>> = {
    hvac: [
      { programName: "Federal Energy Efficient Home Improvement Credit (25C)", estimatedValue: "Up to $600/unit", eligibilityConfidence: 0.9, deadline: "2032-12-31", applicationUrl: "https://www.energystar.gov/about/federal_tax_credits", notes: "Applies to qualifying central AC, heat pumps, and furnaces." },
      { programName: "Inflation Reduction Act Heat Pump Rebate (HEEHRA)", estimatedValue: "Up to $8,000", eligibilityConfidence: 0.75, deadline: null, applicationUrl: null, notes: "Income-based; varies by state program rollout." },
    ],
    heat_pump: [
      { programName: "Federal Heat Pump Tax Credit (25C)", estimatedValue: "Up to $2,000", eligibilityConfidence: 0.9, deadline: "2032-12-31", applicationUrl: "https://www.energystar.gov/about/federal_tax_credits", notes: "30% of cost, up to $2,000 per year." },
      { programName: "HEEHRA Heat Pump Rebate", estimatedValue: "Up to $8,000", eligibilityConfidence: 0.75, deadline: null, applicationUrl: null, notes: "Check state IRA implementation status." },
    ],
    insulation: [
      { programName: "Federal Weatherization Tax Credit (25C)", estimatedValue: "Up to $1,200", eligibilityConfidence: 0.85, deadline: "2032-12-31", applicationUrl: "https://www.energystar.gov/about/federal_tax_credits", notes: "30% of cost for insulation and air sealing." },
      { programName: "Weatherization Assistance Program (WAP)", estimatedValue: "Varies by income", eligibilityConfidence: 0.5, deadline: null, applicationUrl: "https://www.energy.gov/scep/wap", notes: "Income-qualified households only." },
    ],
    windows: [
      { programName: "Federal Window & Door Tax Credit (25C)", estimatedValue: "Up to $600", eligibilityConfidence: 0.85, deadline: "2032-12-31", applicationUrl: "https://www.energystar.gov/about/federal_tax_credits", notes: "Energy Star-certified windows required." },
    ],
    solar: [
      { programName: "Federal Residential Clean Energy Credit (25D)", estimatedValue: "30% of system cost", eligibilityConfidence: 0.95, deadline: "2034-12-31", applicationUrl: "https://www.energystar.gov/about/federal_tax_credits", notes: "Applies to solar PV, battery storage, and solar water heaters." },
    ],
    ev_charger: [
      { programName: "Federal EV Charger Tax Credit (30C)", estimatedValue: "Up to $1,000", eligibilityConfidence: 0.9, deadline: "2032-12-31", applicationUrl: "https://afdc.energy.gov/laws/10513", notes: "30% of cost, for residential Level 2 chargers." },
    ],
    water_heater: [
      { programName: "Federal Heat Pump Water Heater Credit (25C)", estimatedValue: "Up to $2,000", eligibilityConfidence: 0.85, deadline: "2032-12-31", applicationUrl: "https://www.energystar.gov/about/federal_tax_credits", notes: "Energy Star qualified heat pump water heaters only." },
    ],
    roofing: [
      { programName: "Energy Star Roof Products (Utility Rebates)", estimatedValue: "$0.05–$0.20/sq ft", eligibilityConfidence: 0.5, deadline: null, applicationUrl: "https://www.energystar.gov", notes: "Varies by utility; cool roof products may qualify." },
    ],
    weatherization: [
      { programName: "DOE Weatherization Assistance Program", estimatedValue: "Avg $6,500/home", eligibilityConfidence: 0.45, deadline: null, applicationUrl: "https://www.energy.gov/scep/wap", notes: "Income-qualified only; applied through state agencies." },
    ],
  };

  const programs = REBATE_CATALOG[category];
  if (!programs || programs.length === 0) {
    return { programs: [], message: `No rebate programs found in catalog for category: ${category}. Consider checking utility provider directly.`, zip, category };
  }

  return { programs, zip, category, source: "Kluje rebate catalog (federal baseline; local utility rebates may stack)" };
}

async function createAlert(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  const severity = args.severity as "low" | "medium" | "high";
  const title = String(args.title ?? "").slice(0, 120);
  const detail = String(args.detail ?? "");

  const { data, error } = await ctx.supabase
    .from("command_center_alerts")
    .insert({ business_unit_id: ctx.businessUnitId, severity, title, detail })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { alertId: data.id, severity, title, created: true };
}

// ---------------------------------------------------------------------------
// Macro-agent tool implementations
// ---------------------------------------------------------------------------

type PhaseTemplate = {
  phase: string; durationWeeks: number; costPercent: number;
  criticalPath: boolean; dependencies: string[];
};

const PHASE_TEMPLATES: Record<string, PhaseTemplate[]> = {
  kitchen_remodel: [
    { phase: "Pre-Construction & Permits", durationWeeks: 2, costPercent: 5, criticalPath: true, dependencies: [] },
    { phase: "Demolition & Haul-Off", durationWeeks: 1, costPercent: 7, criticalPath: true, dependencies: ["Pre-Construction & Permits"] },
    { phase: "Rough-In Plumbing & Electrical", durationWeeks: 2, costPercent: 18, criticalPath: true, dependencies: ["Demolition & Haul-Off"] },
    { phase: "Rough-In Inspection", durationWeeks: 0.5, costPercent: 0, criticalPath: true, dependencies: ["Rough-In Plumbing & Electrical"] },
    { phase: "Drywall & Insulation", durationWeeks: 1, costPercent: 10, criticalPath: true, dependencies: ["Rough-In Inspection"] },
    { phase: "Cabinets & Countertops", durationWeeks: 1.5, costPercent: 24, criticalPath: true, dependencies: ["Drywall & Insulation"] },
    { phase: "Flooring", durationWeeks: 1, costPercent: 12, criticalPath: false, dependencies: ["Drywall & Insulation"] },
    { phase: "Fixtures, Appliances & Trim", durationWeeks: 1, costPercent: 16, criticalPath: true, dependencies: ["Cabinets & Countertops"] },
    { phase: "Punch List & Final Inspection", durationWeeks: 0.5, costPercent: 8, criticalPath: true, dependencies: ["Fixtures, Appliances & Trim", "Flooring"] },
  ],
  bathroom_remodel: [
    { phase: "Permits & Planning", durationWeeks: 1.5, costPercent: 5, criticalPath: true, dependencies: [] },
    { phase: "Demolition", durationWeeks: 0.5, costPercent: 8, criticalPath: true, dependencies: ["Permits & Planning"] },
    { phase: "Rough-In Plumbing", durationWeeks: 1, costPercent: 20, criticalPath: true, dependencies: ["Demolition"] },
    { phase: "Waterproofing & Backer Board", durationWeeks: 0.5, costPercent: 8, criticalPath: true, dependencies: ["Rough-In Plumbing"] },
    { phase: "Tile Work", durationWeeks: 1.5, costPercent: 22, criticalPath: true, dependencies: ["Waterproofing & Backer Board"] },
    { phase: "Vanity, Toilet & Fixtures", durationWeeks: 1, costPercent: 25, criticalPath: true, dependencies: ["Tile Work"] },
    { phase: "Paint & Punch List", durationWeeks: 0.5, costPercent: 12, criticalPath: true, dependencies: ["Vanity, Toilet & Fixtures"] },
  ],
  addition: [
    { phase: "Design, Engineering & Permits", durationWeeks: 6, costPercent: 8, criticalPath: true, dependencies: [] },
    { phase: "Site Prep & Excavation", durationWeeks: 1.5, costPercent: 5, criticalPath: true, dependencies: ["Design, Engineering & Permits"] },
    { phase: "Foundation", durationWeeks: 2, costPercent: 10, criticalPath: true, dependencies: ["Site Prep & Excavation"] },
    { phase: "Framing", durationWeeks: 3, costPercent: 15, criticalPath: true, dependencies: ["Foundation"] },
    { phase: "Roofing & Weatherproofing", durationWeeks: 1.5, costPercent: 8, criticalPath: true, dependencies: ["Framing"] },
    { phase: "MEP Rough-In", durationWeeks: 3, costPercent: 18, criticalPath: true, dependencies: ["Roofing & Weatherproofing"] },
    { phase: "Insulation & Drywall", durationWeeks: 2, costPercent: 10, criticalPath: true, dependencies: ["MEP Rough-In"] },
    { phase: "Flooring & Finishes", durationWeeks: 2, costPercent: 14, criticalPath: false, dependencies: ["Insulation & Drywall"] },
    { phase: "Trim, Paint & Fixtures", durationWeeks: 2, costPercent: 9, criticalPath: true, dependencies: ["Insulation & Drywall"] },
    { phase: "Final Inspection & Punch List", durationWeeks: 1, costPercent: 3, criticalPath: true, dependencies: ["Trim, Paint & Fixtures", "Flooring & Finishes"] },
  ],
  roofing: [
    { phase: "Inspection & Material Order", durationWeeks: 1, costPercent: 10, criticalPath: true, dependencies: [] },
    { phase: "Tear-Off & Deck Inspection", durationWeeks: 0.5, costPercent: 20, criticalPath: true, dependencies: ["Inspection & Material Order"] },
    { phase: "Deck Repairs", durationWeeks: 0.5, costPercent: 10, criticalPath: true, dependencies: ["Tear-Off & Deck Inspection"] },
    { phase: "Underlayment & Flashing", durationWeeks: 0.5, costPercent: 15, criticalPath: true, dependencies: ["Deck Repairs"] },
    { phase: "Shingles / Roofing Material", durationWeeks: 1, costPercent: 35, criticalPath: true, dependencies: ["Underlayment & Flashing"] },
    { phase: "Cleanup & Final Inspection", durationWeeks: 0.5, costPercent: 10, criticalPath: true, dependencies: ["Shingles / Roofing Material"] },
  ],
  hvac_replacement: [
    { phase: "Load Calc & Equipment Selection", durationWeeks: 1, costPercent: 5, criticalPath: true, dependencies: [] },
    { phase: "Equipment Procurement", durationWeeks: 1.5, costPercent: 45, criticalPath: true, dependencies: ["Load Calc & Equipment Selection"] },
    { phase: "Removal of Existing System", durationWeeks: 0.5, costPercent: 10, criticalPath: true, dependencies: ["Equipment Procurement"] },
    { phase: "Installation & Ductwork", durationWeeks: 2, costPercent: 30, criticalPath: true, dependencies: ["Removal of Existing System"] },
    { phase: "Commissioning & Inspection", durationWeeks: 0.5, costPercent: 10, criticalPath: true, dependencies: ["Installation & Ductwork"] },
  ],
  full_renovation: [
    { phase: "Design, Permits & Planning", durationWeeks: 4, costPercent: 6, criticalPath: true, dependencies: [] },
    { phase: "Demolition", durationWeeks: 1.5, costPercent: 5, criticalPath: true, dependencies: ["Design, Permits & Planning"] },
    { phase: "Structural Work", durationWeeks: 2, costPercent: 10, criticalPath: true, dependencies: ["Demolition"] },
    { phase: "MEP Rough-In", durationWeeks: 3, costPercent: 20, criticalPath: true, dependencies: ["Structural Work"] },
    { phase: "Inspections", durationWeeks: 1, costPercent: 0, criticalPath: true, dependencies: ["MEP Rough-In"] },
    { phase: "Insulation & Drywall", durationWeeks: 2, costPercent: 10, criticalPath: true, dependencies: ["Inspections"] },
    { phase: "Kitchen & Bath Rough Finish", durationWeeks: 3, costPercent: 20, criticalPath: false, dependencies: ["Insulation & Drywall"] },
    { phase: "Flooring", durationWeeks: 2, costPercent: 12, criticalPath: false, dependencies: ["Insulation & Drywall"] },
    { phase: "Paint, Trim & Millwork", durationWeeks: 2, costPercent: 9, criticalPath: true, dependencies: ["Insulation & Drywall"] },
    { phase: "Fixtures, Appliances & Punch List", durationWeeks: 1.5, costPercent: 8, criticalPath: true, dependencies: ["Kitchen & Bath Rough Finish", "Flooring", "Paint, Trim & Millwork"] },
  ],
};

function generateProjectTimeline(args: Record<string, unknown>): ToolResult {
  const tradeType = String(args.tradeType ?? "full_renovation").toLowerCase().replace(/\s+/g, "_");
  const budget = Number(args.budgetUsd ?? 0);
  const startDate = args.startDate ? new Date(args.startDate as string) : new Date();
  const scopeDescription = String(args.scopeDescription ?? "");

  const templateKey = Object.keys(PHASE_TEMPLATES).includes(tradeType) ? tradeType : "full_renovation";
  const templates = PHASE_TEMPLATES[templateKey];

  // Assign sequential start weeks (simplified linear schedule)
  let currentWeek = 0;
  const phases = templates.map((t) => {
    const startWeek = currentWeek;
    currentWeek += t.durationWeeks;
    const phaseStart = new Date(startDate);
    phaseStart.setDate(phaseStart.getDate() + startWeek * 7);
    return {
      phase: t.phase,
      startWeek,
      durationWeeks: t.durationWeeks,
      endWeek: startWeek + t.durationWeeks,
      costPercent: t.costPercent,
      costUsd: budget > 0 ? Math.round((budget * t.costPercent) / 100) : null,
      criticalPath: t.criticalPath,
      dependencies: t.dependencies,
      estimatedStartDate: phaseStart.toISOString().split("T")[0],
    };
  });

  const totalWeeks = Math.ceil(currentWeek);
  const completionDate = new Date(startDate);
  completionDate.setDate(completionDate.getDate() + totalWeeks * 7);

  return {
    tradeType: templateKey,
    scopeDescription,
    totalBudgetUsd: budget,
    totalWeeks,
    estimatedCompletionDate: completionDate.toISOString().split("T")[0],
    phases,
    phaseCount: phases.length,
  };
}

function simulateCashflow(args: Record<string, unknown>): ToolResult {
  const phases = (args.phases as Array<Record<string, unknown>>) ?? [];
  const totalBudget = Number(args.totalBudgetUsd ?? 0);
  const scheduleType = String(args.paymentSchedule ?? "standard");

  if (phases.length === 0 || totalBudget === 0) {
    return { error: "phases and totalBudgetUsd are required." };
  }

  const totalWeeks = Math.max(...phases.map((p) => Number(p.endWeek ?? 0))) + 1;

  // Standard payment schedule: 10% deposit + progress payments tied to phases
  const PAYMENT_SCHEDULE_STANDARD = [0.10, 0.20, 0.30, 0.25, 0.15];

  // Build weekly outflows: allocate each phase's cost evenly across its weeks
  const weeklyOutflow: number[] = Array(totalWeeks).fill(0);
  for (const phase of phases) {
    const startWeek = Number(phase.startWeek ?? 0);
    const duration = Math.max(Number(phase.durationWeeks ?? 1), 0.5);
    const costUsd = phase.costUsd ? Number(phase.costUsd) : (Number(phase.costPercent ?? 0) / 100) * totalBudget;
    const weeksOccupied = Math.ceil(duration);
    const weeklyChunk = costUsd / weeksOccupied;
    for (let w = 0; w < weeksOccupied; w++) {
      const idx = startWeek + w;
      if (idx < totalWeeks) weeklyOutflow[idx] += weeklyChunk;
    }
  }

  // Build weekly inflows based on payment schedule
  const weeklyInflow: number[] = Array(totalWeeks).fill(0);
  if (scheduleType === "front_loaded") {
    weeklyInflow[0] = totalBudget * 0.5;
    weeklyInflow[Math.floor(totalWeeks / 2)] = totalBudget * 0.35;
    weeklyInflow[totalWeeks - 1] = totalBudget * 0.15;
  } else if (scheduleType === "milestone") {
    const milestoneWeeks = phases.filter((p) => p.criticalPath).map((p) => Number(p.startWeek ?? 0));
    const perMilestone = totalBudget / Math.max(milestoneWeeks.length, 1);
    for (const w of milestoneWeeks) {
      if (w < totalWeeks) weeklyInflow[w] += perMilestone;
    }
  } else {
    // Standard: 10% at week 0, then spread remaining by phase cost weight
    weeklyInflow[0] = totalBudget * PAYMENT_SCHEDULE_STANDARD[0];
    const paymentPoints = [
      Math.floor(totalWeeks * 0.2),
      Math.floor(totalWeeks * 0.45),
      Math.floor(totalWeeks * 0.75),
      totalWeeks - 1,
    ];
    [1, 2, 3, 4].forEach((i) => {
      const w = paymentPoints[i - 1];
      if (w < totalWeeks) weeklyInflow[w] += totalBudget * PAYMENT_SCHEDULE_STANDARD[i];
    });
  }

  // Build cumulative projections
  let runningBalance = 0;
  let peakNegativeWeek = 0;
  let peakNegativeAmount = 0;
  const weeklyProjections = Array.from({ length: totalWeeks }, (_, week) => {
    const inflow = Math.round(weeklyInflow[week]);
    const outflow = Math.round(weeklyOutflow[week]);
    runningBalance += inflow - outflow;
    if (runningBalance < peakNegativeAmount) {
      peakNegativeAmount = runningBalance;
      peakNegativeWeek = week;
    }
    return { week, inflow, outflow, netWeekly: inflow - outflow, cumulativeBalance: Math.round(runningBalance) };
  });

  return {
    totalBudgetUsd: totalBudget,
    totalWeeks,
    weeklyProjections,
    peakNegativeWeek,
    peakNegativeAmount: Math.round(peakNegativeAmount),
    hasCashFlowGap: peakNegativeAmount < -5000,
    cashFlowGapSeverity:
      peakNegativeAmount < -50000 ? "high" : peakNegativeAmount < -15000 ? "moderate" : "low",
  };
}

function scorePermitApproval(args: Record<string, unknown>): ToolResult {
  const projectType = String(args.projectType ?? "renovation");
  const tradeCount = Number(args.tradeCount ?? 1);
  const permitVolatility = args.permitVolatility != null ? Number(args.permitVolatility) : 50;

  // Base probability and timeline by project type
  const PROJECT_BASE: Record<string, { prob: number; days: number }> = {
    interior_only:      { prob: 82, days: 21 },
    renovation:         { prob: 75, days: 35 },
    addition:           { prob: 68, days: 55 },
    new_construction:   { prob: 60, days: 75 },
    change_of_use:      { prob: 52, days: 90 },
    demolition:         { prob: 70, days: 30 },
    grading:            { prob: 65, days: 40 },
  };
  const base = PROJECT_BASE[projectType] ?? { prob: 70, days: 45 };

  // Adjustments
  let probAdj = 0;
  let daysAdj = 0;

  if (permitVolatility > 70) { probAdj -= 18; daysAdj += 30; }
  else if (permitVolatility > 50) { probAdj -= 10; daysAdj += 14; }
  else if (permitVolatility < 30) { probAdj += 8; daysAdj -= 10; }

  if (tradeCount >= 3) { probAdj -= 8; daysAdj += 14; }
  else if (tradeCount === 1) { probAdj += 5; daysAdj -= 7; }

  const finalProb = Math.min(95, Math.max(25, base.prob + probAdj));
  const finalDays = Math.max(14, base.days + daysAdj);
  const confidence = permitVolatility != null ? "medium" : "low";

  return {
    approvalProbability: finalProb / 100,
    approvalProbabilityPercent: finalProb,
    estimatedReviewDays: finalDays,
    confidenceLevel: confidence,
    projectType,
    permitVolatilityUsed: permitVolatility,
    riskFactors: [
      permitVolatility > 60 && "High permit volatility in this jurisdiction",
      tradeCount >= 3 && "Multi-trade scope increases review complexity",
      projectType === "new_construction" && "New construction requires extended structural review",
    ].filter(Boolean),
    recommendation:
      finalProb >= 75
        ? "Proceed with permit application — approval probability is favorable."
        : finalProb >= 55
        ? "Consider a pre-application meeting with the jurisdiction to de-risk the submission."
        : "High rejection risk — strongly recommend pre-application review and potential scope simplification.",
  };
}

function matchLenders(args: Record<string, unknown>): ToolResult {
  const projectType = String(args.projectType ?? "renovation");
  const budgetUsd = Number(args.budgetUsd ?? 0);
  const ownerOccupied = args.ownerOccupied !== false;

  type LenderProduct = {
    lenderType: string; productName: string; bestFor: string;
    estimatedRateRange: string; maxLtv: string; typicalTerm: string;
    timeToClose: string; minLoan: number; maxLoan: number;
    ownerOccupiedOnly: boolean; notes: string;
  };

  const ALL_PRODUCTS: LenderProduct[] = [
    {
      lenderType: "Bank / Credit Union", productName: "Construction-to-Perm Loan",
      bestFor: "New construction and major additions",
      estimatedRateRange: "7.5–9.0%", maxLtv: "80%", typicalTerm: "12 mo construction + 30-yr permanent",
      timeToClose: "45–60 days", minLoan: 100_000, maxLoan: 5_000_000,
      ownerOccupiedOnly: false,
      notes: "Single close; converts automatically. Requires licensed GC and draw schedule.",
    },
    {
      lenderType: "FHA / HUD", productName: "FHA 203(k) Renovation Loan",
      bestFor: "Owner-occupied renovation under $750k",
      estimatedRateRange: "7.0–8.0%", maxLtv: "96.5%", typicalTerm: "30 years",
      timeToClose: "45–60 days", minLoan: 50_000, maxLoan: 750_000,
      ownerOccupiedOnly: true,
      notes: "Low down payment. Requires HUD-approved consultant. Good for first-time buyers.",
    },
    {
      lenderType: "Fannie Mae", productName: "HomeStyle Renovation Loan",
      bestFor: "Owner-occupied renovation up to conforming limit",
      estimatedRateRange: "7.0–8.5%", maxLtv: "95%", typicalTerm: "30 years",
      timeToClose: "30–45 days", minLoan: 75_000, maxLoan: 800_000,
      ownerOccupiedOnly: true,
      notes: "Higher loan limits than 203(k). No HUD consultant required.",
    },
    {
      lenderType: "Private / Hard Money", productName: "Bridge / Hard Money Loan",
      bestFor: "Fix-and-flip, fast close, non-conforming projects",
      estimatedRateRange: "11.5–15.0%", maxLtv: "70%", typicalTerm: "6–18 months",
      timeToClose: "5–14 days", minLoan: 75_000, maxLoan: 3_000_000,
      ownerOccupiedOnly: false,
      notes: "Asset-based underwriting. Higher cost but fast and flexible.",
    },
    {
      lenderType: "Bank / Credit Union", productName: "HELOC",
      bestFor: "Smaller renovations on existing home equity",
      estimatedRateRange: "Prime + 0.5–1.5%", maxLtv: "85%", typicalTerm: "Revolving (10-yr draw)",
      timeToClose: "14–21 days", minLoan: 25_000, maxLoan: 500_000,
      ownerOccupiedOnly: true,
      notes: "Variable rate. Best for phased projects. No draw schedule required.",
    },
    {
      lenderType: "SBA", productName: "SBA 504 Loan",
      bestFor: "Commercial owner-occupied real estate and major improvements",
      estimatedRateRange: "6.5–7.5%", maxLtv: "90%", typicalTerm: "10–25 years",
      timeToClose: "60–90 days", minLoan: 250_000, maxLoan: 15_000_000,
      ownerOccupiedOnly: false,
      notes: "Below-market fixed rate. Requires business to occupy 51%+ of property.",
    },
    {
      lenderType: "Private Lender", productName: "Private Bridge Loan",
      bestFor: "Commercial renovations and ground-up projects",
      estimatedRateRange: "9.5–13.0%", maxLtv: "75%", typicalTerm: "12–24 months",
      timeToClose: "10–21 days", minLoan: 500_000, maxLoan: 20_000_000,
      ownerOccupiedOnly: false,
      notes: "Income-producing focus. Interest-only draws during construction.",
    },
  ];

  // Filter by loan size and owner-occupied constraint
  let filtered = ALL_PRODUCTS.filter(
    (p) => budgetUsd >= p.minLoan && budgetUsd <= p.maxLoan
  );
  if (ownerOccupied === false) {
    filtered = filtered.filter((p) => !p.ownerOccupiedOnly);
  }

  // Score by fit
  const scored = filtered.map((p) => {
    let score = 50;
    if (projectType === "renovation" && p.productName.toLowerCase().includes("renov")) score += 20;
    if (projectType === "new_construction" && p.productName.includes("Construction")) score += 20;
    if (projectType === "fix_and_flip" && p.productName.includes("Hard Money")) score += 25;
    if (projectType === "commercial" && (p.lenderType === "SBA" || p.productName.includes("Bridge"))) score += 20;
    if (ownerOccupied && p.maxLtv.includes("96") || p.maxLtv.includes("95")) score += 10;
    return { ...p, fitScore: score };
  });

  scored.sort((a, b) => b.fitScore - a.fitScore);
  const shortlist = scored.slice(0, 4);

  return {
    projectType, budgetUsd, ownerOccupied,
    shortlist: shortlist.map(({ fitScore: _f, ...rest }) => rest),
    matchCount: shortlist.length,
    recommendation: shortlist[0]
      ? `Top match: ${shortlist[0].productName} via ${shortlist[0].lenderType} — ${shortlist[0].estimatedRateRange} rate, closes in ${shortlist[0].timeToClose}.`
      : "No matching products found for this budget and project type.",
  };
}

async function calculateFinancingReadiness(ctx: ToolContext): Promise<ToolResult> {
  const checks: Array<{ check: string; passed: boolean; points: number; gap?: string }> = [];

  // 1. Has uploaded documents?
  const { data: docs } = await ctx.supabase
    .from("documents").select("id, kind").eq("business_unit_id", ctx.businessUnitId).limit(5);
  const hasPermit = (docs ?? []).some((d) => d.kind === "permit");
  const hasQuoteDoc = (docs ?? []).some((d) => d.kind === "quote");
  checks.push({ check: "Project documents uploaded", passed: (docs ?? []).length > 0, points: 15, gap: "Upload project scope, quotes, and permits to strengthen your application." });
  checks.push({ check: "Permit or scope documents present", passed: hasPermit || hasQuoteDoc, points: 10, gap: "Upload a permit application or detailed scope of work." });

  // 2. Has active quotes?
  const { data: quotes } = await ctx.supabase
    .from("command_center_quotes").select("id").eq("business_unit_id", ctx.businessUnitId).limit(3);
  checks.push({ check: "Active quotes or draw requests on file", passed: (quotes ?? []).length > 0, points: 20, gap: "Submit at least one detailed contractor quote with line items." });

  // 3. Has a risk score?
  const { data: riskRow } = await ctx.supabase
    .from("risk_scores").select("score, factors").eq("business_unit_id", ctx.businessUnitId)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  const riskScore = riskRow ? Number(riskRow.score) : null;
  const lowRisk = riskScore != null && riskScore < 60;
  checks.push({ check: "Area risk assessment completed", passed: riskScore != null, points: 15, gap: "Run a risk scan to generate your area risk profile." });
  checks.push({ check: "Risk profile within acceptable range (score < 60)", passed: lowRisk, points: 15, gap: riskScore != null ? `Current score ${riskScore} is elevated — lenders may require risk mitigation plan.` : "Complete risk assessment first." });

  // 4. Has benchmark data?
  const { data: benchmarks } = await ctx.supabase
    .from("benchmark_snapshots").select("metric_key").eq("business_unit_id", ctx.businessUnitId).limit(3);
  checks.push({ check: "Benchmark data recorded", passed: (benchmarks ?? []).length > 0, points: 10, gap: "Capture job completion metrics to build a performance track record." });

  // 5. Has active jobs?
  const { data: jobs } = await ctx.supabase
    .from("command_center_jobs").select("id").eq("business_unit_id", ctx.businessUnitId).limit(3);
  checks.push({ check: "Active jobs in system", passed: (jobs ?? []).length > 0, points: 15, gap: "Add your active projects to the platform to demonstrate project pipeline." });

  const totalPoints = checks.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0);
  const maxPoints = checks.reduce((sum, c) => sum + c.points, 0);
  const score = Math.round((totalPoints / maxPoints) * 100);
  const band =
    score >= 80 ? "ready" : score >= 60 ? "near_ready" : score >= 40 ? "needs_work" : "not_ready";

  const gaps = checks
    .filter((c) => !c.passed && c.gap)
    .map((c) => ({ check: c.check, gap: c.gap!, pointsAtStake: c.points }));

  return { readinessScore: score, readinessBand: band, checks, gaps, totalPoints, maxPoints };
}

function generateTermSheet(args: Record<string, unknown>): ToolResult {
  const loanAmount = Number(args.loanAmountUsd ?? 0);
  const riskScore = Number(args.riskScore ?? 50);
  const projectType = String(args.projectType ?? "renovation");
  const ownerOccupied = args.ownerOccupied !== false;

  if (loanAmount <= 0) return { error: "loanAmountUsd must be a positive number." };

  // Rate = base + risk premium
  const BASE_RATES: Record<string, number> = {
    renovation: 7.5, addition: 7.75, new_construction: 8.0,
    fix_and_flip: 10.5, commercial: 8.25,
  };
  const baseRate = BASE_RATES[projectType] ?? 8.0;
  const riskPremium = (riskScore / 100) * 2.5;
  const ownerDiscount = ownerOccupied ? -0.25 : 0;
  const annualRate = Math.round((baseRate + riskPremium + ownerDiscount) * 100) / 100;
  const monthlyRate = annualRate / 100 / 12;

  // LTV
  const MAX_LTV: Record<string, number> = {
    renovation: ownerOccupied ? 0.95 : 0.80,
    addition: ownerOccupied ? 0.90 : 0.75,
    new_construction: 0.80,
    fix_and_flip: 0.70,
    commercial: 0.75,
  };
  const maxLtv = MAX_LTV[projectType] ?? 0.80;

  // Loan term in months
  const TERM_MONTHS: Record<string, number> = {
    renovation: 360, addition: 360, new_construction: 360,
    fix_and_flip: 12, commercial: 300,
  };
  const termMonths = TERM_MONTHS[projectType] ?? 360;

  // Monthly payment (PMT formula)
  let monthlyPayment: number;
  if (termMonths <= 24) {
    // Interest-only for short-term
    monthlyPayment = loanAmount * monthlyRate;
  } else {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  const reserveRequirement = monthlyPayment * 6;

  return {
    indicativeTerms: {
      loanAmountUsd: loanAmount,
      annualRatePercent: annualRate,
      rateBreakdown: { baseRate, riskPremium: Math.round(riskPremium * 100) / 100, ownerOccupiedDiscount: ownerDiscount },
      maxLtv: `${Math.round(maxLtv * 100)}%`,
      termMonths,
      termLabel: termMonths <= 24 ? `${termMonths} months` : `${Math.round(termMonths / 12)} years`,
      monthlyPaymentUsd: Math.round(monthlyPayment),
      isInterestOnly: termMonths <= 24,
      reserveRequirementUsd: Math.round(reserveRequirement),
      totalInterestUsd: termMonths <= 24
        ? Math.round(monthlyPayment * termMonths)
        : Math.round(monthlyPayment * termMonths - loanAmount),
    },
    disclaimer: "These are indicative terms only. Actual rates and terms depend on borrower creditworthiness, property appraisal, and lender underwriting criteria.",
  };
}

async function saveProjectTimeline(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  const { data, error } = await ctx.supabase
    .from("project_timelines")
    .insert({
      business_unit_id: ctx.businessUnitId,
      trade_type: args.tradeType as string ?? null,
      scope_summary: args.scopeSummary as string ?? null,
      total_budget_usd: args.totalBudgetUsd as number ?? null,
      phases: args.phases ?? [],
      cashflow_projections: args.cashflowProjections ?? [],
      total_weeks: args.totalWeeks as number ?? null,
      estimated_completion_date: args.estimatedCompletionDate as string ?? null,
      risk_items: args.riskItems ?? [],
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { saved: true, timelineId: data.id };
}

/**
 * Build the subset of TOOL_DEFINITIONS allowed for a given agent.
 */
export function getToolDefinitions(allowedTools: string[]): ToolDefinition[] {
  return allowedTools
    .filter((name) => name in TOOL_DEFINITIONS)
    .map((name) => TOOL_DEFINITIONS[name]);
}
