import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Medal, Shield, Star, BrainCircuit } from "lucide-react";
import heroManifestoHome from "@/assets/hero-manifesto-home.jpg";
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

function PlatformManifestoCTA() {
  return (
    <section
      className="relative py-16 px-4 text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${heroManifestoHome})` }}
      role="img"
      aria-label="Kluje Platform Manifesto — AI architecture, biometric intelligence, and predictive dashboards"
    >
      <div className="absolute inset-0 bg-slate-900/70" />
      <div className="relative max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Living Document · Updated Continuously
        </div>
        <h2 className="text-3xl md:text-4xl font-bold">The Kluje Platform Manifesto</h2>
        <p className="text-lg text-blue-100 max-w-2xl mx-auto">
          A deep, continuously evolving document covering our neural AI architecture, biometric site
          intelligence, veteran programs, predictive dashboard, and the data moat no competitor can replicate.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/platform-manifesto"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold px-6 py-2.5 text-sm hover:bg-primary/90 transition-colors"
          >
            Read the Manifesto
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center rounded-md border border-border text-white font-semibold px-6 py-2.5 text-sm hover:bg-accent/20 transition-colors"
          >
            View Pricing
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-2xl mx-auto text-sm">
          {["11 Verticals", "50 States", "24/7 AI Voice", "Veteran-First"].map((stat) => (
            <div key={stat} className="bg-white/10 rounded-lg p-3 text-center font-medium">
              {stat}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ZipExplorerEntry() {
  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-5xl rounded-lg border bg-card p-6">
        <h2 className="text-2xl font-semibold">New: USA ZIP Explorer</h2>
        <p className="mt-2 text-muted-foreground">Explore Census-backed ZIP and ZCTA public profiles before posting your project.</p>
        <div className="mt-3 flex gap-4 text-sm">
          <Link to="/zip-explorer" className="inline-block text-primary underline">Open ZIP Explorer</Link>
          <Link to="/zip/90210" className="inline-block text-primary underline">Try ZIP 90210</Link>
        </div>
      </div>
    </section>
  );
}

function VeteransSection() {
  const features = [
    {
      icon: <Medal className="h-6 w-6 text-primary" />,
      title: "Veteran Badge",
      description:
        "Every veteran-owned business on Kluje displays a verified Veteran-Owned badge, building instant trust with customers who want to support those who served.",
    },
    {
      icon: <BrainCircuit className="h-6 w-6 text-muted-foreground" />,
      title: "Veterans AI Agent",
      description:
        "Our dedicated Veterans AI Agent helps veteran providers grow their business — from profile optimisation to lead follow-ups — tailored to the veteran community.",
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      title: "Veterans Hire Veterans",
      description:
        "Kluje's intelligent matching surfaces veteran-owned providers first when a job-poster indicates a preference for veteran businesses, closing the loop on community support.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-secondary text-foreground">
      <div className="max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1 text-sm text-primary font-semibold">
          <Shield className="h-4 w-4" />
          Veteran-First Platform
        </div>
        <h2 className="text-3xl md:text-4xl font-bold">Built for Those Who Served</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Kluje is proud to champion veteran-owned businesses across every trade, service, and
          profession. From a dedicated AI agent to community-driven matching, we put veterans first.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-card border border-primary/30 rounded-xl p-6 text-left space-y-3"
          >
            <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-primary">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/pricing#veterans"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-bold px-8 py-3 text-sm hover:bg-primary/90 transition-colors"
        >
          <Medal className="h-4 w-4 mr-2" />
          Explore Veterans Pricing
        </Link>
      </div>
    </section>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Find Trusted Service Providers in the US | Kluje AI Platform"
        description="Post a job for free and get up to 3 quotes from verified US contractors and service providers. Kluje AI risk intelligence, AI Voice, and predictive dashboard power the built economy. Trusted across all 50 states."
        pageType="homepage"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://kluje.com/#organization",
              "name": "Kluje",
              "url": "https://kluje.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://kluje.com/og-image.jpg",
                "width": 1200,
                "height": 630
              },
              "description": "Kluje is an AI-powered neural command platform connecting US homeowners, businesses, and professionals in the built economy with trusted service providers.",
              "sameAs": ["https://x.com/Kluje"],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://kluje.com/contact"
              }
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://kluje.com/#localbusiness",
              "name": "Kluje",
              "url": "https://kluje.com",
              "logo": "https://kluje.com/og-image.jpg",
              "image": "https://kluje.com/og-image.jpg",
              "description": "AI-powered platform connecting homeowners and businesses with trusted, verified service providers across all 50 US states.",
              "address": {
                "@type": "PostalAddress",
                "addressRegion": "WY",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 42.756,
                "longitude": -107.3025
              },
              "areaServed": {
                "@type": "Country",
                "name": "United States"
              },
              "priceRange": "Free - $$",
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
                "opens": "00:00",
                "closes": "23:59"
              },
              "sameAs": ["https://x.com/Kluje"],
              "parentOrganization": { "@id": "https://kluje.com/#organization" }
            },
            {
              "@type": "WebSite",
              "@id": "https://kluje.com/#website",
              "name": "Kluje",
              "url": "https://kluje.com",
              "publisher": { "@id": "https://kluje.com/#organization" },
              "description": "Find trusted service providers in the US. Post a job for free and get quotes from verified professionals powered by AI risk intelligence.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://kluje.com/browse-providers?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kluje.com" }
              ]
            }
          ]
        }}
      />
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <HomepageIntro />
        <HowItWorks />
        <ZipExplorerEntry />
        <Suspense fallback={null}>
          <SocialJobPosts />
          <CTASection />
          <ServiceProvidersSection />
          <ServiceProviderTypes />
          <WhyChooseKluje />
          <CTASection />
          <AskExpertSection />
          <FeaturedBlog />
          <PlatformManifestoCTA />
          <VeteransSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
