import { EditableInlineText } from "../primitives/EditableInlineText";
import { RemoveConfirmButton } from "../primitives/RemoveConfirmButton";

interface FloorHeadingProps {
  name: string;
  onRename: (name: string) => void;
  onRemove: () => void;
}

export function FloorHeading({ name, onRename, onRemove }: FloorHeadingProps) {
  return (
    <div className="flex items-center justify-between rounded-md bg-yellow-300 px-3 py-2">
      <EditableInlineText value={name} onSave={onRename} className="font-semibold text-slate-900" />
      <RemoveConfirmButton label={`floor ${name}`} onConfirm={onRemove} />
    </div>
  );
}
