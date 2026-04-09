import { upsertDashboardBootstrap } from "@/integrations/supabase/command-center/mutations";

export async function saveOnboarding(_workspaceId: string, userId: string, values: { trade: string; focus: string; jobSize: string; veteranOwned: boolean }) {
  // Upsert a single dashboard_bootstraps record keyed on user_id.
  // The dashboard_bootstraps table columns are: user_id, role_key, template_key, profile_snapshot, widget_config.
  return upsertDashboardBootstrap({
    user_id: userId,
    role_key: values.trade,
    template_key: `trade_${values.trade}_v1`,
    widget_config: [],
  });
}
