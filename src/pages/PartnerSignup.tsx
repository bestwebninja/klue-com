import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import { PartnerOnboardingWizard } from '@/components/partners/PartnerOnboardingWizard';
import heroBusiness from '@/assets/hero-business.jpg';

const PartnerSignup = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Kluje Partners | Partner Signup"
        description="Complete detailed Kluje partner onboarding with role-based steps, compliance uploads, territory coverage, and integration setup."
      />
      <Navbar />

      <PageHero
        backgroundImage={heroBusiness}
        imageAlt="Kluje detailed partner onboarding wizard"
        title="Kluje Partners Onboarding"
        description="Apply as a verified Kluje partner with role-based onboarding, compliance checks, and structured territory plus catalog coverage."
        variant="compact"
      />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <PartnerOnboardingWizard />
      </main>

      <Footer />
    </div>
  );
};

export default PartnerSignup;
