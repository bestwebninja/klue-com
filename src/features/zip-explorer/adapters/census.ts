import { fetchCensusZipProfile } from "../api";
import type { CensusDetailedRow, CensusProfileRow, ProviderResponse } from "../types";

export const fetchCensusByZip = async (
  zipCode: string,
): Promise<ProviderResponse<{ profile: CensusProfileRow; detailed: CensusDetailedRow }>> => {
  try {
    const response = await fetchCensusZipProfile(zipCode);

    if (response.status !== "ok" || !response.data) {
      return {
        enabled: true,
        status: "error",
        data: null,
        reason: response.message ?? "No Census rows returned",
      };
    }

    const profileRaw = response.data.profile;
    const detailedRaw = response.data.detailed;

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
