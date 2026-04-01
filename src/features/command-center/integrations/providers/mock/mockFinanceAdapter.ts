import type { FinanceAdapter } from "../../adapters/types";
export const mockFinanceAdapter: FinanceAdapter = { async getRates() { return { apr: 8.25 }; } };
