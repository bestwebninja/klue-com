import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Footer } from "../components/Footer";

const navItems = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Preferences", path: "/privacy/preferences" },
  { label: "Do Not Sell", path: "/privacy/do-not-sell" },
];

export function PrivacyRequestPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <AppShell title="Data Subject Request" subtitle="Submit a request to access, correct, or delete your personal data." navItems={navItems}>
        {submitted ? (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
            <h2 className="text-xl font-semibold text-white">Request Received</h2>
            <p className="mt-2 text-sm text-slate-300">We'll process your request within 30 days and contact you at the email provided.</p>
          </section>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-slate-200">Full Name</label>
              <input required type="text" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Email Address</label>
              <input required type="email" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none" placeholder="jane@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Request Type</label>
              <select required className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none">
                <option value="">Select…</option>
                <option value="access">Access my data</option>
                <option value="correct">Correct my data</option>
                <option value="delete">Delete my data</option>
                <option value="port">Export / port my data</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Details (optional)</label>
              <textarea rows={3} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none" placeholder="Provide any additional context…" />
            </div>
            <button type="submit" className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-500">
              Submit Request
            </button>
          </form>
        )}
      </AppShell>
      <Footer />
    </>
  );
}
