import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function PrivacyRequestPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Data Subject Access Request | Kluje"
        description="Submit a request to access, correct, or delete your personal data held by Kluje. Exercise your rights under CCPA, CPRA, and US privacy laws."
      />
      <Navbar />

      <PageHero
        title="Data Subject Request"
        description="Submit a request to access, correct, or delete your personal data."
        variant="compact"
      />

      <section className="container mx-auto max-w-2xl px-4 py-12">
        {/* Sub-nav */}
        <nav className="mb-8 flex flex-wrap gap-2 text-sm">
          <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/privacy/preferences" className="text-muted-foreground hover:text-primary transition-colors">Preferences</Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/privacy/do-not-sell" className="text-muted-foreground hover:text-primary transition-colors">Do Not Sell</Link>
        </nav>

        {submitted ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Request Received</h2>
              <p className="text-sm text-muted-foreground">
                We'll process your request within 30 days and contact you at the email provided.
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
                  <Label>Full Name</Label>
                  <Input required placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input required type="email" placeholder="jane@company.com" />
                </div>
                <div className="space-y-2">
                  <Label>Request Type</Label>
                  <select
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select…</option>
                    <option value="access">Access my data</option>
                    <option value="correct">Correct my data</option>
                    <option value="delete">Delete my data</option>
                    <option value="port">Export / port my data</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Details (optional)</Label>
                  <Textarea rows={3} placeholder="Provide any additional context…" />
                </div>
                <Button type="submit">Submit Request</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </section>

      <Footer />
    </div>
  );
}
