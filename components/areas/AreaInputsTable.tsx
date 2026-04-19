import type { WalkthroughArea } from "../../lib/supabase/types";
import { AreaRowEditor } from "./AreaRowEditor";

interface AreaInputsTableProps {
  areas: WalkthroughArea[];
  onUpdateArea: (areaId: string, updates: Partial<WalkthroughArea>) => void;
  onRemoveArea: (areaId: string) => void;
}

export function AreaInputsTable({ areas, onUpdateArea, onRemoveArea }: AreaInputsTableProps) {
  return (
    <div className="space-y-2">
      {areas.map((area) => (
        <AreaRowEditor key={area.id} area={area} onUpdate={onUpdateArea} onRemove={onRemoveArea} />
      ))}
    </div>
  );
}
