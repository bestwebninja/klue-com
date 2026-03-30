import { AppShell } from "../components/AppShell";
import { Footer } from "../components/Footer";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Demo", path: "/demo" },
  { label: "Pricing", path: "/pricing" },
  { label: "About", path: "/about" },
];

const metrics = [
  { label: "Active Advertisers", value: "320+", delta: "+18% this quarter" },
  { label: "Campaigns Delivered", value: "4,800+", delta: "+22% this quarter" },
  { label: "Total Impressions", value: "12.4M", delta: "+31% this quarter" },
  { label: "Average CTR", value: "3.8%", delta: "+0.4pp vs industry avg" },
  { label: "Lead Conversion Rate", value: "14.2%", delta: "+2.1pp this quarter" },
  { label: "Avg. Cost per Lead", value: "$18.50", delta: "−12% this quarter" },
  { label: "Marketplace Reach", value: "48 metros", delta: "+6 new this quarter" },
  { label: "Uptime SLA", value: "99.97%", delta: "Last 90 days" },
];

export function MetricsPage() {
  return (
    <>
      <AppShell title="Platform Metrics" subtitle="Transparent performance data updated quarterly." navItems={navItems}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <article key={m.label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">{m.label}</p>
              <p className="mt-1 text-2xl font-bold text-white">{m.value}</p>
              <p className="mt-1 text-xs text-brand-400">{m.delta}</p>
            </article>
          ))}
        </div>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">How we measure</h2>
          <p className="text-sm text-slate-300">
            All metrics are derived from anonymized, aggregated campaign data across the Kluje marketplace.
            Impressions and clicks are deduplicated using session-level fingerprinting. Conversion events
            are tracked via server-side callbacks from advertiser endpoints. We publish updated figures
            at the start of each calendar quarter.
          </p>
        </section>
      </AppShell>
      <Footer />
    </>
  );
}
