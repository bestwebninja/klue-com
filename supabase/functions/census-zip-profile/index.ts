import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, withCorsJson } from "../_shared/cors.ts";

const CENSUS_BASE_URL = "https://api.census.gov";
const PROFILE_DATASET_PATH = "/data/2024/acs/acs5/profile";
const DETAILED_DATASET_PATH = "/data/2024/acs/acs5";

const ZIP_REGEX = /^\d{5}$/;

type CensusRow = Record<string, string>;

const buildAcsUrl = (datasetPath: string, variables: string[], zipCode: string, apiKey: string) => {
  const params = new URLSearchParams();
  params.set("get", variables.join(","));
  params.set("for", `zip code tabulation area:${zipCode}`);
  params.set("key", apiKey);
  return `${CENSUS_BASE_URL}${datasetPath}?${params.toString()}`;
};

const fetchJsonRows = async (url: string): Promise<CensusRow | null> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as string[][];
  const [headers, row] = data;
  if (!headers || !row) {
    return null;
  }

  return headers.reduce<CensusRow>((acc, key, idx) => {
    acc[key] = row[idx];
    return acc;
  }, {});
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return withCorsJson({ error: "Method not allowed" }, 405);
  }

  try {
    const apiKey = Deno.env.get("CENSUS_API_KEY");
    if (!apiKey) {
      console.error("CENSUS_API_KEY not configured");
      return withCorsJson({ error: "Census service is not configured" }, 500);
    }

    const body = await req.json();
    const zipCode = String(body?.zipCode ?? "").trim();
    if (!ZIP_REGEX.test(zipCode)) {
      return withCorsJson({ error: "zipCode must be a valid 5-digit ZIP" }, 400);
    }

    const [profileRaw, detailedRaw] = await Promise.all([
      fetchJsonRows(
        buildAcsUrl(
          PROFILE_DATASET_PATH,
          ["NAME", "DP05_0001E", "DP03_0062E", "DP04_0046E", "DP04_0134E", "DP05_0018E", "DP02_0067PE", "DP02_0012PE"],
          zipCode,
          apiKey,
        ),
      ),
      fetchJsonRows(
        buildAcsUrl(DETAILED_DATASET_PATH, ["NAME", "B25077_001E", "B25064_001E", "B25001_001E", "B25070_007E"], zipCode, apiKey),
      ),
    ]);

    if (!profileRaw && !detailedRaw) {
      return withCorsJson({ status: "error", data: null, message: "No Census rows returned" }, 404);
    }

    return withCorsJson({
      status: "ok",
      data: {
        profile: profileRaw,
        detailed: detailedRaw,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Census fetch failed";
    console.error("census-zip-profile error", message);
    return withCorsJson({ status: "error", data: null, message }, 500);
  }
});
