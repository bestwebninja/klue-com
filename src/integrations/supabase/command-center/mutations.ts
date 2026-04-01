import { supabase } from "@/integrations/supabase/client";

export async function upsertTradeProfile(payload: Record<string, unknown>) {
  return supabase.from("dashboard_bootstraps" as any).upsert(payload, { onConflict: "user_id" }).select().single();
}

export async function createDashboardInstance(payload: Record<string, unknown>) {
  return supabase.from("dashboard_bootstraps" as any).insert(payload).select().single();
}
