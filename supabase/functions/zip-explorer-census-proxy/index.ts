import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_CENSUS_BASE_URL = "https://api.census.gov";
const PROFILE_DATASET = "/data/2023/acs/acs5/profile";
const DETAILED_DATASET = "/data/2023/acs/acs5";

const buildCensusUrl = (baseUrl: string, datasetPath: string, variables: string[], zipCode: string, apiKey: string) => {
  const params = new URLSearchParams();
  params.set("get", variables.join(","));
  params.set("for", `zip code tabulation area:${zipCode}`);
  params.set("key", apiKey);
  return `${baseUrl}${datasetPath}?${params.toString()}`;
};

const fetchJsonRows = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Census request failed with status ${response.status}`);
  }

  const data = (await response.json()) as string[][];
  const [headers, row] = data;
  if (!headers || !row) return null;

  return headers.reduce<Record<string, string>>((acc, key, idx) => {
    acc[key] = row[idx];
    return acc;
  }, {});
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const zipCode = String(body?.zipCode ?? "").trim();

    if (!/^\d{5}$/.test(zipCode)) {
      return new Response(
        JSON.stringify({ status: "unavailable", message: "Invalid ZIP code", profile: null, detailed: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("CENSUS_API_KEY")?.trim();
    const baseUrl = (Deno.env.get("CENSUS_API_BASE_URL") || DEFAULT_CENSUS_BASE_URL).replace(/\/$/, "");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          status: "disabled",
          message: "Census provider disabled: missing CENSUS_API_KEY",
          profile: null,
          detailed: null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const [profile, detailed] = await Promise.all([
      fetchJsonRows(
        buildCensusUrl(
          baseUrl,
          PROFILE_DATASET,
          ["NAME", "DP05_0001E", "DP03_0062E", "DP04_0046E", "DP04_0134E", "DP05_0018E", "DP02_0067PE", "DP02_0012PE"],
          zipCode,
          apiKey,
        ),
      ),
      fetchJsonRows(
        buildCensusUrl(baseUrl, DETAILED_DATASET, ["NAME", "B25077_001E", "B25064_001E", "B25001_001E", "B25070_007E"], zipCode, apiKey),
      ),
    ]);

    if (!profile && !detailed) {
      return new Response(
        JSON.stringify({ status: "unavailable", message: "No Census rows returned", profile: null, detailed: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        message: undefined,
        profile,
        detailed,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        status: "unavailable",
        message,
        profile: null,
        detailed: null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
