import { AppShell } from "../components/AppShell";
import { navigate } from "../App";
import { Footer } from "../components/Footer";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
];

export function PrivacyPage() {
  return (
    <>
      <AppShell title="Privacy Policy" subtitle="Last updated: March 2026" navItems={navItems}>
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
            <p>We collect information you provide directly (name, email, company details) and usage data generated automatically when you interact with the platform (page views, clicks, device info, IP address).</p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">2. How We Use Your Information</h2>
            <p>We use your data to operate and improve the platform, deliver ad campaigns, process payments, communicate with you, and comply with legal obligations.</p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Cookies &amp; Tracking</h2>
            <p>We use essential, analytics, and advertising cookies. You can manage your preferences at any time through our cookie settings.</p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Data Sharing</h2>
            <p>We do not sell personal data. We share data with service providers (Stripe, analytics tools) necessary to operate the platform, and as required by law.</p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">5. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have rights to access, correct, delete, or port your data. You may also opt out of data sales.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={() => navigate("/privacy/request")} className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">Submit Data Request</button>
              <button type="button" onClick={() => navigate("/privacy/preferences")} className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">Manage Preferences</button>
              <button type="button" onClick={() => navigate("/privacy/do-not-sell")} className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">Do Not Sell My Data</button>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">6. Contact</h2>
            <p>For privacy inquiries, email <span className="text-brand-400">privacy@kluje.com</span>.</p>
          </section>
        </div>
      </AppShell>
      <Footer />
    </>
  );
}
