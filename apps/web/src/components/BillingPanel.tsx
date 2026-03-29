export function BillingPanel() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold text-white">Stripe Billing</h2>
      <p className="mt-2 text-sm text-slate-400">
        Active plan: <span className="text-white">Enterprise Annual</span>
      </p>
      <div className="mt-4 grid gap-3 text-sm text-slate-300">
        <div className="flex justify-between rounded bg-slate-800 p-3">
          <span>MRR</span>
          <span className="font-medium text-white">$92,440</span>
        </div>
        <div className="flex justify-between rounded bg-slate-800 p-3">
          <span>Failed Invoices (7d)</span>
          <span className="font-medium text-amber-300">3</span>
        </div>
        <button className="rounded-md bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600">
          Manage Subscription
        </button>
      </div>
    </section>
  );
}
