import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

type ProxyStatus = "ok" | "error" | "disabled" | "invalid_zip";

interface ZipProfileData {
  zip: string;
  name: string | null;
  population: number | null;
  medianIncome: number | null;
  ownerOccupiedUnits: number | null;
  medianRent: number | null;
}

interface ProxyResponse {
  status: ProxyStatus;
  data: ZipProfileData;
  source: "census";
  message?: string;
}

const ZIP_REGEX = /^\d{5}$/;

const emptyData = (zip: string): ZipProfileData => ({
  zip,
  name: null,
  population: null,
  medianIncome: null,
  ownerOccupiedUnits: null,
  medianRent: null,
});

const toNullableNumber = (value: string | undefined): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ status: "error", source: "census", message: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { zip } = (await req.json()) as { zip?: string };
    const normalizedZip = zip?.trim() ?? "";

    if (!ZIP_REGEX.test(normalizedZip)) {
      const payload: ProxyResponse = {
        status: "invalid_zip",
        data: emptyData(normalizedZip),
        source: "census",
        message: "ZIP code must be a 5-digit U.S. ZIP.",
      };
      return new Response(JSON.stringify(payload), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const censusApiKey = Deno.env.get("CENSUS_API_KEY");

    if (!censusApiKey) {
      const payload: ProxyResponse = {
        status: "disabled",
        data: emptyData(normalizedZip),
        source: "census",
        message: "Census integration is not configured.",
      };
      return new Response(JSON.stringify(payload), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const endpoint = `https://api.census.gov/data/2024/acs/acs5/profile?get=NAME,DP05_0001E,DP03_0062E,DP04_0046E,DP04_0134E&for=zip%20code%20tabulation%20area:${normalizedZip}&key=${censusApiKey}`;

    const censusResponse = await fetch(endpoint);
    if (!censusResponse.ok) {
      const errorText = await censusResponse.text();
      throw new Error(`Census API request failed (${censusResponse.status}): ${errorText.slice(0, 200)}`);
    }

    const raw = (await censusResponse.json()) as string[][];
    const [headers, row] = raw;

    if (!headers || !row) {
      const payload: ProxyResponse = {
        status: "error",
        data: emptyData(normalizedZip),
        source: "census",
        message: `No Census row found for ZIP ${normalizedZip}.`,
      };
      return new Response(JSON.stringify(payload), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mapped = headers.reduce<Record<string, string>>((acc, key, index) => {
      acc[key] = row[index];
      return acc;
    }, {});

    const payload: ProxyResponse = {
      status: "ok",
      source: "census",
      data: {
        zip: mapped["zip code tabulation area"] ?? normalizedZip,
        name: mapped.NAME ?? null,
        population: toNullableNumber(mapped.DP05_0001E),
        medianIncome: toNullableNumber(mapped.DP03_0062E),
        ownerOccupiedUnits: toNullableNumber(mapped.DP04_0046E),
        medianRent: toNullableNumber(mapped.DP04_0134E),
      },
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const payload: ProxyResponse = {
      status: "error",
      data: emptyData(""),
      source: "census",
      message: error instanceof Error ? error.message : "Unexpected error calling Census proxy.",
    };
    return new Response(JSON.stringify(payload), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
