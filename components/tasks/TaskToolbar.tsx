import { AddTaskButton } from "./AddTaskButton";

interface TaskToolbarProps {
  onAddTask: () => void;
}

export function TaskToolbar({ onAddTask }: TaskToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-slate-800">Tasks</h3>
      <AddTaskButton onAdd={onAddTask} />
    </div>
  );
}
