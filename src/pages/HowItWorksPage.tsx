import { FileText, Headphones, UserCheck, Star, Briefcase, Home, CheckCircle } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import supportBg from '@/assets/support-bg.jpg';
import heroHowItWorks from '@/assets/hero-how-it-works.jpg';

const homeownerSteps = [
  {
    icon: FileText,
    title: "Post your job for free",
    description: "Describe your project in detail. Include what work needs to be done, your timeline, and your budget range. The more details you provide, the better quotes you'll receive.",
  },
  {
    icon: Headphones,
    title: "Receive quotes from service providers",
    description: "Up to 3 qualified service providers will review your job and send you personalised quotes. You can compare prices, read reviews, and ask questions before making a decision.",
  },
  {
    icon: UserCheck,
    title: "Choose and hire",
    description: "Review service provider profiles, check their ratings and past work, then hire the one that's right for you. Communicate directly through our messaging system.",
  },
  {
    icon: Star,
    title: "Rate the service",
    description: "After the job is complete, leave a review to help other homeowners find great service providers. Your feedback helps maintain quality on our platform.",
  },
];

const providerSteps = [
  {
    icon: Briefcase,
    title: "Create your profile",
    description: "Sign up as a service provider and build your professional profile. Add your services, service areas, qualifications, and photos of your past work.",
  },
  {
    icon: FileText,
    title: "Browse available jobs",
    description: "Search for jobs in your area that match your skills. Filter by category, location, and budget to find the perfect opportunities.",
  },
  {
    icon: Headphones,
    title: "Send quotes to homeowners",
    description: "When you find a job you're interested in, send a personalised quote. Explain why you're the right choice and provide a competitive price.",
  },
  {
    icon: CheckCircle,
    title: "Win work and grow",
    description: "Get hired, complete the job to a high standard, and earn great reviews. Build your reputation and grow your business through our platform.",
  },
];

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="How Kluje Works | Post a Job & Get Matched | Kluje"
        description="Post your job for free, receive quotes from up to 3 verified providers, compare profiles and reviews, then hire the best fit. Simple, free, and transparent."
        pageType="how-it-works"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kluje.com" },
                { "@type": "ListItem", "position": 2, "name": "How It Works", "item": "https://kluje.com/how-it-works" }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                { "@type": "Question", "name": "Is it free to post a job on Kluje?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, posting a job on Kluje is completely free. You describe your project, and up to 3 verified service providers will send you personalised quotes at no cost." } },
                { "@type": "Question", "name": "How many quotes will I receive?", "acceptedAnswer": { "@type": "Answer", "text": "You can receive up to 3 quotes from qualified, verified service providers. This lets you compare prices, profiles, and reviews before making a decision." } },
                { "@type": "Question", "name": "How does Kluje verify service providers?", "acceptedAnswer": { "@type": "Answer", "text": "Service providers complete a verification process including business registration, insurance documentation, and qualifications review. Verified providers display a trust badge on their profile." } },
                { "@type": "Question", "name": "Can I communicate with providers before hiring?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. Once a provider sends a quote, you can message them directly through Kluje to ask questions, discuss project details, and negotiate before committing." } },
                { "@type": "Question", "name": "What happens after I hire a provider?", "acceptedAnswer": { "@type": "Answer", "text": "After the job is complete, you can rate and review the service provider. Your feedback helps maintain quality across the platform and assists other homeowners in making informed decisions." } }
              ]
            }
          ]
        }}
      />
      <Navbar />
      
      <PageHero
        backgroundImage={heroHowItWorks}
        title="How It Works"
        description="Whether you're a homeowner looking for help or a service provider seeking new clients, Kluje makes it easy to connect and get work done."
      />

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* For Homeowners */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">For Homeowners</h2>
              <p className="text-muted-foreground">Find trusted service providers for any job</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {homeownerSteps.map((step, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <step.icon className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild size="lg" variant="hero" className="font-signature normal-case tracking-normal font-normal text-2xl md:text-3xl">
              <Link to="/post-job">Just Kluje it</Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Not sure who to hire? <Link to="/browse-providers" className="text-primary font-medium hover:underline">Browse rated service providers near you</Link> or{" "}
              <Link to="/ask-expert" className="text-primary font-medium hover:underline">ask an expert for free advice</Link>.
            </p>
          </div>
        </section>

        {/* For Service Providers */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">For Service Providers</h2>
              <p className="text-muted-foreground">Grow your business and find new clients</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providerSteps.map((step, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <step.icon className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <Link to="/auth?type=provider">Join as a Provider</Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Already registered? <Link to="/pricing" className="text-primary font-medium hover:underline">View subscription plans</Link> to start quoting on jobs.
            </p>
          </div>
        </section>

        <section 
          className="relative rounded-2xl overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${supportBg})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Still have questions?</h2>
            <p className="text-white/80 mb-4">
              Get in touch with our team and we'll be happy to help.
            </p>
            <Button asChild variant="hero" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
