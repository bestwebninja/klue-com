import type { KlujeRisk, ProviderResponse } from "../types";

export const fetchKlujeRiskByZip = async (_zipCode: string): Promise<ProviderResponse<KlujeRisk>> => {
  const base = import.meta.env.VITE_KLUJE_RISK_API_BASE_URL as string | undefined;
  const key = import.meta.env.VITE_KLUJE_RISK_API_KEY as string | undefined;
  if (!base || !key) {
    return { enabled: false, status: "unavailable", data: null, reason: "Kluje Risk not configured" };
  }
  return { enabled: true, status: "unavailable", data: null, reason: "Kluje Risk adapter reserved for proxy/server integration" };
};
