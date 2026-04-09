import { supabase } from "@/integrations/supabase/client";

/** Upsert a dashboard_bootstraps row keyed on user_id.
 *  Accepted columns: user_id, role_key, template_key, profile_snapshot, widget_config.
 */
export async function upsertDashboardBootstrap(payload: Record<string, unknown>) {
  return supabase.from("dashboard_bootstraps" as any).upsert(payload, { onConflict: "user_id" }).select().single();
}

/** @deprecated Use upsertDashboardBootstrap instead. */
export async function upsertTradeProfile(payload: Record<string, unknown>) {
  return upsertDashboardBootstrap(payload);
}

/** @deprecated Use upsertDashboardBootstrap instead.
 *  The old insert-only version could fail on duplicate user_id; replaced with upsert.
 */
export async function createDashboardInstance(payload: Record<string, unknown>) {
  return upsertDashboardBootstrap(payload);
}
