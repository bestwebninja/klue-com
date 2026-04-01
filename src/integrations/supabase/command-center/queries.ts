import { supabase } from "@/integrations/supabase/client";

export async function getDefaultCommandCenterInstance(userId: string) {
  return supabase.from("dashboard_instances").select("*").eq("owner_user_id", userId).eq("is_default", true).maybeSingle();
}

export async function getDashboardTemplateByKey(templateKey: string) {
  return supabase.from("dashboard_templates").select("*").eq("template_key", templateKey).maybeSingle();
}
