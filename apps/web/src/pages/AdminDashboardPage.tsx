import { AppShell } from "../components/AppShell";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "New Campaign", path: "/campaigns/new" },
  { label: "Placements", path: "/placements" },
  { label: "Billing", path: "/billing" },
  { label: "AD-Dashboard", path: "/admin" }
];

export function AdminDashboardPage() {
  return (
    <AppShell title="AD-Dashboard" subtitle="Shell view for operations and compliance workflows." navItems={navItems}>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-sm text-slate-400">Pending Approvals</h2>
          <p className="mt-2 text-2xl font-semibold text-white">7</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-sm text-slate-400">Flagged Campaigns</h2>
          <p className="mt-2 text-2xl font-semibold text-white">3</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-sm text-slate-400">User Access Requests</h2>
          <p className="mt-2 text-2xl font-semibold text-white">5</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-sm text-slate-400">Platform Alerts</h2>
          <p className="mt-2 text-2xl font-semibold text-white">2</p>
        </article>
      </section>

      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-slate-300">
        <h2 className="text-lg font-semibold text-white">AD-Dashboard modules coming next</h2>
        <p className="mt-2 text-sm">This shell is ready to host moderation queue, role management, and audit logs.</p>
      </section>
    </AppShell>
  );
}
