import type { ProviderResponse, Walkability } from "../types";
import { fetchOptionalProviderByZip } from "./optionalProvider";

export const fetchWalkScoreByZip = async (zipCode: string): Promise<ProviderResponse<Walkability>> =>
  fetchOptionalProviderByZip<Walkability>("walkscore", zipCode);
