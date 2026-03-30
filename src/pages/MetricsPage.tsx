import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  { label: "Active Advertisers", value: "320+", delta: "+18% this quarter" },
  { label: "Campaigns Delivered", value: "4,800+", delta: "+22% this quarter" },
  { label: "Total Impressions", value: "12.4M", delta: "+31% this quarter" },
  { label: "Average CTR", value: "3.8%", delta: "+0.4pp vs industry avg" },
  { label: "Lead Conversion Rate", value: "14.2%", delta: "+2.1pp this quarter" },
  { label: "Avg. Cost per Lead", value: "$18.50", delta: "−12% this quarter" },
  { label: "Marketplace Reach", value: "48 metros", delta: "+6 new this quarter" },
  { label: "Uptime SLA", value: "99.97%", delta: "Last 90 days" },
];

export default function MetricsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Platform Performance Metrics | Kluje"
        description="Transparent performance data for the Kluje marketplace — advertisers, campaigns, impressions, CTR, and lead conversion rates updated quarterly."
      />
      <Navbar />

      <PageHero
        title="Platform Metrics"
        description="Transparent performance data updated quarterly."
        variant="compact"
      />

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label} className="border-border">
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{m.value}</p>
                <p className="mt-1 text-xs text-primary">{m.delta}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-border">
          <CardContent className="pt-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">How we measure</h2>
            <p className="text-sm text-muted-foreground">
              All metrics are derived from anonymised, aggregated campaign data across the Kluje
              marketplace. Impressions and clicks are deduplicated using session-level
              fingerprinting. Conversion events are tracked via server-side callbacks from
              advertiser endpoints. We publish updated figures at the start of each calendar
              quarter.
            </p>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
