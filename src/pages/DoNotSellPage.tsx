import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function DoNotSellPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Do Not Sell My Personal Information | Kluje"
        description="Exercise your rights under CCPA/CPRA — opt out of any data sharing classified as a sale."
      />
      <Navbar />

      <PageHero
        title="Do Not Sell My Personal Information"
        description="Exercise your rights under CCPA / CPRA and similar regulations."
        variant="compact"
      />

      <section className="container mx-auto max-w-2xl px-4 py-12">
        <nav className="mb-8 flex flex-wrap gap-2 text-sm">
          <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/privacy/request" className="text-muted-foreground hover:text-primary transition-colors">Data Request</Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/privacy/preferences" className="text-muted-foreground hover:text-primary transition-colors">Preferences</Link>
        </nav>

        <Card className="border-border mb-6">
          <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
            <p>
              Kluje does <strong className="text-foreground">not sell personal data</strong> to
              third parties. However, certain data sharing for advertising purposes may constitute
              a "sale" under California law (CCPA/CPRA).
            </p>
            <p>
              If you would like to opt out of any sharing that could be classified as a sale,
              submit the form below. We will process your request within 15 business days.
            </p>
          </CardContent>
        </Card>

        {submitted ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Opt-Out Confirmed</h2>
              <p className="text-sm text-muted-foreground">
                Your request has been recorded. You may still use all platform features.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border">
            <CardContent className="pt-6">
              <form
                onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input required type="email" placeholder="jane@company.com" />
                </div>
                <div className="space-y-2">
                  <Label>State / Region (optional)</Label>
                  <Input placeholder="e.g. California" />
                </div>
                <Button type="submit">Opt Out of Data Sales</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </section>

      <Footer />
    </div>
  );
}
