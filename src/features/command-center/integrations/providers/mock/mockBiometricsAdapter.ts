import type { BiometricsAdapter } from "../../adapters/types";
export const mockBiometricsAdapter: BiometricsAdapter = { async latestSignal() { return { confidence: 0.94 }; } };
