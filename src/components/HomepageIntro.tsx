import { Link } from 'react-router-dom';
import { CheckCircle, Shield, Star, MapPin } from 'lucide-react';

export function HomepageIntro() {
  return (
    <section aria-label="About Kluje" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
            Find Trusted Service Providers Across the US
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Kluje is America's growing marketplace connecting homeowners, landlords and businesses with
              trusted local service providers. Whether you need a{' '}
              <Link to="/services/home-diy-renovation" className="text-primary hover:underline">plumber in New York</Link>,
              an{' '}
              <Link to="/services/it-services" className="text-primary hover:underline">IT consultant in Chicago</Link>,
              or a{' '}
              <Link to="/services/events-catering" className="text-primary hover:underline">wedding caterer in Los Angeles</Link>,
              our platform makes it simple to find qualified professionals near you.
            </p>
            <p>
              Post your job for free and receive up to three tailored quotes from vetted contractors and
              service providers across all 50 states. Every professional on
              Kluje can be rated and reviewed, so you can compare credentials, pricing and past work before
              making a decision.
            </p>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50">
              <CheckCircle className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Free to Post</span>
              <span className="text-xs text-muted-foreground">No fees for homeowners</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Verified Providers</span>
              <span className="text-xs text-muted-foreground">ID &amp; insurance checked</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50">
              <Star className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Rated &amp; Reviewed</span>
              <span className="text-xs text-muted-foreground">Genuine customer feedback</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Nationwide Coverage</span>
              <span className="text-xs text-muted-foreground">Local pros, coast to coast</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
