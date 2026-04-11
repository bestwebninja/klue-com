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

/**
 * Build the subset of TOOL_DEFINITIONS allowed for a given agent.
 */
export function getToolDefinitions(allowedTools: string[]): ToolDefinition[] {
  return allowedTools
    .filter((name) => name in TOOL_DEFINITIONS)
    .map((name) => TOOL_DEFINITIONS[name]);
}
