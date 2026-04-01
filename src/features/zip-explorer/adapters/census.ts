import { buildAcs2024DetailedUrl, buildAcs2024ProfileUrl, fetchJsonRows, getCensusConfig } from "../api";
import type { CensusDetailedRow, CensusProfileRow, ProviderResponse } from "../types";

const toNumber = (value?: string) => {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const fetchCensusByZip = async (
  zipCode: string,
): Promise<ProviderResponse<{ profile: CensusProfileRow; detailed: CensusDetailedRow }>> => {
  const { baseUrl } = getCensusConfig();
  if (!baseUrl) {
    return { enabled: false, status: "unavailable", data: null, reason: "Missing Census base URL" };
  }

  try {
    const [profileRaw, detailedRaw] = await Promise.all([
      fetchJsonRows(buildAcs2024ProfileUrl(zipCode)),
      fetchJsonRows(buildAcs2024DetailedUrl(zipCode)),
    ]);

    if (!profileRaw && !detailedRaw) {
      return { enabled: true, status: "unavailable", data: null, reason: "No Census data returned" };
    }

    const profile: CensusProfileRow = {
      NAME: profileRaw?.NAME,
      DP05_0001E: profileRaw?.DP05_0001E,
      DP05_0018E: profileRaw?.DP05_0018E,
      DP03_0062E: profileRaw?.DP03_0062E,
      DP04_0046E: profileRaw?.DP04_0046E,
      zip: profileRaw?.["zip code tabulation area"],
    };

    const detailed: CensusDetailedRow = {
      B25077_001E: detailedRaw?.B25077_001E,
      B25064_001E: detailedRaw?.B25064_001E,
      B25001_001E: detailedRaw?.B25001_001E,
      B25070_007E: detailedRaw?.B25070_007E,
      zip: detailedRaw?.["zip code tabulation area"],
    };

    if (!toNumber(profile.DP05_0001E) && !toNumber(detailed.B25001_001E)) {
      return { enabled: true, status: "unavailable", data: null, reason: "No numeric Census values available" };
    }

    return { enabled: true, status: "available", data: { profile, detailed } };
  } catch (error) {
    return {
      enabled: true,
      status: "error",
      data: null,
      reason: error instanceof Error ? error.message : "Census request failed",
    };
  }
};
