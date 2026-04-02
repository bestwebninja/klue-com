import type { ProviderResponse, Schools } from "../types";
import { fetchOptionalProviderByZip } from "./optionalProvider";

export const fetchGreatSchoolsByZip = async (zipCode: string): Promise<ProviderResponse<Schools>> =>
  fetchOptionalProviderByZip<Schools>("greatschools", zipCode);
