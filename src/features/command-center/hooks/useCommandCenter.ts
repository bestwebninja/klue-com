import { useDashboardInstance } from "./useDashboardInstance";
import { useAuth } from "@/hooks/useAuth";

export function useCommandCenter() {
  const { user } = useAuth();
  const { instance, loading } = useDashboardInstance();
  // dashboard_bootstraps uses user_id as the workspace identifier (no business_unit_id column)
  return { workspaceId: instance?.user_id ?? user?.id ?? "default-workspace", instance, loading };
}
