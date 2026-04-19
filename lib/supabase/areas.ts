import { supabase, runQuery } from "./client";
import type { AreaUpdateInput, WalkthroughArea } from "./types";

interface CreateAreaInput {
  floor_id: string;
  area_name: string;
  sq_ft?: number;
  scope_value?: number;
  priority_value?: number;
  sort_order: number;
}

export async function createArea(input: CreateAreaInput): Promise<WalkthroughArea> {
  return runQuery(
    supabase
      .from("walkthrough_areas")
      .insert({
        floor_id: input.floor_id,
        area_name: input.area_name,
        sq_ft: input.sq_ft ?? 0,
        scope_value: input.scope_value ?? 1,
        priority_value: input.priority_value ?? 1,
        sort_order: input.sort_order,
      })
      .select("*")
      .single(),
  );
}

export async function updateArea(areaId: string, updates: AreaUpdateInput): Promise<WalkthroughArea> {
  return runQuery(
    supabase.from("walkthrough_areas").update(updates).eq("id", areaId).select("*").single(),
  );
}

export async function deleteArea(areaId: string): Promise<void> {
  await runQuery(supabase.from("walkthrough_areas").delete().eq("id", areaId).select("id").single());
}
