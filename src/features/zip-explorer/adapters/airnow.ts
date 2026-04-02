import type { AirQuality, ProviderResponse } from "../types";
import { fetchOptionalProviderByZip } from "./optionalProvider";

export const fetchAirNowByZip = async (zipCode: string): Promise<ProviderResponse<AirQuality>> =>
  fetchOptionalProviderByZip<AirQuality>("airnow", zipCode);
