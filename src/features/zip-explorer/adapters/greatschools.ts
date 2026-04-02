import { fetchOptionalZipProvider } from "../api";
import type { ProviderResponse, Schools } from "../types";

export const fetchGreatSchoolsByZip = async (zipCode: string): Promise<ProviderResponse<Schools>> => {
  try {
    const response = await fetchOptionalZipProvider<Schools>("greatschools", zipCode);
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
      reason: error instanceof Error ? error.message : "GreatSchools request failed",
    };
  }
};
