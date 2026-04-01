import { buildAcs2024DetailedUrl, buildAcs2024ProfileUrl, fetchJsonRows, getCensusConfig } from "../api";
import type { CensusDetailedRow, CensusProfileRow, ProviderResponse } from "../types";

export const fetchCensusByZip = async (
  zipCode: string,
): Promise<ProviderResponse<{ profile: CensusProfileRow; detailed: CensusDetailedRow }>> => {
  const { enabled } = getCensusConfig();
  if (!enabled) {
    return {
      enabled: false,
      status: "unavailable",
      data: null,
      reason: "Census adapter disabled: set VITE_CENSUS_API_BASE_URL and VITE_CENSUS_API_KEY",
    };
  }

  try {
    const [profileRaw, detailedRaw] = await Promise.all([
      fetchJsonRows(buildAcs2024ProfileUrl(zipCode)),
      fetchJsonRows(buildAcs2024DetailedUrl(zipCode)),
    ]);

    if (!profileRaw && !detailedRaw) {
      return { enabled: true, status: "unavailable", data: null, reason: "No Census rows returned" };
    }

    const profile: CensusProfileRow = {
      NAME: profileRaw?.NAME,
      DP05_0001E: profileRaw?.DP05_0001E,
      DP03_0062E: profileRaw?.DP03_0062E,
      DP04_0046E: profileRaw?.DP04_0046E,
      DP04_0134E: profileRaw?.DP04_0134E,
      DP05_0018E: profileRaw?.DP05_0018E,
      DP02_0067PE: profileRaw?.DP02_0067PE,
      DP02_0012PE: profileRaw?.DP02_0012PE,
      zip: profileRaw?.["zip code tabulation area"],
    };

    const detailed: CensusDetailedRow = {
      B25077_001E: detailedRaw?.B25077_001E,
      B25064_001E: detailedRaw?.B25064_001E,
      B25001_001E: detailedRaw?.B25001_001E,
      B25070_007E: detailedRaw?.B25070_007E,
      zip: detailedRaw?.["zip code tabulation area"],
    };

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
