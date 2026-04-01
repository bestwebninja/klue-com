import type { RetailerAdapter } from "../../adapters/types";
export const mockRetailerAdapter: RetailerAdapter = { async searchSku() { return [{ sku: "PVC-001", price: 13.2 }]; } };
