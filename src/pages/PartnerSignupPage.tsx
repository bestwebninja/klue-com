import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { PartnerSignupWizard } from '@/components/partners/PartnerSignupWizard';
import { SEOHead } from '@/components/SEOHead';

const PartnerSignupPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Kluje Partners | Become a Verified Partner"
        description="Apply to become a verified Kluje partner and offer services, products, or both through our onboarding process."
        pageType="website"
      />
      <Navbar />

      <main className="min-h-screen bg-background">
        <section className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Kluje Partners</h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Join Kluje as a verified partner. Apply to offer services, products, or both through our partner onboarding process.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-10">
          <PartnerSignupWizard />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PartnerSignupPage;
