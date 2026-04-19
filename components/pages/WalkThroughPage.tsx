import type { WalkthroughArea, WalkthroughFloor, WalkthroughSettings, WalkthroughTask } from "../../lib/supabase/types";
import { WalkThroughHeader } from "../structure/WalkThroughHeader";
import { AddFloorButton } from "../floors/AddFloorButton";
import { FloorSectionCard } from "../structure/FloorSectionCard";
import { FloorHeading } from "../structure/FloorHeading";
import { TaskToolbar } from "../tasks/TaskToolbar";
import { TaskColumnEditor } from "../tasks/TaskColumnEditor";
import { AddAreaButton } from "../areas/AddAreaButton";
import { AreaInputsTable } from "../areas/AreaInputsTable";
import { SnapshotMetricsRow } from "../summary/SnapshotMetricsRow";
import { QAStatsSummaryTable } from "../summary/QAStatsSummaryTable";
import { LaborSettingsPanel } from "../settings/LaborSettingsPanel";
import { completedTasks, totalTasks } from "../../lib/metrics/calculations";
import { estimatedCost, estimatedHours } from "../../lib/metrics/cost";
import { currency, hours as hoursLabel } from "../../lib/metrics/format";
import { getPriorityMultiplier, getScopeMultiplier, hrStaff, staffingNeedScore } from "../../lib/metrics/staffing";

interface WalkThroughPageProps {
  walkthroughName: string;
  floors: WalkthroughFloor[];
  areasByFloor: Record<string, WalkthroughArea[]>;
  tasks: WalkthroughTask[];
  taskStatusByArea: Record<string, Array<{ task_id: string; completed: boolean }>>;
  settings: WalkthroughSettings;
  onAddFloor: () => void;
  onRenameFloor: (floorId: string, floorName: string) => void;
  onRemoveFloor: (floorId: string) => void;
  onAddTask: () => void;
  onRenameTask: (taskId: string, taskName: string) => void;
  onRemoveTask: (taskId: string) => void;
  onAddArea: (floorId: string) => void;
  onUpdateArea: (areaId: string, updates: Partial<WalkthroughArea>) => void;
  onRemoveArea: (areaId: string) => void;
  onUpdateSettings: (updates: Partial<WalkthroughSettings>) => void;
}

export function WalkThroughPage({
  walkthroughName,
  floors,
  areasByFloor,
  tasks,
  taskStatusByArea,
  settings,
  onAddFloor,
  onRenameFloor,
  onRemoveFloor,
  onAddTask,
  onRenameTask,
  onRemoveTask,
  onAddArea,
  onUpdateArea,
  onRemoveArea,
  onUpdateSettings,
}: WalkThroughPageProps) {
  const areas = Object.values(areasByFloor).flat();
  const completedAcrossAreas = areas.reduce((acc, area) => {
    const statuses = taskStatusByArea[area.id] ?? [];
    return acc + completedTasks(statuses);
  }, 0);

  const totalAcrossAreas = areas.length * tasks.length;

  const qaRows = areas.map((area) => {
    const statuses = taskStatusByArea[area.id] ?? [];
    const done = completedTasks(statuses);
    const total = totalTasks(statuses) || tasks.length;
    const scopeMultiplier = getScopeMultiplier(area.scope_value, settings.scope_multipliers);
    const priorityMultiplier = getPriorityMultiplier(area.priority_value, settings.priority_multipliers);
    const score = staffingNeedScore(area.sq_ft, settings.sq_ft_per_staff_unit, scopeMultiplier, priorityMultiplier);
    const staff = hrStaff(score);
    const hours = estimatedHours(area.sq_ft, settings.cleaning_rate_per_hour, scopeMultiplier, priorityMultiplier);
    const cost = estimatedCost(hours, settings.labor_rate);

    return {
      area: area.area_name,
      tasksLabel: `${done}/${total} Tasks`,
      hrStaffLabel: `${staff} Staff`,
      hoursLabel: hoursLabel(hours),
      costLabel: currency(cost),
    };
  });

  return (
    <main className="mx-auto max-w-7xl space-y-4 bg-slate-50 p-6">
      <WalkThroughHeader title={walkthroughName} />
      <div className="flex justify-end">
        <AddFloorButton onAdd={onAddFloor} />
      </div>

      <TaskToolbar onAddTask={onAddTask} />
      <TaskColumnEditor tasks={tasks} onRename={onRenameTask} onRemove={onRemoveTask} />

      {floors.map((floor) => (
        <FloorSectionCard
          key={floor.id}
          heading={<FloorHeading name={floor.floor_name} onRename={(name) => onRenameFloor(floor.id, name)} onRemove={() => onRemoveFloor(floor.id)} />}
        >
          <div className="flex justify-end">
            <AddAreaButton onAdd={() => onAddArea(floor.id)} />
          </div>
          <AreaInputsTable
            areas={areasByFloor[floor.id] ?? []}
            onUpdateArea={onUpdateArea}
            onRemoveArea={onRemoveArea}
          />
        </FloorSectionCard>
      ))}

      <SnapshotMetricsRow totalAreas={areas.length} totalTasks={totalAcrossAreas} completedTasks={completedAcrossAreas} />
      <QAStatsSummaryTable rows={qaRows} />
      <LaborSettingsPanel settings={settings} onChange={onUpdateSettings} />
    </main>
  );
}
