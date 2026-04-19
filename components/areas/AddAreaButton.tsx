interface AddAreaButtonProps {
  onAdd: () => void;
}

export function AddAreaButton({ onAdd }: AddAreaButtonProps) {
  return (
    <button type="button" onClick={onAdd} className="rounded border border-slate-300 px-3 py-2 text-sm">
      Add Area
    </button>
  );
}
