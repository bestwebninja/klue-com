interface AddTaskButtonProps {
  onAdd: () => void;
}

export function AddTaskButton({ onAdd }: AddTaskButtonProps) {
  return (
    <button type="button" onClick={onAdd} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
      Add Task
    </button>
  );
}
