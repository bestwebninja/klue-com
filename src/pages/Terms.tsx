import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import { SEOHead } from '@/components/SEOHead';
import heroTerms from '@/assets/hero-terms.jpg';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Terms of Service | Kluje" description="Read the Kluje terms of service covering account use, job posting rules, provider obligations, and dispute resolution for all platform users." pageType="terms" />
      <Navbar />

      <PageHero
        backgroundImage={heroTerms}
        title="Terms of Service"
        description="The rules and guidelines for using our platform"
        variant="compact"
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using this service, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Use of Service</h2>
            <p className="text-muted-foreground">
              You agree to use this service only for lawful purposes and in accordance with these Terms. You agree not to use the service:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>In any way that violates any applicable national or international law or regulation</li>
              <li>To transmit any advertising or promotional material without our prior written consent</li>
              <li>To impersonate or attempt to impersonate the company, an employee, or another user</li>
              <li>To engage in any conduct that restricts or inhibits anyone's use of the service</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. User Accounts</h2>
            <p className="text-muted-foreground">
              When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p className="text-muted-foreground">
              You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Service Provider Terms</h2>
            <p className="text-muted-foreground">
              If you register as a service provider, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide accurate and truthful information about your services and qualifications</li>
              <li>Maintain all necessary licences, certifications, and insurance required for your trade</li>
              <li>Respond to quote requests in a timely and professional manner</li>
              <li>Deliver services as described and agreed upon with customers</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Homeowner Terms</h2>
            <p className="text-muted-foreground">
              If you register as a homeowner, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide accurate descriptions of the work required</li>
              <li>Communicate honestly with service providers</li>
              <li>Pay for services as agreed with the service provider</li>
              <li>Leave fair and honest reviews based on your actual experience</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              The service acts as a platform to connect homeowners with service providers. We are not responsible for the quality, safety, or legality of the services provided by service providers. Any disputes between users should be resolved directly between the parties involved.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms, please contact us through our website.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
