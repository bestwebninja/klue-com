import { completionRatio } from "../../lib/metrics/calculations";
import { percent } from "../../lib/metrics/format";

interface SnapshotMetricsRowProps {
  totalAreas: number;
  totalTasks: number;
  completedTasks: number;
}

export function SnapshotMetricsRow({ totalAreas, totalTasks, completedTasks }: SnapshotMetricsRowProps) {
  const completionLabel = percent(completionRatio(completedTasks, totalTasks));

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded border bg-white p-3">
        <p className="text-xs text-slate-500">Areas</p>
        <p className="text-xl font-bold">{totalAreas}</p>
      </div>
      <div className="rounded border bg-white p-3">
        <p className="text-xs text-slate-500">Tasks</p>
        <p className="text-xl font-bold">{completedTasks}/{totalTasks}</p>
      </div>
      <div className="rounded border bg-white p-3">
        <p className="text-xs text-slate-500">Completion</p>
        <p className="text-xl font-bold">{completionLabel}</p>
      </div>
    </div>
  );
}
