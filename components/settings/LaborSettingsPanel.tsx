import type { WalkthroughSettings } from "../../lib/supabase/types";
import { HighlightedMetricInput } from "../primitives/HighlightedMetricInput";

interface LaborSettingsPanelProps {
  settings: WalkthroughSettings;
  onChange: (updates: Partial<WalkthroughSettings>) => void;
}

export function LaborSettingsPanel({ settings, onChange }: LaborSettingsPanelProps) {
  return (
    <section className="space-y-3 rounded border bg-white p-4">
      <h3 className="text-base font-semibold text-slate-800">Labor Settings</h3>
      <div className="grid grid-cols-3 gap-3">
        <HighlightedMetricInput label="Labor Rate" value={settings.labor_rate} onChange={(value) => onChange({ labor_rate: value })} />
        <HighlightedMetricInput
          label="Sq Ft / Staff Unit"
          value={settings.sq_ft_per_staff_unit}
          onChange={(value) => onChange({ sq_ft_per_staff_unit: value })}
        />
        <HighlightedMetricInput
          label="Cleaning Rate / Hour"
          value={settings.cleaning_rate_per_hour}
          onChange={(value) => onChange({ cleaning_rate_per_hour: value })}
        />
      </div>
    </section>
  );
}
