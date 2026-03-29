import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { BillingPanel } from "../components/BillingPanel";
import { LeadsTable } from "../components/LeadsTable";
import { StatCard } from "../components/StatCard";

const campaignData = [
  { name: "Mon", leads: 84 },
  { name: "Tue", leads: 112 },
  { name: "Wed", leads: 156 },
  { name: "Thu", leads: 140 },
  { name: "Fri", leads: 173 }
];

export function DashboardPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 p-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-brand-500">Kluje Enterprise</p>
        <h1 className="text-3xl font-bold text-white">Growth Operations Dashboard</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active Campaigns" value="128" delta="+14% vs last week" icon={<span>📈</span>} />
        <StatCard label="Qualified Leads" value="2,418" delta="+9% conversion lift" icon={<span>🎯</span>} />
        <StatCard label="Spend Today" value="$13,204" delta="Within pacing target" icon={<span>💳</span>} />
        <StatCard label="Pending Approvals" value="11" delta="2 due in < 4h" icon={<span>🛡️</span>} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-white">Lead Throughput (5d)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="leads" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <BillingPanel />
      </section>

      <LeadsTable />
    </main>
  );
}
