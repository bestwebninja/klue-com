import { FormEvent } from "react";
import { AppShell } from "../components/AppShell";
import { navigate } from "../App";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "New Campaign", path: "/campaigns/new" },
  { label: "Placements", path: "/placements" },
  { label: "Billing", path: "/billing" },
  { label: "AD-Dashboard", path: "/admin" }
];

export function CampaignSubmissionPage() {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      vertical: String(form.get("vertical") ?? ""),
      dailyBudget: Number(form.get("dailyBudget") ?? 100),
      targetGeos: String(form.get("targetGeos") ?? "")
        .split(",")
        .map((geo) => geo.trim())
        .filter(Boolean)
    };
    window.sessionStorage.setItem("latestCampaignBrief", JSON.stringify(payload));
    navigate("/placements");
  };

  return (
    <AppShell title="Campaign Submission" subtitle="Create and submit a campaign for internal review." navItems={navItems}>
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <label className="text-sm text-slate-200">
            Campaign name
            <input
              name="campaignName"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              required
            />
          </label>

          <label className="text-sm text-slate-200">
            Vertical
            <select name="vertical" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" required>
              <option value="">Select vertical</option>
              <option>Insurance</option>
              <option>Finance</option>
              <option>Health</option>
            </select>
          </label>

          <label className="text-sm text-slate-200">
            Daily budget (USD)
            <input
              name="dailyBudget"
              type="number"
              min={100}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              required
            />
          </label>

          <label className="text-sm text-slate-200">
            Target geos
            <input
              name="targetGeos"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              placeholder="CA, TX, FL"
              required
            />
          </label>

          <label className="text-sm text-slate-200 md:col-span-2">
            Goal / Notes
            <textarea className="mt-1 h-32 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          </label>

          <div className="md:col-span-2">
            <button type="submit" className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-500">
              Submit campaign
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
