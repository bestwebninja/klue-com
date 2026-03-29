const rows = [
  { id: "LD-1931", source: "Google CPC", score: 92, status: "routed" },
  { id: "LD-1930", source: "Referral", score: 84, status: "accepted" },
  { id: "LD-1929", source: "Organic", score: 61, status: "new" }
];

export function LeadsTable() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-3 text-lg font-semibold text-white">Recent Leads</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="text-slate-500">
              <th className="pb-2">Lead ID</th>
              <th className="pb-2">Source</th>
              <th className="pb-2">Intent Score</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-800">
                <td className="py-2">{row.id}</td>
                <td>{row.source}</td>
                <td>{row.score}</td>
                <td className="capitalize">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
