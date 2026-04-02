import { fetchOptionalZipProvider } from "../api";
import type { AirQuality, ProviderResponse } from "../types";

export const fetchAirNowByZip = async (zipCode: string): Promise<ProviderResponse<AirQuality>> => {
  try {
    const response = await fetchOptionalZipProvider<AirQuality>("airnow", zipCode);
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
      reason: error instanceof Error ? error.message : "AirNow request failed",
    };
  }
};
