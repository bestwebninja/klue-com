import { navigate } from "../App";
import { Footer } from "../components/Footer";
import { pricingTiers } from "../lib/pricing";

export function AdvertiserLandingPage() {
  return (
    <>
    <main className="mx-auto min-h-screen max-w-7xl space-y-12 p-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm uppercase tracking-wide text-brand-500">Kluje for Advertisers</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Acquire high-intent leads with AI-optimized placements</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Build and launch campaigns faster with Stripe-backed billing, transparent performance metrics, and placement intelligence tuned for conversion.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="rounded-md bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-500"
          >
            Start free onboarding
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded-md border border-slate-700 px-5 py-2.5 font-medium text-slate-100 hover:bg-slate-800"
          >
            Sign in
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">Pricing tiers</h2>
        <p className="mt-2 text-sm text-slate-300">Choose the plan that matches your campaign scale.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {pricingTiers.map((tier) => (
            <article key={tier.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
              <p className="mt-2 text-3xl font-bold text-white">${tier.monthlyPrice}<span className="text-sm font-normal text-slate-400">/mo</span></p>
              <p className="mt-3 text-sm text-slate-300">{tier.description}</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {tier.features.map((feature) => <li key={feature}>• {feature}</li>)}
              </ul>
              <button
                type="button"
                onClick={() => navigate(`/signup?tier=${tier.id}`)}
                className="mt-4 w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Choose {tier.name}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}
