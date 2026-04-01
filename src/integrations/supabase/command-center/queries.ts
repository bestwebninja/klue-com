import { supabase } from "@/integrations/supabase/client";

export async function getDefaultCommandCenterInstance(userId: string) {
  return supabase.from("dashboard_bootstraps").select("*").eq("user_id", userId).maybeSingle();
}

export async function getDashboardTemplateByKey(templateKey: string) {
  return supabase.from("dashboard_bootstraps").select("*").eq("template_key", templateKey).maybeSingle();
}
