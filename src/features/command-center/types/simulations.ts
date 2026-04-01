export interface SimulatorInput { materialCostIncrease: number; delayDays: number; laborVariance: number; closeRateChange: number; marginCompression: number; }
export interface SimulatorOutput { projectedCashFlow: number; projectedMargin: number; alertSeverity: "low" | "medium" | "high"; recommendedActions: string[]; }
