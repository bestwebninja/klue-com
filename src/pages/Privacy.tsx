import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Check, X } from 'lucide-react';
import { getCookieConsent, resetCookieConsent, type ConsentStatus } from '@/components/CookieConsent';
import { SEOHead } from '@/components/SEOHead';
import heroPrivacy from '@/assets/hero-privacy.jpg';

const Privacy = () => {
  const [cookieStatus, setCookieStatus] = useState<ConsentStatus>(null);

  useEffect(() => {
    setCookieStatus(getCookieConsent());
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Privacy Policy | Kluje" description="Learn how Kluje collects, stores, and protects your personal data. Our privacy policy covers cookies, third-party sharing, and your rights." pageType="privacy" />
      <Navbar />

      <PageHero
        backgroundImage={heroPrivacy}
        title="Privacy Policy"
        description="How we collect, use, and protect your personal information"
        variant="compact"
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground">
              We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
              <li><strong>Profile Information:</strong> Company name, bio, and profile picture for service providers</li>
              <li><strong>Location Data:</strong> Address and location information for job listings and service areas</li>
              <li><strong>Communications:</strong> Messages exchanged between users through our platform</li>
              <li><strong>Job Information:</strong> Details about jobs posted or quoted on</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Connect homeowners with service providers</li>
              <li>Send notifications about job updates, messages, and account activity</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyse trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Information Sharing</h2>
            <p className="text-muted-foreground">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>With Other Users:</strong> Your profile information may be visible to other users of the platform</li>
              <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf</li>
              <li><strong>Legal Requirements:</strong> If required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-6 border border-border mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Your Cookie Preferences</h3>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-muted-foreground">Current status:</span>
                {cookieStatus === 'accepted' ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    <Check className="h-3 w-3 mr-1" />
                    Accepted
                  </Badge>
                ) : cookieStatus === 'declined' ? (
                  <Badge variant="destructive">
                    <X className="h-3 w-3 mr-1" />
                    Declined
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not set</Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {cookieStatus === 'accepted' 
                  ? 'You have accepted analytics cookies. We use Google Analytics to understand how visitors use our site.'
                  : cookieStatus === 'declined'
                  ? 'You have declined analytics cookies. No tracking data is being collected.'
                  : 'You have not yet set your cookie preferences.'}
              </p>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetCookieConsent}
              >
                <Settings className="h-4 w-4 mr-2" />
                Change Cookie Preferences
              </Button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our service is not intended for use by children under the age of 18. We do not knowingly collect personal information from children under 18.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us through our website.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
