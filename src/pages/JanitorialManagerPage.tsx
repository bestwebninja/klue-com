import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";

const territories = [
  {
    state: "California",
    links: [
      { label: "Janitorial California", to: "/janitorial-manager#territory-california" },
    ],
  },
  {
    state: "Florida",
    links: [
      { label: "Janitorial Florida", to: "/janitorial-manager#territory-florida" },
    ],
  },
  {
    state: "Georgia",
    links: [
      { label: "Janitorial Georgia", to: "/janitorial-manager#territory-georgia" },
    ],
  },
  {
    state: "New York",
    links: [
      { label: "Janitorial New York", to: "/janitorial-manager#territory-new-york" },
    ],
  },
  {
    state: "Texas",
    links: [
      { label: "Janitorial Texas", to: "/janitorial-manager#territory-texas" },
    ],
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
  return (
    <main className="bg-background text-foreground">
      <SeoHead
        title="Janitorial Manager | Territory Intelligence Platform"
        description="Janitorial Manager helps janitorial businesses scale operations and route demand using ZIP-based territory intelligence."
        canonical={`${(import.meta.env.VITE_PUBLIC_SITE_URL || "https://kluje.com").replace(/\/$/, "")}/janitorial-manager`}
      />

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
                  {territory.state === "Washington" ? <span id="territory-seattle-platform" className="sr-only">Seattle platform territory</span> : null}
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

      <section className="border-y border-border bg-muted/20">
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
