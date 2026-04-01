import type { AirQuality, ProviderResponse } from "../types";

export const fetchAirNowByZip = async (zipCode: string): Promise<ProviderResponse<AirQuality>> => {
  const baseUrl = import.meta.env.VITE_AIRNOW_API_BASE_URL as string | undefined;
  const apiKey = import.meta.env.VITE_AIRNOW_API_KEY as string | undefined;

  if (!baseUrl || !apiKey) {
    return {
      enabled: false,
      status: "unavailable",
      data: null,
      reason: "AirNow is not configured for browser-safe access",
    };
  }

  try {
    const url = `${baseUrl.replace(/\/$/, "")}?format=application/json&zipCode=${zipCode}&distance=25&API_KEY=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`AirNow failed (${response.status})`);
    const payload = (await response.json()) as Array<{ AQI?: number; Category?: { Name?: string } }>;
    const first = payload?.[0];
    if (!first?.AQI) return { enabled: true, status: "unavailable", data: null, reason: "No AQI reading returned" };

    return {
      enabled: true,
      status: "available",
      data: { aqi: first.AQI, category: first.Category?.Name, summary: "Based on current AirNow signal." },
    };
  } catch (error) {
    return {
      enabled: true,
      status: "error",
      data: null,
      reason: error instanceof Error ? error.message : "AirNow failed",
    };
  }
};
