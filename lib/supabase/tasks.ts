import { supabase, runQuery } from "./client";
import type { WalkthroughTask } from "./types";

export async function createTask(walkthroughId: string, taskName: string, sortOrder: number): Promise<WalkthroughTask> {
  return runQuery(
    supabase
      .from("walkthrough_tasks")
      .insert({ walkthrough_id: walkthroughId, task_name: taskName, sort_order: sortOrder })
      .select("*")
      .single(),
  );
}

export async function updateTaskName(taskId: string, taskName: string): Promise<WalkthroughTask> {
  return runQuery(
    supabase.from("walkthrough_tasks").update({ task_name: taskName }).eq("id", taskId).select("*").single(),
  );
}

export async function deleteTask(taskId: string): Promise<void> {
  await runQuery(supabase.from("walkthrough_tasks").delete().eq("id", taskId).select("id").single());
}
