import { lazy, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HomepageIntro } from "@/components/HomepageIntro";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { SEOHead } from "@/components/SEOHead";

// Below-fold sections – lazy loaded to improve FCP
const SocialJobPosts = lazy(() => import("@/components/SocialJobPosts").then(m => ({ default: m.SocialJobPosts })));
const CTASection = lazy(() => import("@/components/CTASection").then(m => ({ default: m.CTASection })));
const ServiceProvidersSection = lazy(() => import("@/components/ServiceProvidersSection").then(m => ({ default: m.ServiceProvidersSection })));
const ServiceProviderTypes = lazy(() => import("@/components/ServiceProviderTypes").then(m => ({ default: m.ServiceProviderTypes })));
const WhyChooseKluje = lazy(() => import("@/components/WhyChooseKluje").then(m => ({ default: m.WhyChooseKluje })));
const AskExpertSection = lazy(() => import("@/components/AskExpertSection").then(m => ({ default: m.AskExpertSection })));
const FeaturedBlog = lazy(() => import("@/components/FeaturedBlog").then(m => ({ default: m.FeaturedBlog })));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Find Trusted Service Providers in the UK | Kluje"
        description="Post a job for free and receive up to 3 quotes from verified UK tradespeople and contractors. Compare profiles, reviews, and hire with confidence."
        pageType="homepage"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://kluje.co.uk/#organization",
              "name": "Kluje",
              "url": "https://kluje.co.uk",
              "logo": {
                "@type": "ImageObject",
                "url": "https://kluje.co.uk/og-image.png",
                "width": 1200,
                "height": 630
              },
              "description": "Kluje connects UK homeowners and businesses with trusted, verified service providers across trades, events, health, IT and more.",
              "sameAs": [
                "https://x.com/Kluje"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://kluje.co.uk/contact"
              }
            },
            {
              "@type": "WebSite",
              "@id": "https://kluje.co.uk/#website",
              "name": "Kluje",
              "url": "https://kluje.co.uk",
              "publisher": { "@id": "https://kluje.co.uk/#organization" },
              "description": "Find trusted service providers in the UK. Post a job for free and get quotes from verified professionals.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://kluje.co.uk/browse-providers?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          ]
        }}
      />
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <HomepageIntro />
        <HowItWorks />
        <div className="container mx-auto px-4">
          <Separator className="my-8" />
        </div>
        <Suspense fallback={null}>
          <SocialJobPosts />
          <CTASection />
          <ServiceProvidersSection />
          <ServiceProviderTypes />
          <WhyChooseKluje />
          <CTASection />
          <AskExpertSection />
          <FeaturedBlog />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
