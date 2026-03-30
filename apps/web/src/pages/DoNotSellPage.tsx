import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Footer } from "../components/Footer";

const navItems = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Data Request", path: "/privacy/request" },
  { label: "Preferences", path: "/privacy/preferences" },
];

export function DoNotSellPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <AppShell title="Do Not Sell My Personal Information" subtitle="Exercise your rights under CCPA / CPRA and similar regulations." navItems={navItems}>
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4 text-sm text-slate-300">
          <p>
            Kluje does <strong className="text-white">not sell personal data</strong> to third parties. However, certain data
            sharing for advertising purposes may constitute a "sale" under California law (CCPA/CPRA).
          </p>
          <p>
            If you would like to opt out of any sharing that could be classified as a sale, submit the form below.
            We will process your request within 15 business days.
          </p>
        </section>

        {submitted ? (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
            <h2 className="text-xl font-semibold text-white">Opt-Out Confirmed</h2>
            <p className="mt-2 text-sm text-slate-300">Your request has been recorded. You may still use all platform features.</p>
          </section>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-slate-200">Email Address</label>
              <input required type="email" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none" placeholder="jane@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">State / Region (optional)</label>
              <input type="text" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none" placeholder="e.g. California" />
            </div>
            <button type="submit" className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-500">
              Opt Out of Data Sales
            </button>
          </form>
        )}
      </AppShell>
      <Footer />
    </>
  );
}
