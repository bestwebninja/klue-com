interface RemoveConfirmButtonProps {
  label: string;
  onConfirm: () => void;
}

export function RemoveConfirmButton({ label, onConfirm }: RemoveConfirmButtonProps) {
  return (
    <button
      type="button"
      className="rounded border border-red-300 px-2 py-1 text-sm text-red-600 hover:bg-red-50"
      onClick={() => {
        if (window.confirm(`Remove ${label}?`)) {
          onConfirm();
        }
      }}
    >
      Remove
    </button>
  );
}
