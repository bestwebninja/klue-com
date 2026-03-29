import { AppShell } from "../components/AppShell";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "New Campaign", path: "/campaigns/new" },
  { label: "Placements", path: "/placements" },
  { label: "Billing", path: "/billing" },
  { label: "Admin", path: "/admin" }
];

export function BillingPage() {
  return (
    <AppShell title="Billing" subtitle="Track invoices, payment method, and current balance." navItems={navItems}>
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Current Balance</p>
          <p className="mt-2 text-2xl font-semibold text-white">$8,420.00</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Next Invoice Date</p>
          <p className="mt-2 text-2xl font-semibold text-white">April 1, 2026</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Payment Method</p>
          <p className="mt-2 text-2xl font-semibold text-white">Visa •••• 2147</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">Recent invoices</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          <li className="flex justify-between"><span>INV-20481</span><span>$6,340.00 • Paid</span></li>
          <li className="flex justify-between"><span>INV-20398</span><span>$5,910.00 • Paid</span></li>
          <li className="flex justify-between"><span>INV-20277</span><span>$4,780.00 • Paid</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
