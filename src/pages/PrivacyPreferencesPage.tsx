import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const toggles = [
  { id: "essential", label: "Essential Cookies", description: "Required for the platform to function. Cannot be disabled.", locked: true },
  { id: "analytics", label: "Analytics Cookies", description: "Help us understand usage patterns to improve the product.", defaultOn: true },
  { id: "advertising", label: "Advertising Cookies", description: "Used for campaign targeting and conversion tracking.", defaultOn: false },
  { id: "marketing", label: "Marketing Communications", description: "Receive product updates and promotional emails.", defaultOn: false },
];

export default function PrivacyPreferencesPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Preferences | Kluje"
        description="Control how Kluje collects and uses your data, including cookie preferences."
      />
      <Navbar />

      <PageHero
        title="Privacy Preferences"
        description="Control how your data is collected and used."
        variant="compact"
      />

      <section className="container mx-auto max-w-2xl px-4 py-12">
        <nav className="mb-8 flex flex-wrap gap-2 text-sm">
          <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/privacy/request" className="text-muted-foreground hover:text-primary transition-colors">Data Request</Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/privacy/do-not-sell" className="text-muted-foreground hover:text-primary transition-colors">Do Not Sell</Link>
        </nav>

        <div className="space-y-4">
          {toggles.map((t) => (
            <Card key={t.id} className="border-border">
              <CardContent className="flex items-start justify-between gap-4 pt-5">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">{t.label}</Label>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                <Switch defaultChecked={t.locked || t.defaultOn} disabled={t.locked} />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={() => setSaved(true)}>Save Preferences</Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
