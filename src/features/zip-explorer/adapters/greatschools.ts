import type { ProviderResponse, Schools } from "../types";

export const fetchGreatSchoolsByZip = async (_zipCode: string): Promise<ProviderResponse<Schools>> => {
  const base = import.meta.env.VITE_GREATSCHOOLS_API_BASE_URL as string | undefined;
  const key = import.meta.env.VITE_GREATSCHOOLS_API_KEY as string | undefined;
  if (!base || !key) {
    return { enabled: false, status: "unavailable", data: null, reason: "GreatSchools not configured" };
  }
  return { enabled: true, status: "unavailable", data: null, reason: "GreatSchools key should not be exposed directly in browser" };
};
