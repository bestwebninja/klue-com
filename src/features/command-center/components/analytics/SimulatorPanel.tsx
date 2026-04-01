import { useMemo, useState } from "react";
import { calculateSimulation } from "../../services/simulatorService";

const defaults = { materialCostIncrease: 5, delayDays: 1, laborVariance: 2, closeRateChange: -1, marginCompression: 1 };

export function SimulatorPanel() {
  const [input, setInput] = useState(defaults);
  const output = useMemo(() => calculateSimulation(input), [input]);

  return <div className="border rounded p-4 space-y-3">
    <h3 className="font-semibold">Funding/Operations Simulator</h3>
    {Object.entries(input).map(([k, v]) => <label key={k} className="block text-xs">{k}<input className="w-full border rounded px-2 py-1" type="number" value={v} onChange={(e) => setInput((prev) => ({ ...prev, [k]: Number(e.target.value) }))} /></label>)}
    <div className="text-sm">Projected cash flow: ${output.projectedCashFlow.toLocaleString()} | Margin: {output.projectedMargin.toFixed(1)}% | Severity: {output.alertSeverity}</div>
  </div>;
}
