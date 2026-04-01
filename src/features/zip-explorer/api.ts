import { supabase } from "@/integrations/supabase/client";
import { CENSUS_DATASETS } from "./constants";

const DEFAULT_CENSUS_BASE_URL = "https://api.census.gov";
const ZIP_REGEX = /^\d{5}$/;

export type ZipProxyStatus = "ok" | "error" | "disabled" | "invalid_zip";

export interface ZipProxyResponse {
  status: ZipProxyStatus;
  data: {
    zip: string;
    name: string | null;
    population: number | null;
    medianIncome: number | null;
    ownerOccupiedUnits: number | null;
    medianRent: number | null;
  };
  source: "census";
  message?: string;
}

export const getCensusConfig = () => {
  const baseUrl = import.meta.env.VITE_CENSUS_API_BASE_URL || DEFAULT_CENSUS_BASE_URL;
  const apiKey = import.meta.env.VITE_CENSUS_API_KEY as string | undefined;
  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey };
};

const buildUrl = (datasetPath: string, getParams: string, zipCode: string) => {
  const { baseUrl, apiKey } = getCensusConfig();
  const params = new URLSearchParams();
  params.set("get", getParams);
  params.set("for", `zip code tabulation area:${zipCode}`);
  if (apiKey) params.set("key", apiKey);
  return `${baseUrl}${datasetPath}?${params.toString()}`;
};

export const buildAcs2024ProfileUrl = (zipCode: string) =>
  buildUrl(
    CENSUS_DATASETS.profile2024,
    "NAME,DP05_0001E,DP05_0018E,DP03_0062E,DP04_0046E",
    zipCode,
  );

export const buildAcs2024DetailedUrl = (zipCode: string) =>
  buildUrl(
    CENSUS_DATASETS.detailed2024,
    "NAME,B25077_001E,B25064_001E,B25001_001E,B25070_007E",
    zipCode,
  );

export const fetchJsonRows = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const data = (await response.json()) as string[][];
  const [headers, row] = data;
  if (!headers || !row) return null;

  return headers.reduce<Record<string, string>>((acc, key, idx) => {
    acc[key] = row[idx];
    return acc;
  }, {});
};

const emptyProxyData = (zip: string): ZipProxyResponse["data"] => ({
  zip,
  name: null,
  population: null,
  medianIncome: null,
  ownerOccupiedUnits: null,
  medianRent: null,
});

export async function fetchZipProfileViaProxy(zip: string): Promise<ZipProxyResponse> {
  const normalizedZip = zip.trim();

  if (!ZIP_REGEX.test(normalizedZip)) {
    return {
      status: "invalid_zip",
      data: emptyProxyData(normalizedZip),
      source: "census",
      message: "ZIP code must be 5 digits.",
    };
  }

  const { data, error } = await supabase.functions.invoke<ZipProxyResponse>("census-zip-profile", {
    body: { zip: normalizedZip },
  });

  if (error) {
    return {
      status: "error",
      data: emptyProxyData(normalizedZip),
      source: "census",
      message: error.message,
    };
  }

  if (!data || !data.status || !data.data) {
    throw new Error("Unexpected response from census-zip-profile function.");
  }

  if (data.status === "ok") {
    return {
      ...data,
      data: {
        ...data.data,
        zip: data.data.zip || normalizedZip,
      },
    };
  }

  return {
    ...data,
    data: {
      ...emptyProxyData(normalizedZip),
      ...data.data,
    },
  };
}
