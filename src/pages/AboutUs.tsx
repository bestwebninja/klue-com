import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Users, Shield, Star, Zap, Home, Building2, Target, Heart,
} from 'lucide-react';
import aboutHero from '@/assets/about-hero.jpg';

const values = [
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'Every service provider is verified. Every review is genuine. We believe trust is the foundation of great work.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'We connect homeowners and businesses with skilled local professionals, strengthening communities one project at a time.',
  },
  {
    icon: Star,
    title: 'Quality Over Quantity',
    description: 'We focus on matching you with the right provider — not just any provider. Quality craftsmanship matters.',
  },
  {
    icon: Zap,
    title: 'Speed & Simplicity',
    description: 'Post a job in minutes, receive quotes fast, and hire with confidence. No hassle, no hidden fees.',
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About Us | Kluje - Connecting You With Trusted Service Providers"
        description="Learn about Kluje's mission to connect homeowners and businesses with verified, trusted service providers for every project."
        pageType="website"
      />
      <Navbar />

      <PageHero
        title="About Kluje"
        description="Your trusted platform for finding verified service providers — from home renovations to commercial projects and everything in between."
      />

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Kluje was built to solve a simple problem: finding reliable, skilled service providers
              shouldn't be a gamble. Whether you need a plumber for a leaky tap or a full commercial
              renovation team, Kluje connects you with vetted professionals who deliver quality work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="border-primary/20">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">For Homeowners</h3>
                  <p className="text-sm text-muted-foreground">
                    Post your job, receive quotes from verified providers, compare profiles and
                    reviews, then hire with confidence — all in one place.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">For Businesses</h3>
                  <p className="text-sm text-muted-foreground">
                    Find commercial service providers for shopfitting, maintenance, IT services,
                    and more. Kluje covers every sector.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            What We Stand For
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 p-3 rounded-xl bg-primary/10 w-fit">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Summary */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            How Kluje Works
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            It's simple. Post a job, get quotes from vetted professionals, choose the best fit,
            and leave a review when the work is done. That's it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/post-job">Post a Job</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Join the Kluje Community
          </h2>
          <p className="text-muted-foreground mb-8">
            Whether you're a homeowner looking for help or a service provider ready to grow your
            business, Kluje is the place to be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth?type=provider">List Your Business</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/browse-providers">Find a Provider</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
