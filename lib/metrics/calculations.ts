export function totalTasks(taskStatuses: Array<{ completed: boolean }>): number {
  return taskStatuses.length;
}

export function completedTasks(taskStatuses: Array<{ completed: boolean }>): number {
  return taskStatuses.filter((status) => status.completed).length;
}

export function completionRatio(completed: number, total: number): number {
  if (total <= 0) return 0;
  return completed / total;
}
