import { fetchCensusViaProxy } from "../censusProxy";
import type { CensusDetailedRow, CensusProfileRow, ProviderResponse } from "../types";

export const fetchCensusByZip = async (
  zipCode: string,
): Promise<ProviderResponse<{ profile: CensusProfileRow; detailed: CensusDetailedRow }>> => {
  try {
    const response = await fetchCensusViaProxy(zipCode);

    if (response.status === "disabled") {
      return {
        enabled: false,
        status: "unavailable",
        data: null,
        reason: response.message ?? "Census adapter disabled by server configuration",
      };
    }

    if (response.status === "unavailable" || (!response.profile && !response.detailed)) {
      return {
        enabled: true,
        status: "unavailable",
        data: null,
        reason: response.message ?? "No Census rows returned",
      };
    }

    const profile: CensusProfileRow = {
      NAME: response.profile?.NAME,
      DP05_0001E: response.profile?.DP05_0001E,
      DP03_0062E: response.profile?.DP03_0062E,
      DP04_0046E: response.profile?.DP04_0046E,
      DP04_0134E: response.profile?.DP04_0134E,
      DP05_0018E: response.profile?.DP05_0018E,
      DP02_0067PE: response.profile?.DP02_0067PE,
      DP02_0012PE: response.profile?.DP02_0012PE,
      zip: response.profile?.["zip code tabulation area"],
    };

    const detailed: CensusDetailedRow = {
      B25077_001E: response.detailed?.B25077_001E,
      B25064_001E: response.detailed?.B25064_001E,
      B25001_001E: response.detailed?.B25001_001E,
      B25070_007E: response.detailed?.B25070_007E,
      zip: response.detailed?.["zip code tabulation area"],
    };

    return { enabled: true, status: "available", data: { profile, detailed }, reason: response.message };
  } catch (error) {
    return {
      enabled: true,
      status: "error",
      data: null,
      reason: error instanceof Error ? error.message : "Census request failed",
    };
  }
};
