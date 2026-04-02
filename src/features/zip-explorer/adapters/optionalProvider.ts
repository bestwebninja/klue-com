import { fetchOptionalZipProvider } from "../api";
import type { OptionalZipProviderKey } from "../api";
import type { ProviderResponse } from "../types";

export const fetchOptionalProviderByZip = async <T>(
  provider: OptionalZipProviderKey,
  zipCode: string,
): Promise<ProviderResponse<T>> => {
  try {
    const response = await fetchOptionalZipProvider<T>(provider, zipCode);

    if (response.status !== "ok") {
      return {
        enabled: false,
        status: "error",
        data: null,
        reason: response.message ?? `${provider} request failed`,
      };
    }

    if (!response.sourceStatus) {
      return {
        enabled: false,
        status: "error",
        data: null,
        reason: `${provider} returned no source status`,
      };
    }

    return {
      enabled: response.sourceStatus === "available",
      status: response.sourceStatus,
      data: response.data,
      reason: response.message,
    };
  } catch (error) {
    return {
      enabled: false,
      status: "error",
      data: null,
      reason: error instanceof Error ? error.message : `${provider} request failed`,
    };
  }
};
