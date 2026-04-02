import { invokeEdgeFunction } from "@/integrations/supabase/client";

export interface CensusProxyResponse {
  status: "ok" | "error";
  data: {
    profile: Record<string, string> | null;
    detailed: Record<string, string> | null;
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
