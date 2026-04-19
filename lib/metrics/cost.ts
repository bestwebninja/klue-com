export function estimatedHours(
  sqFt: number,
  cleaningRatePerHour: number,
  scopeMultiplier: number,
  priorityMultiplier: number,
): number {
  if (cleaningRatePerHour <= 0) return 0;
  return (sqFt / cleaningRatePerHour) * scopeMultiplier * priorityMultiplier;
}

export function estimatedCost(hours: number, laborRate: number): number {
  return hours * laborRate;
}
