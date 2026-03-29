import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { fetchBillingSubscription } from "../lib/api";
import { pricingTiers } from "../lib/pricing";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "New Campaign", path: "/campaigns/new" },
  { label: "Placements", path: "/placements" },
  { label: "Billing", path: "/billing" },
  { label: "Admin", path: "/admin" }
];

export function BillingPage() {
  const [subscription, setSubscription] = useState<Awaited<ReturnType<typeof fetchBillingSubscription>>>(null);
  const [error, setError] = useState<string | null>(null);
  const tenantId = "tenant-demo";

  useEffect(() => {
    fetchBillingSubscription(tenantId)
      .then(setSubscription)
      .catch(() => setError("Billing API unavailable; showing selected tier from onboarding."));
  }, []);

  const selectedTier = useMemo(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("tier");
    return subscription?.planTier ?? fromQuery ?? "starter";
  }, [subscription]);

  return (
    <AppShell title="Billing" subtitle="Track invoices, payment method, and current balance." navItems={navItems}>
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Current Plan</p>
          <p className="mt-2 text-2xl font-semibold capitalize text-white">{selectedTier}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Billing Status</p>
          <p className="mt-2 text-2xl font-semibold capitalize text-white">{subscription?.billingStatus ?? "trial"}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Latest Payment</p>
          <p className="mt-2 text-2xl font-semibold capitalize text-white">{subscription?.latestPaymentStatus ?? "pending"}</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">Available pricing tiers</h2>
        {error ? <p className="mt-2 text-sm text-amber-300">{error}</p> : null}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {pricingTiers.map((tier) => (
            <article
              key={tier.id}
              className={`rounded-lg border p-4 ${selectedTier === tier.id ? "border-brand-500 bg-slate-800" : "border-slate-700 bg-slate-950"}`}
            >
              <p className="font-semibold text-white">{tier.name}</p>
              <p className="mt-1 text-sm text-slate-300">${tier.monthlyPrice}/mo</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
