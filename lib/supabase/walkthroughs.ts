import { supabase, runQuery } from "./client";
import type { Walkthrough, WalkthroughWithChildren } from "./types";

export async function createWalkthrough(name: string): Promise<Walkthrough> {
  return runQuery(
    supabase
      .from("walkthroughs")
      .insert({ name })
      .select("*")
      .single(),
  );
}

export async function getWalkthroughById(id: string): Promise<WalkthroughWithChildren> {
  const walkthrough = await runQuery<Walkthrough>(
    supabase.from("walkthroughs").select("*").eq("id", id).single(),
  );

  const floors = await runQuery(
    supabase.from("walkthrough_floors").select("*").eq("walkthrough_id", id).order("sort_order", { ascending: true }),
  );

  const tasks = await runQuery(
    supabase.from("walkthrough_tasks").select("*").eq("walkthrough_id", id).order("sort_order", { ascending: true }),
  );

  const floorIds = floors.map((floor) => floor.id);
  const areas = floorIds.length
    ? await runQuery(
      supabase.from("walkthrough_areas").select("*").in("floor_id", floorIds).order("sort_order", { ascending: true }),
    )
    : [];

  const areaIds = areas.map((area) => area.id);
  const areaTaskStatus = areaIds.length
    ? await runQuery(
      supabase
        .from("walkthrough_area_task_status")
        .select("*")
        .in("area_id", areaIds),
    )
    : [];

  const { data: settings } = await supabase
    .from("walkthrough_settings")
    .select("*")
    .eq("walkthrough_id", id)
    .maybeSingle();

  return {
    ...walkthrough,
    floors,
    areas,
    tasks,
    areaTaskStatus,
    settings: settings ?? null,
  };
}
