import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, withCorsJson } from "../_shared/cors.ts";

const CENSUS_BASE_URL = "https://api.census.gov";
const PROFILE_DATASET_PATH = "/data/2024/acs/acs5/profile";
const DETAILED_DATASET_PATH = "/data/2024/acs/acs5";
const ZIP_REGEX = /^\d{5}$/;

const PROFILE_VARIABLES = [
  "NAME",
  "DP05_0001E",
  "DP03_0062E",
  "DP04_0046E",
  "DP04_0134E",
  "DP05_0018E",
  "DP02_0067PE",
  "DP02_0012PE",
] as const;

const DETAILED_VARIABLES = ["NAME", "B25077_001E", "B25064_001E", "B25001_001E", "B25070_007E"] as const;

type CensusRow = Record<string, string>;

interface CensusProxyResponse {
  status: "ok" | "error";
  data: {
    profile: CensusRow | null;
    detailed: CensusRow | null;
  } | null;
  message?: string;
}

const buildAcsUrl = (datasetPath: string, variables: readonly string[], zipCode: string, apiKey: string) => {
  const params = new URLSearchParams();
  params.set("get", variables.join(","));
  params.set("for", `zip code tabulation area:${zipCode}`);
  params.set("key", apiKey);
  return `${CENSUS_BASE_URL}${datasetPath}?${params.toString()}`;
};

const fetchJsonRow = async (url: string): Promise<CensusRow | null> => {
  const response = await fetch(url, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Census upstream ${response.status}: ${responseText.slice(0, 120)}`);
  }

  const data = (await response.json()) as string[][];
  const [headers, row] = data;

  if (!headers || !row || row.length === 0) {
    return null;
  }

  return headers.reduce<CensusRow>((acc, key, index) => {
    acc[key] = row[index];
    return acc;
  }, {});
};

const errorResponse = (statusCode: number, message: string) =>
  withCorsJson<CensusProxyResponse>(
    {
      status: "error",
      data: null,
      message,
    },
    statusCode,
  );

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse(405, "Method not allowed");
  }

  try {
    const apiKey = Deno.env.get("CENSUS_API_KEY");
    if (!apiKey) {
      console.error("CENSUS_API_KEY is not configured for census-zip-profile");
      return errorResponse(500, "Census service is not configured");
    }

    const body = await req.json().catch(() => null);
    const zipCode = String(body?.zipCode ?? "").trim();

    if (!ZIP_REGEX.test(zipCode)) {
      return errorResponse(400, "zipCode must be a valid 5-digit ZIP");
    }

    const [profileRaw, detailedRaw] = await Promise.all([
      fetchJsonRow(buildAcsUrl(PROFILE_DATASET_PATH, PROFILE_VARIABLES, zipCode, apiKey)),
      fetchJsonRow(buildAcsUrl(DETAILED_DATASET_PATH, DETAILED_VARIABLES, zipCode, apiKey)),
    ]);

    if (!profileRaw && !detailedRaw) {
      return errorResponse(404, "No Census rows returned for this ZIP");
    }

    return withCorsJson<CensusProxyResponse>({
      status: "ok",
      data: {
        profile: profileRaw,
        detailed: detailedRaw,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Census fetch failed";
    console.error("census-zip-profile error", message);
    return errorResponse(502, message);
  }
});
