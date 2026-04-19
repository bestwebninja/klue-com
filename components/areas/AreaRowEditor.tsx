import type { WalkthroughArea } from "../../lib/supabase/types";
import { EditableInlineText } from "../primitives/EditableInlineText";
import { NumberStepperInput } from "../primitives/NumberStepperInput";
import { HighlightedMetricInput } from "../primitives/HighlightedMetricInput";
import { RemoveConfirmButton } from "../primitives/RemoveConfirmButton";

interface AreaRowEditorProps {
  area: WalkthroughArea;
  onUpdate: (areaId: string, updates: Partial<WalkthroughArea>) => void;
  onRemove: (areaId: string) => void;
}

export function AreaRowEditor({ area, onUpdate, onRemove }: AreaRowEditorProps) {
  return (
    <div className="grid grid-cols-5 gap-3 rounded border p-3">
      <div>
        <p className="mb-1 text-xs font-semibold text-slate-500">Area Name</p>
        <EditableInlineText value={area.area_name} onSave={(value) => onUpdate(area.id, { area_name: value })} />
      </div>
      <NumberStepperInput label="Sq Ft" value={area.sq_ft} onChange={(value) => onUpdate(area.id, { sq_ft: value })} step={50} />
      <HighlightedMetricInput label="Scope" value={area.scope_value} onChange={(value) => onUpdate(area.id, { scope_value: value })} />
      <HighlightedMetricInput label="Priority" value={area.priority_value} onChange={(value) => onUpdate(area.id, { priority_value: value })} />
      <div className="flex items-end justify-end">
        <RemoveConfirmButton label={`area ${area.area_name}`} onConfirm={() => onRemove(area.id)} />
      </div>
    </div>
  );
}
