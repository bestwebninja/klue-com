import type { KlujeRisk, ProviderResponse } from "../types";
import { fetchOptionalProviderByZip } from "./optionalProvider";

export const fetchKlujeRiskByZip = async (zipCode: string): Promise<ProviderResponse<KlujeRisk>> =>
  fetchOptionalProviderByZip<KlujeRisk>("klujeRisk", zipCode);
