import type { AirQuality, ProviderResponse } from "../types";

export const fetchAirNowByZip = async (_zipCode: string): Promise<ProviderResponse<AirQuality>> => {
  const base = import.meta.env.VITE_AIRNOW_API_BASE_URL as string | undefined;
  const key = import.meta.env.VITE_AIRNOW_API_KEY as string | undefined;
  if (!base || !key) {
    return { enabled: false, status: "unavailable", data: null, reason: "AirNow not configured" };
  }
  return { enabled: true, status: "unavailable", data: null, reason: "Client-side AirNow integration intentionally stubbed" };
};
