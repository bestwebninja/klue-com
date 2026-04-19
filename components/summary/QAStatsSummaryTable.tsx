interface QAStatsSummaryRow {
  area: string;
  tasksLabel: string;
  hrStaffLabel: string;
  hoursLabel: string;
  costLabel: string;
}

interface QAStatsSummaryTableProps {
  rows: QAStatsSummaryRow[];
}

export function QAStatsSummaryTable({ rows }: QAStatsSummaryTableProps) {
  return (
    <div className="rounded border bg-white p-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-600">
            <th className="py-2">Area</th>
            <th className="py-2">Tasks</th>
            <th className="py-2">HR/Staff</th>
            <th className="py-2">Hours</th>
            <th className="py-2">Cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.area} className="border-b last:border-b-0">
              <td className="py-2 font-medium">{row.area}</td>
              <td className="py-2">{row.tasksLabel}</td>
              <td className="py-2 font-semibold text-slate-900">{row.hrStaffLabel}</td>
              <td className="py-2">{row.hoursLabel}</td>
              <td className="py-2 font-semibold text-slate-900">{row.costLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
