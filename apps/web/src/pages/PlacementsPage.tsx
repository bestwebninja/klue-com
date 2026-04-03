import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { fetchPlacementRecommendations, type PlacementRecommendation } from "../lib/api";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "New Campaign", path: "/campaigns/new" },
  { label: "Placements", path: "/placements" },
  { label: "Billing", path: "/billing" },
  { label: "AD-Dashboard", path: "/admin" }
];

export function PlacementsPage() {
  const [placements, setPlacements] = useState<PlacementRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const briefRaw = window.sessionStorage.getItem("latestCampaignBrief");
    const fallback = { vertical: "Finance", dailyBudget: 1200, targetGeos: ["CA", "TX"] };
    const brief = briefRaw ? (JSON.parse(briefRaw) as typeof fallback) : fallback;

    fetchPlacementRecommendations(brief)
      .then(setPlacements)
      .catch(() => {
        setError("Live recommendations unavailable, showing fallback data.");
        setPlacements([
          { id: "fallback-1", name: "Home Finance Native Feed", type: "Native", status: "Recommended", aiScore: 0.89, projectedCtr: 1.98 },
          { id: "fallback-2", name: "Auto Quote Search Listings", type: "Search", status: "Test", aiScore: 0.8, projectedCtr: 2.31 },
          { id: "fallback-3", name: "Health Comparison Sidebar", type: "Display", status: "Limited", aiScore: 0.66, projectedCtr: 0.97 }
        ]);
      });
  }, []);

  return (
    <AppShell title="Placements" subtitle="Review where your campaigns are currently running." navItems={navItems}>
      {error ? <p className="text-sm text-amber-300">{error}</p> : null}
      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-800/80 text-slate-300">
            <tr>
              <th className="px-4 py-3">Placement</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Projected CTR</th>
              <th className="px-4 py-3">AI Score</th>
            </tr>
          </thead>
          <tbody>
            {placements.map((placement) => (
              <tr key={placement.id} className="border-t border-slate-800 text-slate-100">
                <td className="px-4 py-3">{placement.name}</td>
                <td className="px-4 py-3">{placement.type}</td>
                <td className="px-4 py-3">{placement.status}</td>
                <td className="px-4 py-3">{placement.projectedCtr}%</td>
                <td className="px-4 py-3">{placement.aiScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
