import { invokeEdgeFunction } from "@/integrations/supabase/client";

export type CensusRawRow = Record<string, string>;

export interface CensusProxyResponse {
  status: "ok" | "error";
  data: {
    profile: CensusRawRow | null;
    detailed: CensusRawRow | null;
  } | null;
  message?: string;
}

export type OptionalZipProviderKey = "airnow" | "walkscore" | "greatschools" | "klujeRisk";

export interface OptionalZipProviderProxyResponse<T = Record<string, unknown>> {
  status: "ok" | "error";
  provider: OptionalZipProviderKey;
  sourceStatus: "available" | "unavailable" | "error";
  data: T | null;
  message?: string;
}

export const fetchCensusZipProfile = async (zipCode: string): Promise<CensusProxyResponse> => {
  const { data, error } = await invokeEdgeFunction<CensusProxyResponse>("census-zip-profile", { zipCode });

  if (error) {
    throw new Error(error.message || "Census proxy request failed");
  }

  if (!data) {
    throw new Error("Census proxy returned no payload");
  }

  return data;
};

export const fetchOptionalZipProvider = async <T>(
  provider: OptionalZipProviderKey,
  zipCode: string,
): Promise<OptionalZipProviderProxyResponse<T>> => {
  const { data, error } = await invokeEdgeFunction<OptionalZipProviderProxyResponse<T>>("command-center-adapter-proxy", {
    provider,
    zipCode,
    context: "zip-explorer",
  });

  if (error) {
    throw new Error(error.message || `${provider} proxy request failed`);
  }

  if (!data) {
    throw new Error(`${provider} proxy returned no payload`);
  }

  return data;
};
