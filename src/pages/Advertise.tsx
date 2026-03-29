import { Megaphone, Target, MapPin, BadgeDollarSign, BarChart3, Users } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const audienceHighlights = [
  "Homeowners and businesses actively searching for service providers",
  "US-focused buyer traffic with immediate project intent",
  "Category-level targeting across home, commercial, and IT services",
];

const partnershipOptions = [
  {
    icon: Target,
    title: "Sponsored Category Placement",
    description:
      "Feature your brand where buyers are already comparing providers in high-intent service categories.",
  },
  {
    icon: MapPin,
    title: "Geo-Targeted Campaigns",
    description:
      "Run city or region-level placements to reach buyers exactly where your sales teams operate.",
  },
  {
    icon: BadgeDollarSign,
    title: "Lead Generation Partnerships",
    description:
      "Build custom campaigns around qualified lead flow, including CPL and hybrid media models.",
  },
];

const whyAdvertisersChooseKluje = [
  {
    icon: Users,
    title: "High-Intent Audience",
    description: "Reach people already in decision mode, not passive browsers.",
  },
  {
    icon: BarChart3,
    title: "Performance Visibility",
    description: "Track impressions, click-through rates, and campaign-level outcomes.",
  },
  {
    icon: Megaphone,
    title: "Flexible Formats",
    description: "From sponsored listings to content partnerships and multi-channel campaigns.",
  },
];

export default function Advertise() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Advertise on Kluje | Reach High-Intent US Service Buyers"
        description="Partner with Kluje to reach high-intent US service buyers through sponsored placements, geo-targeted campaigns, and lead generation partnerships."
        pageType="website"
      />
      <Navbar />

      <section className="bg-muted/30 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Advertise on Kluje | Reach High-Intent US Service Buyers
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl">
            Connect your brand with customers who are actively searching for trusted service providers.
            Kluje helps advertisers reach in-market US buyers at the moment they are ready to act.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="mailto:partners@kluje.com?subject=Advertising%20Partnership%20Inquiry">
                Request Media Kit
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="mailto:partners@kluje.com?subject=Book%20a%20Partnership%20Call">Book a Partnership Call</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Who You Reach on Kluje</h2>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {audienceHighlights.map((item) => (
            <Card key={item} className="h-full">
              <CardContent className="pt-6 text-muted-foreground">{item}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Advertising Partnership Options</h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {partnershipOptions.map((option) => (
              <Card key={option.title} className="h-full">
                <CardHeader>
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <option.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">{option.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Why Brands Advertise with Kluje</h2>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {whyAdvertisersChooseKluje.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{item.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3">Start Your Advertising Partnership</h2>
          <p className="text-primary-foreground/85 max-w-2xl mx-auto mb-6">
            Tell us your goals and target markets. Our partnerships team will help you build a custom
            plan to reach high-intent US service buyers.
          </p>
          <Button asChild variant="secondary" size="lg">
            <a href="mailto:partners@kluje.com?subject=Start%20Advertising%20Partnership">Contact Partnerships Team</a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
