import { AppShell } from "../components/AppShell";
import { navigate } from "../App";
import { Footer } from "../components/Footer";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Pricing", path: "/pricing" },
  { label: "Metrics", path: "/metrics" },
  { label: "About", path: "/about" },
];

export function DemoPage() {
  return (
    <>
      <AppShell title="Live Demo" subtitle="See Kluje Ad Platform in action — explore dashboards, campaigns, and analytics." navItems={navItems}>
        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">Campaign Builder</h2>
            <p className="text-sm text-slate-300">
              Create targeted ad campaigns with geo-filtering, budget caps, and AI-optimized placements — all from a single screen.
            </p>
            <button
              type="button"
              onClick={() => navigate("/campaigns/new")}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
            >
              Try Campaign Builder →
            </button>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">Advertiser Dashboard</h2>
            <p className="text-sm text-slate-300">
              Monitor impressions, clicks, and conversions in real time. View lead quality scores and ROI analytics.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
            >
              Explore Dashboard →
            </button>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">Placement Intelligence</h2>
            <p className="text-sm text-slate-300">
              See where your ads appear across the Kluje marketplace and how each placement performs.
            </p>
            <button
              type="button"
              onClick={() => navigate("/placements")}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
            >
              View Placements →
            </button>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">Billing &amp; Plans</h2>
            <p className="text-sm text-slate-300">
              Transparent Stripe-backed billing. Upgrade, downgrade, or cancel anytime.
            </p>
            <button
              type="button"
              onClick={() => navigate("/billing")}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
            >
              Review Billing →
            </button>
          </article>
        </section>

        <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center">
          <h2 className="text-xl font-semibold text-white">Ready to launch your first campaign?</h2>
          <p className="mt-2 text-sm text-slate-300">Sign up in minutes — no credit card required for the starter trial.</p>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="mt-4 rounded-md bg-brand-600 px-6 py-2.5 font-medium text-white hover:bg-brand-500"
          >
            Get Started Free
          </button>
        </section>
      </AppShell>
      <Footer />
    </>
  );
}
