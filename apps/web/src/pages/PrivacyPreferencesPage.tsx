import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Footer } from "../components/Footer";

const navItems = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Data Request", path: "/privacy/request" },
  { label: "Do Not Sell", path: "/privacy/do-not-sell" },
];

function Toggle({ label, description, defaultOn = false }: { label: string; description: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-brand-600" : "bg-slate-700"}`}
      >
        <span className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white transition ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

export function PrivacyPreferencesPage() {
  const [saved, setSaved] = useState(false);

  return (
    <>
      <AppShell title="Privacy Preferences" subtitle="Control how your data is collected and used." navItems={navItems}>
        <div className="space-y-4">
          <Toggle label="Essential Cookies" description="Required for the platform to function. Cannot be disabled." defaultOn />
          <Toggle label="Analytics Cookies" description="Help us understand usage patterns to improve the product." defaultOn />
          <Toggle label="Advertising Cookies" description="Used for campaign targeting and conversion tracking." />
          <Toggle label="Marketing Communications" description="Receive product updates and promotional emails." />
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-500"
          >
            Save Preferences
          </button>
          {saved && <p className="mt-3 text-sm text-brand-400">✓ Preferences saved successfully.</p>}
        </div>
      </AppShell>
      <Footer />
    </>
  );
}
