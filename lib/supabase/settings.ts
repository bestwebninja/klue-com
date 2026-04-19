import { supabase, runQuery } from "./client";
import type { LaborSettingsUpdateInput, WalkthroughSettings } from "./types";

const defaultSettings = {
  labor_rate: 30,
  sq_ft_per_staff_unit: 1000,
  cleaning_rate_per_hour: 500,
  scope_multipliers: { "1": 1, "2": 1.1, "3": 1.25, "4": 1.4, "5": 1.6 },
  priority_multipliers: { "1": 1, "2": 1.15, "3": 1.35, "4": 1.6, "5": 1.9 },
};

export async function createOrLoadSettings(walkthroughId: string): Promise<WalkthroughSettings> {
  const existing = await supabase
    .from("walkthrough_settings")
    .select("*")
    .eq("walkthrough_id", walkthroughId)
    .maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  if (existing.data) {
    return existing.data;
  }

  return runQuery(
    supabase
      .from("walkthrough_settings")
      .insert({ walkthrough_id: walkthroughId, ...defaultSettings })
      .select("*")
      .single(),
  );
}

export async function updateLaborSettings(
  walkthroughId: string,
  updates: LaborSettingsUpdateInput,
): Promise<WalkthroughSettings> {
  await createOrLoadSettings(walkthroughId);

  return runQuery(
    supabase
      .from("walkthrough_settings")
      .update(updates)
      .eq("walkthrough_id", walkthroughId)
      .select("*")
      .single(),
  );
}
