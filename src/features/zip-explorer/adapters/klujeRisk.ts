import { fetchOptionalZipProvider } from "../api";
import type { KlujeRisk, ProviderResponse } from "../types";

export const fetchKlujeRiskByZip = async (zipCode: string): Promise<ProviderResponse<KlujeRisk>> => {
  try {
    const response = await fetchOptionalZipProvider<KlujeRisk>("klujeRisk", zipCode);
    return {
      enabled: true,
      status: response.sourceStatus,
      data: response.data,
      reason: response.message,
    };
  } catch (error) {
    return {
      enabled: true,
      status: "error",
      data: null,
      reason: error instanceof Error ? error.message : "Kluje Risk request failed",
    };
  }
};
