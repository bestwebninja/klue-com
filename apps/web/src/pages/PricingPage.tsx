import { AppShell } from "../components/AppShell";
import { navigate } from "../App";
import { pricingTiers } from "../lib/pricing";
import { Footer } from "../components/Footer";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Demo", path: "/demo" },
  { label: "Metrics", path: "/metrics" },
  { label: "About", path: "/about" },
];

export function PricingPage() {
  return (
    <>
      <AppShell title="Pricing" subtitle="Transparent pricing with no hidden fees. Powered by Stripe." navItems={navItems}>
        <div className="grid gap-6 md:grid-cols-3">
          {pricingTiers.map((tier) => (
            <article key={tier.id} className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">{tier.name}</h2>
              <p className="mt-3 text-4xl font-bold text-white">
                ${tier.monthlyPrice}
                <span className="text-base font-normal text-slate-400">/mo</span>
              </p>
              <p className="mt-3 text-sm text-slate-300">{tier.description}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-200">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-brand-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigate(`/signup?tier=${tier.id}`)}
                className="mt-6 w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-500"
              >
                Choose {tier.name}
              </button>
            </article>
          ))}
        </div>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
          <div className="space-y-4 text-sm text-slate-300">
            <div>
              <p className="font-medium text-white">Can I change plans later?</p>
              <p>Yes — upgrade or downgrade anytime from your billing dashboard. Changes are prorated.</p>
            </div>
            <div>
              <p className="font-medium text-white">Is there a free trial?</p>
              <p>Starter accounts get a 14-day trial with no credit card required.</p>
            </div>
            <div>
              <p className="font-medium text-white">How does billing work?</p>
              <p>All payments are processed securely through Stripe. You'll receive monthly invoices.</p>
            </div>
          </div>
        </section>
      </AppShell>
      <Footer />
    </>
  );
}
