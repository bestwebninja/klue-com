import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { navigate } from "../App";
import { fetchBillingSubscription } from "../lib/api";

const stats = [
  { label: "Active Campaigns", value: "12" },
  { label: "Spend This Month", value: "$24,380" },
  { label: "Leads", value: "1,942" },
  { label: "Avg. CPL", value: "$12.55" }
];

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "New Campaign", path: "/campaigns/new" },
  { label: "Placements", path: "/placements" },
  { label: "Billing", path: "/billing" },
  { label: "Quote Intake", path: "/contractor/quote-intake" },
  { label: "Admin", path: "/admin" }
];

export function AdvertiserDashboardPage() {
  const [billingStatus, setBillingStatus] = useState("loading");

  useEffect(() => {
    fetchBillingSubscription("tenant-demo")
      .then((subscription) => {
        setBillingStatus(subscription ? `${subscription.planTier} • ${subscription.billingStatus}` : "starter • trial");
      })
      .catch(() => {
        const selectedTier = new URLSearchParams(window.location.search).get("tier") ?? "starter";
        setBillingStatus(`${selectedTier} • setup pending`);
      });
  }, []);

  return (
    <AppShell
      title="Advertiser Dashboard"
      subtitle="Monitor campaign performance and act on issues quickly."
      navItems={navItems}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Top Campaigns</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-200">
            <li className="flex items-center justify-between"><span>Spring Homeowners CA</span><span>412 leads</span></li>
            <li className="flex items-center justify-between"><span>Auto Renewal TX</span><span>306 leads</span></li>
            <li className="flex items-center justify-between"><span>Medicare Awareness FL</span><span>221 leads</span></li>
          </ul>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Tasks</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-200">
            <li>• 2 campaigns need updated ad copy</li>
            <li>• 1 placement pending budget approval</li>
            <li>• Next invoice posts on April 1</li>
            <li>• New: barndominium quote checklist is ready for intake</li>
          </ul>
          <div className="mt-4 rounded-md bg-slate-800 p-3 text-sm text-slate-100">
            <p>Billing: <span className="capitalize">{billingStatus}</span></p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/billing")}
                className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-500"
              >
                Manage billing
              </button>
              <button
                type="button"
                onClick={() => navigate("/contractor/quote-intake")}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-500"
              >
                New Quote Intake
              </button>
            </div>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
