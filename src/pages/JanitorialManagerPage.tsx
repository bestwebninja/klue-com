import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";

// ─────────────────────────────────────────────────────────────────────────────
// SHOPIFY PRODUCT URLs — update each value with the exact product page URL
// from https://kluje.app/collections/all  (9 products total)
// Format: https://kluje.app/products/<product-handle>
// ─────────────────────────────────────────────────────────────────────────────
const SHOPIFY_URLS: Record<string, string> = {
  "starter-monthly":             "https://kluje.app/products/cleanscope-ai-v1-starter-monthly?variant=44995551527120",
  "starter-annual":              "https://kluje.app/products/cleanscope-ai-v1-starter-annual?variant=44995551625424",
  "starter-annual_veteran":      "https://kluje.app/products/cleanscope-ai-v1-starter-annual-veteran?variant=44995551723728",
  "professional-monthly":        "https://kluje.app/products/cleanscope-ai-v1-pro-monthly?variant=44995551592656",
  "professional-annual":         "https://kluje.app/products/cleanscope-ai-v1-pro-annual?variant=44995551690960",
  "professional-annual_veteran": "https://kluje.app/products/cleanscope-ai-v1-pro-annual-veteran?variant=44995551789264",
  "growth-monthly":              "https://kluje.app/products/cleanscope-ai-v1-growth-monthly?variant=44995551559888",
  "growth-annual":               "https://kluje.app/products/cleanscope-ai-v1-growth-annual?variant=44995551658192",
  "growth-annual_veteran":       "https://kluje.app/products/cleanscope-ai-v1-growth-annual-veteran?variant=44995551756496",
};

type BillingCycle = "monthly" | "annual" | "annual_veteran";
type PlanKey = "starter" | "professional" | "growth";

const PLANS = {
  starter: {
    name: "Starter",
    monthly: 14.99,
    annual: 12.49,
    annualTotal: 149.90,
    veteranMonthly: 11.24,
    veteranTotal: 134.91,
    users: "per user / mo",
    popular: false,
    features: [
      "Core AI bidding engine",
      "Up to 5 users",
      "Basic proposal builder",
      "Pipeline tracking",
      "Email quote output",
      "CSV export",
    ],
  },
  professional: {
    name: "Pro",
    monthly: 149.99,
    annual: 124.99,
    annualTotal: 1499.90,
    veteranMonthly: 112.49,
    veteranTotal: 1349.91,
    users: "per user / mo",
    popular: true,
    features: [
      "Everything in Starter",
      "Full CRM & pipeline",
      "AI Sales Reports",
      "Weather + Traffic intel",
      "Dual email system",
      "Client + Rep branding",
      "Win probability scores",
    ],
  },
  growth: {
    name: "Growth",
    monthly: 49.99,
    annual: 41.66,
    annualTotal: 499.90,
    veteranMonthly: 37.49,
    veteranTotal: 449.91,
    users: "per user / mo",
    popular: false,
    features: [
      "Everything in Pro",
      "Priority support (4hr SLA)",
      "Advanced CRM sync",
      "Custom branding",
      "API access",
      "Dedicated account manager",
    ],
  },
} as const;

const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "Monthly",
  annual: "Annual",
  annual_veteran: "Annual Veteran",
};

function getShopifyUrl(plan: PlanKey, cycle: BillingCycle): string {
  return SHOPIFY_URLS[`${plan}-${cycle}`] ?? "https://kluje.app/collections/all";
}

function getPricing(plan: typeof PLANS[PlanKey], cycle: BillingCycle) {
  if (cycle === "monthly") {
    return { price: plan.monthly, sub: null };
  }
  if (cycle === "annual_veteran") {
    return { price: plan.veteranMonthly, sub: `$${plan.veteranTotal}/yr — 3 months off` };
  }
  return { price: plan.annual, sub: `$${plan.annualTotal}/yr — 2 months included` };
}

const territories = [
  {
    state: "California",
    links: [{ label: "Janitorial California", to: "/janitorial-manager#territory-california" }],
  },
  {
    state: "Florida",
    links: [{ label: "Janitorial Florida", to: "/janitorial-manager#territory-florida" }],
  },
  {
    state: "Georgia",
    links: [{ label: "Janitorial Georgia", to: "/janitorial-manager#territory-georgia" }],
  },
  {
    state: "New York",
    links: [{ label: "Janitorial New York", to: "/janitorial-manager#territory-new-york" }],
  },
  {
    state: "Texas",
    links: [{ label: "Janitorial Texas", to: "/janitorial-manager#territory-texas" }],
  },
  {
    state: "Washington",
    links: [
      { label: "Janitorial Washington", to: "/janitorial-manager#territory-washington" },
      { label: "Janitorial Seattle Platform", to: "/janitorial-manager#territory-seattle-platform" },
    ],
  },
];

export default function JanitorialManagerPage() {
  const [cycle, setCycle] = useState<BillingCycle>("annual");

  return (
    <main className="bg-background text-foreground">
      <SeoHead
        title="Janitorial Manager | Territory Intelligence Platform"
        description="Janitorial Manager helps janitorial businesses scale operations and route demand using ZIP-based territory intelligence."
        canonical={`${(import.meta.env.VITE_PUBLIC_SITE_URL || "https://kluje.com").replace(/\/$/, "")}/janitorial-manager`}
      />

      {/* ── Hero / Territory section ───────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Janitorial Manager</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Built for local growth and territory precision.</h1>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              Align your operations with where demand is strongest. Janitorial Manager combines workflow control with
              data-driven territory strategy.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Active Territories</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {territories.map((territory) => (
                <article
                  id={`territory-${territory.state.toLowerCase().replace(/\s+/g, "-")}`}
                  key={territory.state}
                  className="rounded-xl border border-border/80 bg-background/60 p-4"
                >
                  <h2 className="text-sm font-semibold text-foreground">{territory.state}</h2>
                  {territory.state === "Washington" ? (
                    <span id="territory-seattle-platform" className="sr-only">Seattle platform territory</span>
                  ) : null}
                  <ul className="mt-3 space-y-2">
                    {territory.links.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.to}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        >
                          {item.label}
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing / Subscription section ────────────────────────────────── */}
      <section id="pricing" className="border-t border-border bg-muted/20 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">CleanScope AI Plans</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, transparent pricing.</h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Choose the plan that fits your janitorial operation. Pay online securely via Shopify or contact us for ACH / wire.
            </p>

            {/* Billing cycle toggle */}
            <div className="inline-flex items-center gap-1 rounded-2xl border border-border bg-background p-1 mt-2">
              {(["monthly", "annual", "annual_veteran"] as BillingCycle[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCycle(c)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    cycle === c
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c === "monthly" && "Monthly"}
                  {c === "annual" && (
                    <span className="flex items-center gap-2">
                      Annual
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white">Save 10%</span>
                    </span>
                  )}
                  {c === "annual_veteran" && (
                    <span className="flex items-center gap-2">
                      Annual Veteran
                      <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">3 months off</span>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {cycle === "monthly" && (
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Annual plans include 2 free months. Veteran annual includes 3 months off.
              </p>
            )}
            {cycle === "annual_veteran" && (
              <p className="text-xs text-muted-foreground mt-1">
                Veteran annual discount — 3 months included at no extra cost. Thank you for your service.
              </p>
            )}
          </div>

          {/* Plan cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {(["starter", "professional", "growth"] as PlanKey[]).map((planKey) => {
              const plan = PLANS[planKey];
              const { price, sub } = getPricing(plan, cycle);
              const shopifyUrl = getShopifyUrl(planKey, cycle);

              return (
                <article
                  key={planKey}
                  className={`relative flex flex-col rounded-2xl border bg-card p-7 shadow-sm transition-shadow hover:shadow-md ${
                    plan.popular ? "border-primary ring-2 ring-primary/30" : "border-border"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.users}</p>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold">${price}</span>
                      <span className="mb-1 text-muted-foreground">/mo</span>
                    </div>
                    {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
                    {!sub && cycle === "monthly" && (
                      <p className="mt-1 text-xs text-muted-foreground">Billed month-to-month. Cancel anytime.</p>
                    )}
                  </div>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 space-y-3">
                    {/* Primary CTA — Shopify checkout */}
                    <a
                      href={shopifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                        plan.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-primary text-primary hover:bg-primary/10"
                      }`}
                    >
                      Buy {plan.name} — {CYCLE_LABELS[cycle]}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>

                    {/* Secondary — ACH / Wire enquiry */}
                    <a
                      href="mailto:marcus@kluje.com?subject=ACH%20%2F%20Wire%20Subscription%20Enquiry"
                      className="flex w-full items-center justify-center rounded-xl border border-border px-5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      Pay via ACH / Wire instead
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Footer notes */}
          <div className="mt-10 space-y-3 text-center text-xs text-muted-foreground">
            <p>
              Online payment is processed securely by <strong className="text-foreground">Shopify</strong> on{" "}
              <strong className="text-foreground">www.kluje.app</strong>. Kluje never stores your card details.
            </p>
            <p>
              <strong className="text-foreground">White Label?</strong> White Label is a separate, request-led
              engagement.{" "}
              <a href="mailto:marcus@kluje.com" className="underline hover:text-foreground">
                Contact us directly.
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── ZIP Code Intelligence section ─────────────────────────────────── */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">ZIP Code = Territory Intelligence</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            ZIP code is a critical signal for how janitorial businesses grow. It defines your service territory,
            unlocks local demand visibility, and powers how opportunities are routed to you.
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">By collecting ZIP code upfront, we:</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground marker:text-primary">
            <li>Map your operating territory</li>
            <li>Identify where you can win more contracts</li>
            <li>Route relevant inquiries based on proximity and service fit</li>
            <li>Build long-term geo-based lead flow aligned with your growth</li>
          </ul>
          <p className="mt-4 text-base leading-7 text-foreground">
            This is not just location — it is how your pipeline is built.
          </p>
        </div>
      </section>
    </main>
  );
}
