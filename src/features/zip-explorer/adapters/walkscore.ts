import type { ProviderResponse, Walkability } from "../types";

export const fetchWalkScoreByZip = async (): Promise<ProviderResponse<Walkability>> => {
  const baseUrl = import.meta.env.VITE_WALKSCORE_API_BASE_URL as string | undefined;
  const apiKey = import.meta.env.VITE_WALKSCORE_API_KEY as string | undefined;

  if (!baseUrl || !apiKey) {
    return {
      enabled: false,
      status: "unavailable",
      data: null,
      reason: "Walk Score requires a proxy-safe endpoint and key",
    };
  }

  return {
    enabled: false,
    status: "unavailable",
    data: null,
    reason: "Walk Score adapter is stubbed in client; wire via proxy endpoint",
  };
};
