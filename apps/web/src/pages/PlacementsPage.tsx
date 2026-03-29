import { AppShell } from "../components/AppShell";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "New Campaign", path: "/campaigns/new" },
  { label: "Placements", path: "/placements" },
  { label: "Billing", path: "/billing" },
  { label: "Admin", path: "/admin" }
];

const placements = [
  { name: "Home Finance Native Feed", type: "Native", status: "Live", ctr: "1.8%" },
  { name: "Auto Quote Search Listings", type: "Search", status: "Live", ctr: "2.4%" },
  { name: "Health Comparison Sidebar", type: "Display", status: "Paused", ctr: "0.9%" }
];

export function PlacementsPage() {
  return (
    <AppShell title="Placements" subtitle="Review where your campaigns are currently running." navItems={navItems}>
      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-800/80 text-slate-300">
            <tr>
              <th className="px-4 py-3">Placement</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">CTR</th>
            </tr>
          </thead>
          <tbody>
            {placements.map((placement) => (
              <tr key={placement.name} className="border-t border-slate-800 text-slate-100">
                <td className="px-4 py-3">{placement.name}</td>
                <td className="px-4 py-3">{placement.type}</td>
                <td className="px-4 py-3">{placement.status}</td>
                <td className="px-4 py-3">{placement.ctr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
