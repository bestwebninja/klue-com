interface AddFloorButtonProps {
  onAdd: () => void;
}

export function AddFloorButton({ onAdd }: AddFloorButtonProps) {
  return (
    <button type="button" onClick={onAdd} className="rounded bg-yellow-400 px-3 py-2 text-sm font-semibold text-slate-900">
      Add Floor
    </button>
  );
}
