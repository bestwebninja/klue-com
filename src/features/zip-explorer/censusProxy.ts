import { supabase } from "@/integrations/supabase/client";

export interface CensusProxyRow {
  NAME?: string;
  DP05_0001E?: string;
  DP03_0062E?: string;
  DP04_0046E?: string;
  DP04_0134E?: string;
  DP05_0018E?: string;
  DP02_0067PE?: string;
  DP02_0012PE?: string;
  B25077_001E?: string;
  B25064_001E?: string;
  B25001_001E?: string;
  B25070_007E?: string;
  [key: string]: string | undefined;
}

export interface CensusProxyResponse {
  status: "ok" | "unavailable" | "disabled";
  message?: string;
  profile: CensusProxyRow | null;
  detailed: CensusProxyRow | null;
}

export const fetchCensusViaProxy = async (zipCode: string): Promise<CensusProxyResponse> => {
  const { data, error } = await supabase.functions.invoke("zip-explorer-census-proxy", {
    body: { zipCode },
  });

  if (error) {
    throw new Error(error.message || "Census proxy request failed");
  }

  const response = data as CensusProxyResponse | null;

  if (!response || !response.status) {
    throw new Error("Malformed Census proxy response");
  }

  return response;
};
