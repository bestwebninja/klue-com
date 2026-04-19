export function riskScore(completionRatioValue: number, priorityValue: number): number {
  const incompleteWeight = 1 - Math.max(0, Math.min(1, completionRatioValue));
  return incompleteWeight * priorityValue;
}
