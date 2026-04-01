import type { KlujeRisk, ProviderResponse } from "../types";

export const fetchKlujeRiskByZip = async (): Promise<ProviderResponse<KlujeRisk>> => {
  const baseUrl = import.meta.env.VITE_KLUJE_RISK_API_BASE_URL as string | undefined;
  const apiKey = import.meta.env.VITE_KLUJE_RISK_API_KEY as string | undefined;

  if (!baseUrl || !apiKey) {
    return {
      enabled: false,
      status: "unavailable",
      data: null,
      reason: "Kluje risk endpoint not configured in browser",
    };
  }

  return {
    enabled: false,
    status: "unavailable",
    data: null,
    reason: "Kluje risk adapter is stubbed pending API contract",
  };
};
