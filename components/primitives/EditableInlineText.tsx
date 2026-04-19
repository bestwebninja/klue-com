import { useState } from "react";

interface EditableInlineTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
}

export function EditableInlineText({ value, onSave, className }: EditableInlineTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const next = draft.trim() || value;
    onSave(next);
    setDraft(next);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`rounded border border-slate-300 px-2 py-1 text-sm ${className ?? ""}`}
      />
    );
  }

  return (
    <button type="button" onClick={() => setEditing(true)} className={`text-left hover:underline ${className ?? ""}`}>
      {value}
    </button>
  );
}
