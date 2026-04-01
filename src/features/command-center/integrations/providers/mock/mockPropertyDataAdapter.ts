import type { PropertyDataAdapter } from "../../adapters/types";
export const mockPropertyDataAdapter: PropertyDataAdapter = { async lookup() { return { yearBuilt: 1996 }; } };
