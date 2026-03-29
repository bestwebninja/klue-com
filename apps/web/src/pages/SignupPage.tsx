import { FormEvent, useMemo } from "react";
import { navigate } from "../App";
import { pricingTiers } from "../lib/pricing";

export function SignupPage() {
  const search = new URLSearchParams(window.location.search);
  const selectedTier = search.get("tier") ?? "starter";

  const tierName = useMemo(
    () => pricingTiers.find((tier) => tier.id === selectedTier)?.name ?? "Starter",
    [selectedTier]
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/dashboard?tier=${selectedTier}`);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <section className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-wide text-brand-500">Advertiser Onboarding</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Create your advertiser account</h1>
        <p className="mt-2 text-sm text-slate-300">Selected plan: {tierName}. You can change this in billing later.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm text-slate-200">
            Company name
            <input className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" required />
          </label>
          <label className="block text-sm text-slate-200">
            Work email
            <input type="email" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" required />
          </label>
          <label className="block text-sm text-slate-200">
            Password
            <input type="password" minLength={8} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" required />
          </label>

          <button type="submit" className="w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-500">
            Continue to dashboard
          </button>
        </form>
      </section>
    </main>
  );
}
