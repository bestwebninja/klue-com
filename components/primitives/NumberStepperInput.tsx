interface NumberStepperInputProps {
  label: string;
  value: number;
  step?: number;
  min?: number;
  onChange: (value: number) => void;
}

export function NumberStepperInput({ label, value, step = 1, min = 0, onChange }: NumberStepperInputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" className="rounded border px-2 py-1" onClick={() => onChange(Math.max(min, value - step))}>-</button>
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
        <button type="button" className="rounded border px-2 py-1" onClick={() => onChange(value + step)}>+</button>
      </div>
    </label>
  );
}
