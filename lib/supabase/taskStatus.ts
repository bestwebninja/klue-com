import { supabase, runQuery } from "./client";
import type { WalkthroughAreaTaskStatus } from "./types";

export async function toggleAreaTask(areaId: string, taskId: string, completed: boolean): Promise<WalkthroughAreaTaskStatus> {
  const existing = await supabase
    .from("walkthrough_area_task_status")
    .select("*")
    .eq("area_id", areaId)
    .eq("task_id", taskId)
    .maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  if (existing.data) {
    return runQuery(
      supabase
        .from("walkthrough_area_task_status")
        .update({ completed })
        .eq("id", existing.data.id)
        .select("*")
        .single(),
    );
  }

  return runQuery(
    supabase
      .from("walkthrough_area_task_status")
      .insert({ area_id: areaId, task_id: taskId, completed })
      .select("*")
      .single(),
  );
}
