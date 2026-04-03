import { AppShell } from "../components/AppShell";
import { Footer } from "../components/Footer";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "AD-Dashboard", path: "/admin-dashboard" },
  { label: "Cookie Admin", path: "/cookie-admin" },
];

const cookieCategories = [
  { name: "Essential", count: 4, status: "Always On" },
  { name: "Analytics", count: 3, status: "Enabled" },
  { name: "Advertising", count: 6, status: "Enabled" },
  { name: "Marketing", count: 2, status: "Disabled" },
];

const recentConsents = [
  { email: "user1@example.com", date: "2026-03-28", accepted: ["Essential", "Analytics"] },
  { email: "user2@example.com", date: "2026-03-27", accepted: ["Essential", "Analytics", "Advertising"] },
  { email: "user3@example.com", date: "2026-03-26", accepted: ["Essential"] },
];

export function CookieAdminPage() {
  return (
    <>
      <AppShell title="Cookie Management" subtitle="Configure cookie categories and view consent logs." navItems={navItems}>
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Cookie Categories</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cookieCategories.map((c) => (
              <article key={c.name} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">{c.name}</p>
                <p className="mt-1 text-2xl font-bold text-white">{c.count} cookies</p>
                <p className={`mt-1 text-xs ${c.status === "Disabled" ? "text-red-400" : "text-brand-400"}`}>{c.status}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Consent Logs</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Accepted Categories</th>
                </tr>
              </thead>
              <tbody className="bg-slate-950">
                {recentConsents.map((c) => (
                  <tr key={c.email} className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-white">{c.email}</td>
                    <td className="px-4 py-3 text-slate-300">{c.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.accepted.map((a) => (
                          <span key={a} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-200">{a}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </AppShell>
      <Footer />
    </>
  );
}
