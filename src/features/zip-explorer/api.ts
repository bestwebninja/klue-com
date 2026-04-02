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
