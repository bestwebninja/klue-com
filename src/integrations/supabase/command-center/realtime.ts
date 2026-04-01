import { supabase } from "@/integrations/supabase/client";

export function subscribeToCommandCenterAlerts(workspaceId: string, callback: () => void) {
  return supabase.channel(`command-center-alerts-${workspaceId}`).on("postgres_changes", { event: "*", schema: "public", table: "command_center_alerts", filter: `business_unit_id=eq.${workspaceId}` }, callback).subscribe();
}
