import type { InsuranceAdapter } from "../../adapters/types";
export const mockInsuranceAdapter: InsuranceAdapter = { async getCoverage() { return { eligible: true }; } };
