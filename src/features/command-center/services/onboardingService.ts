import { createDashboardInstance, upsertTradeProfile } from "@/integrations/supabase/command-center/mutations";

export async function saveOnboarding(workspaceId: string, userId: string, values: { trade: string; focus: string; jobSize: string; veteranOwned: boolean }) {
  await upsertTradeProfile({ business_unit_id: workspaceId, primary_trade: values.trade, business_focus: values.focus, typical_job_size: values.jobSize, veteran_owned: values.veteranOwned });
  return createDashboardInstance({ business_unit_id: workspaceId, owner_user_id: userId, template_key: `trade_${values.trade}_v1`, status: "active", is_default: true });
}
