import { useDashboardInstance } from "./useDashboardInstance";

export function useCommandCenter() {
  const { instance, loading } = useDashboardInstance();
  return { workspaceId: instance?.business_unit_id ?? "default-workspace", instance, loading };
}
