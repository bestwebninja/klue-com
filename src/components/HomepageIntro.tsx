import { Link } from 'react-router-dom';
import { Cpu, TrendingUp, Network, Zap } from 'lucide-react';

export function HomepageIntro() {
  return (
    <section aria-label="About Kluje" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
            The AI Platform Powering America's Built Economy
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Kluje is America's most advanced AI-powered management platform — built to serve every sector
              of the built economy under one intelligent roof. From{' '}
              <Link to="/services/build-ops" className="text-primary hover:underline">licensed contractors and specialist trades</Link>
              {' '}to{' '}
              <Link to="/services/capital" className="text-primary hover:underline">construction finance and capital</Link>,{' '}
              <Link to="/services/legal-shield" className="text-primary hover:underline">legal protection</Link>,{' '}
              <Link to="/services/property-deals" className="text-primary hover:underline">real estate investment</Link>,
              and{' '}
              <Link to="/services/ai-core" className="text-primary hover:underline">AI-driven business automation</Link>
              {' '}— Kluje connects every professional, every deal, and every dollar across all 50 states.
            </p>
            <p>
              Our intelligent sales funnel routes verified opportunities directly to the right professionals
              — turning demand into revenue in minutes. Post a project free, receive up to three tailored
              quotes, and manage the full lifecycle from{' '}
              <Link to="/services/design-and-build" className="text-primary hover:underline">design and build</Link>
              {' '}through to{' '}
              <Link to="/services/materials" className="text-primary hover:underline">materials sourcing</Link>
              {' '}and{' '}
              <Link to="/services/connections" className="text-primary hover:underline">business growth</Link>
              {' '}— inside one AI-driven ecosystem.
            </p>
            <p>
              For investors, Kluje represents a rare convergence: proprietary AI infrastructure that
              compounds with every transaction, deep vertical penetration across 11 high-value sectors,
              and the network effects of a two-sided marketplace operating at national scale. Every
              professional added, every deal closed, every job posted — makes the platform smarter,
              stickier, and harder to displace.
            </p>
          </div>

          {/* Platform pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50">
              <Cpu className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">AI-Powered Matching</span>
              <span className="text-xs text-muted-foreground">Right pro, right job, instantly</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50">
              <Network className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">11 Industry Verticals</span>
              <span className="text-xs text-muted-foreground">One platform, every sector</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Intelligent Sales Funnel</span>
              <span className="text-xs text-muted-foreground">Demand converted to revenue fast</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Built to Scale</span>
              <span className="text-xs text-muted-foreground">Network effects, national reach</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
