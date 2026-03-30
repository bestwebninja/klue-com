import { AppShell } from "../components/AppShell";

export function AboutPage() {
  return (
    <AppShell title="About Kluje Ad Platform">
      <div className="space-y-8 text-slate-300">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Our Mission</h2>
          <p>
            Kluje connects advertisers with high-intent homeowners and service seekers through
            AI-optimized placements. We believe in transparent metrics, fair pricing, and
            campaigns that genuinely convert.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Create an advertiser account and choose a plan that fits your budget.</li>
            <li>Build a campaign with targeting criteria, creative assets, and budget caps.</li>
            <li>Our platform places your ads across the Kluje marketplace in optimal positions.</li>
            <li>Track impressions, clicks, and conversions in real time from your dashboard.</li>
          </ol>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Why Kluje?</h2>
          <ul className="space-y-2">
            <li>• <strong className="text-white">Transparent billing</strong> — powered by Stripe with no hidden fees.</li>
            <li>• <strong className="text-white">AI-optimized placements</strong> — your ads reach the right audience at the right time.</li>
            <li>• <strong className="text-white">Real-time analytics</strong> — see exactly how your campaigns perform.</li>
            <li>• <strong className="text-white">Fair pricing tiers</strong> — scale from starter to enterprise as you grow.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Contact Us</h2>
          <p>
            Have questions about advertising on Kluje? Reach out to our partnerships team
            and we'll help you get started.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
