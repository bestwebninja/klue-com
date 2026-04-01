import { supabase } from "@/integrations/supabase/client";

export async function runCommandCenterAgent(agentKey: string, payload: Record<string, unknown>) {
  return supabase.functions.invoke("command-center-ai", { body: { agentKey, payload } });
}
