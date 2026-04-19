import { supabase, runQuery } from "./client";
import type { WalkthroughFloor } from "./types";

export async function createFloor(walkthroughId: string, floorName: string, sortOrder: number): Promise<WalkthroughFloor> {
  return runQuery(
    supabase
      .from("walkthrough_floors")
      .insert({ walkthrough_id: walkthroughId, floor_name: floorName, sort_order: sortOrder })
      .select("*")
      .single(),
  );
}

export async function updateFloorName(floorId: string, floorName: string): Promise<WalkthroughFloor> {
  return runQuery(
    supabase.from("walkthrough_floors").update({ floor_name: floorName }).eq("id", floorId).select("*").single(),
  );
}

export async function deleteFloor(floorId: string): Promise<void> {
  await runQuery(
    supabase.from("walkthrough_floors").delete().eq("id", floorId).select("id").single(),
  );
}
