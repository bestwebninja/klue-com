export function PartnerSignupWizard() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Partner Signup</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete the steps below to submit your application.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border p-4">Step 1: Partner Type</div>
        <div className="rounded-lg border p-4">Step 2: Business Identity</div>
        <div className="rounded-lg border p-4">Step 3: Address and Contacts</div>
      </div>
    </div>
  );
}
