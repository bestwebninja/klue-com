import type { ProviderResponse, Schools } from "../types";

export const fetchGreatSchoolsByZip = async (): Promise<ProviderResponse<Schools>> => {
  const baseUrl = import.meta.env.VITE_GREATSCHOOLS_API_BASE_URL as string | undefined;
  const apiKey = import.meta.env.VITE_GREATSCHOOLS_API_KEY as string | undefined;

  if (!baseUrl || !apiKey) {
    return {
      enabled: false,
      status: "unavailable",
      data: null,
      reason: "GreatSchools is not configured",
    };
  }

  return {
    enabled: false,
    status: "unavailable",
    data: null,
    reason: "GreatSchools adapter is stubbed and should be proxied server-side",
  };
};
