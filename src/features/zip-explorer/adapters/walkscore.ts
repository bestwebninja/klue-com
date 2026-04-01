import type { ProviderResponse, Walkability } from "../types";

export const fetchWalkScoreByZip = async (_zipCode: string): Promise<ProviderResponse<Walkability>> => {
  const base = import.meta.env.VITE_WALKSCORE_API_BASE_URL as string | undefined;
  const key = import.meta.env.VITE_WALKSCORE_API_KEY as string | undefined;
  if (!base || !key) {
    return { enabled: false, status: "unavailable", data: null, reason: "Walk Score not configured" };
  }
  return { enabled: true, status: "unavailable", data: null, reason: "Walk Score should run behind a server-side proxy" };
};
