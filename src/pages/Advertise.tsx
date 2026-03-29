import {
  ArrowRight,
  BadgeDollarSign,
  Bot,
  ChartNoAxesColumnIncreasing,
  Crown,
  Flag,
  Globe,
  Handshake,
  Home,
  Search,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const heroStats = [
  "70,000+ monthly active users",
  "Majority US-based traffic",
  "High-intent search behavior",
  "Rapid growth in last 30 days",
];

const conversionDrivers = [
  "Users searching for services → immediate intent",
  "Marketplace environment → decision-stage traffic",
  "AI-driven matching → higher conversion rates",
  "Strong direct traffic → brand-driven user base",
];

const audienceRegions = [
  { icon: Flag, label: "United States", detail: "Primary audience" },
  { icon: Globe, label: "United Kingdom", detail: "Secondary audience" },
  { icon: Sparkles, label: "European Union", detail: "Expansion underway" },
];

const intentSegments = [
  { icon: Users, label: "Contractors & service providers" },
  { icon: Home, label: "Real estate buyers & investors" },
  { icon: Search, label: "Property service seekers" },
  { icon: Handshake, label: "B2B service demand" },
];

const adOpportunities = [
  {
    icon: Target,
    title: "Sponsored Listings",
    description: "Appear at the top of search results in your category.",
  },
  {
    icon: Star,
    title: "Featured Placement",
    description: "Homepage + category exposure with priority ranking.",
  },
  {
    icon: Bot,
    title: "AI-Powered Placement",
    description: "Injected directly into Kluje's AI recommendation engine.",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: "Lead Generation Campaigns",
    description: "Receive direct user inquiries.",
  },
  {
    icon: BadgeDollarSign,
    title: "API / Data Partnerships",
    description: "Integrate your offering into the Kluje ecosystem.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$1,500/month",
    features: ["Category placement", "1 featured listing", "Basic analytics"],
  },
  {
    name: "Growth",
    price: "$4,500/month",
    featured: true,
    features: ["Top-of-category positioning", "AI recommendation inclusion", "Lead generation enabled"],
  },
  {
    name: "Dominance",
    price: "$9,500+/month",
    features: ["Category exclusivity", "Homepage placement", "Priority AI ranking", "Dedicated campaign manager"],
  },
];

const performanceAdvantages = [
  "High-intent traffic (not social noise)",
  "Lower cost-per-acquisition vs Google Ads",
  "Direct user engagement",
  "Marketplace-driven conversions",
];

const emailMediaKit = "mailto:partners@kluje.com?subject=Request%20Media%20Kit";
const emailCall = "mailto:partners@kluje.com?subject=Book%20Partnership%20Call";
const emailLaunch = "mailto:partners@kluje.com?subject=Launch%20Campaign%20on%20Kluje";

export default function Advertise() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Kluje Partnerships | Reach 70,000+ High-Intent Users"
        description="Launch partnership campaigns on Kluje and reach high-intent users actively searching for contractors, real estate opportunities, and service providers."
        pageType="website"
      />
      <Navbar />

      <section className="relative isolate overflow-hidden border-b border-border bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            <Crown className="h-3.5 w-3.5" />
            Partnership Programs
          </p>

          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-primary via-violet-500 to-sky-500 bg-clip-text text-transparent">
              Reach 70,000+ High-Intent Users
            </span>{" "}
            Actively Searching for Services
          </h1>

          <p className="mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg">
            Kluje is an AI-powered service marketplace connecting users with contractors, real estate
            opportunities, and service providers across the United States.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((item) => (
              <Card key={item} className="border-primary/10 bg-background/70 shadow-sm backdrop-blur">
                <CardContent className="pt-5 text-sm font-medium text-foreground">{item}</CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="group">
              <a href={emailMediaKit}>
                Request Media Kit
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={emailCall}>Book Partnership Call</a>
            </Button>
            <p className="text-sm font-semibold text-primary">👉 Launch your campaign in under 48 hours</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <h2 className="text-2xl font-semibold sm:text-3xl">Why Kluje Converts</h2>
        <p className="mt-2 text-muted-foreground">This is NOT passive traffic — this is active demand.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {conversionDrivers.map((item) => (
            <Card key={item} className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-start gap-3 pt-6 text-muted-foreground">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <h2 className="text-2xl font-semibold sm:text-3xl">Audience Snapshot</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {audienceRegions.map((region) => (
              <Card key={region.label}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <region.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{region.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">{region.detail}</CardContent>
              </Card>
            ))}
          </div>

          <h3 className="mt-10 text-lg font-semibold">User Intent Segments</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {intentSegments.map((segment) => (
              <Card key={segment.label} className="h-full border-primary/15">
                <CardContent className="flex items-center gap-3 pt-6">
                  <segment.icon className="h-4 w-4 text-primary" />
                  <p className="text-sm text-foreground">{segment.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <h2 className="text-2xl font-semibold sm:text-3xl">Advertising Opportunities</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adOpportunities.map((option) => (
            <Card key={option.title} className="h-full">
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <option.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{option.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <h2 className="text-2xl font-semibold sm:text-3xl">Pricing (Anchor Structure)</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.featured ? "border-primary shadow-lg shadow-primary/10" : "border-border"}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl">
                    {plan.name}
                    {plan.featured && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        Most Popular
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-2xl font-bold text-foreground">{plan.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <h2 className="text-2xl font-semibold sm:text-3xl">Performance Advantage</h2>
        <p className="mt-2 text-muted-foreground">Kluje delivers:</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {performanceAdvantages.map((item) => (
            <Card key={item}>
              <CardContent className="pt-6 text-muted-foreground">{item}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:py-16">
          <h2 className="text-2xl font-semibold sm:text-3xl">Start acquiring customers today</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="secondary" size="lg">
              <a href={emailMediaKit}>Request Media Kit</a>
            </Button>
            <Button
              asChild
              size="lg"
              className="border border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <a href={emailLaunch}>Launch Campaign</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
