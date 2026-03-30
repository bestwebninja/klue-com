import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart3, Layout, MapPin, CreditCard } from "lucide-react";

const features = [
  {
    icon: Layout,
    title: "Campaign Builder",
    description:
      "Create targeted ad campaigns with geo-filtering, budget caps, and AI-optimised placements — all from a single screen.",
    cta: { label: "Try Campaign Builder →", to: "/post-job" },
  },
  {
    icon: BarChart3,
    title: "Advertiser Dashboard",
    description:
      "Monitor impressions, clicks, and conversions in real time. View lead quality scores and ROI analytics.",
    cta: { label: "Explore Dashboard →", to: "/dashboard" },
  },
  {
    icon: MapPin,
    title: "Placement Intelligence",
    description:
      "See where your ads appear across the Kluje marketplace and how each placement performs.",
    cta: { label: "View Placements →", to: "/browse-providers" },
  },
  {
    icon: CreditCard,
    title: "Billing & Plans",
    description:
      "Transparent Stripe-backed billing. Upgrade, downgrade, or cancel anytime.",
    cta: { label: "Review Billing →", to: "/pricing" },
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Live Demo | Kluje Ad Platform"
        description="See Kluje Ad Platform in action — explore dashboards, campaigns, and analytics."
      />
      <Navbar />

      <PageHero
        title="Live Demo"
        description="See the Kluje Ad Platform in action — explore dashboards, campaigns, and analytics."
        variant="compact"
      />

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={f.cta.to}>{f.cta.label}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Ready to launch your first campaign?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up in minutes — no credit card required for the starter trial.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/auth?type=provider">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
