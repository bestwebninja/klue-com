import { fetchOptionalZipProvider } from "../api";
import type { ProviderResponse, Walkability } from "../types";

export const fetchWalkScoreByZip = async (zipCode: string): Promise<ProviderResponse<Walkability>> => {
  try {
    const response = await fetchOptionalZipProvider<Walkability>("walkscore", zipCode);
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
      reason: error instanceof Error ? error.message : "Walk Score request failed",
    };
  }
};
