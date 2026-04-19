export interface MultiplierMap {
  [key: string]: number;
}

export function getScopeMultiplier(scopeValue: number, map: MultiplierMap): number {
  return map[String(scopeValue)] ?? 1;
}

export function getPriorityMultiplier(priorityValue: number, map: MultiplierMap): number {
  return map[String(priorityValue)] ?? 1;
}

export function staffingNeedScore(
  sqFt: number,
  sqFtPerStaffUnit: number,
  scopeMultiplier: number,
  priorityMultiplier: number,
): number {
  if (sqFtPerStaffUnit <= 0) return 0;
  return (sqFt / sqFtPerStaffUnit) * scopeMultiplier * priorityMultiplier;
}

export function hrStaff(score: number, minStaff = 1): number {
  if (score <= 0) return 0;
  return Math.max(minStaff, Math.ceil(score));
}
