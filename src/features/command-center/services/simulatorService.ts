import type { SimulatorInput, SimulatorOutput } from "../types";

export function calculateSimulation(input: SimulatorInput): SimulatorOutput {
  const projectedMargin = Math.max(3, 28 - input.materialCostIncrease * 0.25 - input.laborVariance * 0.2 - input.marginCompression);
  const projectedCashFlow = Math.round(120000 - input.delayDays * 1500 - input.materialCostIncrease * 300 - input.closeRateChange * 800);
  const alertSeverity = projectedMargin < 12 || projectedCashFlow < 80000 ? "high" : projectedMargin < 18 ? "medium" : "low";
  const recommendedActions = [
    input.delayDays > 3 ? "Prioritize permit-clear jobs to protect throughput" : "Maintain current schedule mix",
    input.materialCostIncrease > 10 ? "Lock supplier pricing with bulk order windows" : "Continue spot purchasing",
  ];

  return { projectedCashFlow, projectedMargin, alertSeverity, recommendedActions };
}
