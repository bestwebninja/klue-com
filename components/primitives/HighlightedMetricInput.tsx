interface HighlightedMetricInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function HighlightedMetricInput({ label, value, onChange }: HighlightedMetricInputProps) {
  return (
    <label className="flex flex-col gap-1 rounded-md border border-amber-300 bg-amber-50 p-2 text-sm">
      <span className="font-semibold text-amber-800">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded border border-amber-200 bg-white px-2 py-1"
      />
    </label>
  );
}
