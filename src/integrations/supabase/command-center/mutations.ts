import { supabase } from "@/integrations/supabase/client";

export async function upsertTradeProfile(payload: Record<string, unknown>) {
  return supabase.from("trade_profiles").upsert(payload, { onConflict: "business_unit_id" }).select().single();
}

export async function createDashboardInstance(payload: Record<string, unknown>) {
  return supabase.from("dashboard_instances").insert(payload).select().single();
}
