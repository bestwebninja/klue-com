import { Link } from 'react-router-dom';
import { Cpu, TrendingUp, Network, BrainCircuit } from 'lucide-react';

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
              At the core of Kluje is a self-learning neural engine that thinks across all 11 verticals
              simultaneously — routing verified opportunities, predicting demand, and orchestrating every
              moving part of your business in real time. Post a project free, receive up to three precision-matched
              quotes, and manage the complete lifecycle — from{' '}
              <Link to="/services/design-and-build" className="text-primary hover:underline">design and build</Link>
              {' '}through{' '}
              <Link to="/services/materials" className="text-primary hover:underline">materials sourcing</Link>
              {' '}and{' '}
              <Link to="/services/connections" className="text-primary hover:underline">business growth</Link>
              {' '}— all inside one unified, AI-orchestrated command center. Your dashboard doesn't just display
              data — it reasons, prioritizes, and acts on your behalf.
            </p>
            <p>
              As Kluje accumulates a full year of KPI data across every state, trade, deal type, and dollar
              flowing through the platform, the intelligence compounds exponentially. Seasonal demand curves,
              regional pricing benchmarks, contractor performance scores, and capital flow patterns all feed
              back into a dashboard that evolves from powerful to genuinely predictive — alerting you to
              opportunities before the market sees them. For investors, this represents an unassailable moat:
              proprietary neural infrastructure that grows more valuable with every transaction, national
              network effects that lock in both sides of every marketplace, and deep vertical penetration
              across 11 high-value sectors that competitors cannot replicate overnight.
            </p>
          </div>

          {/* Platform pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Neural AI Engine</span>
              <span className="text-xs text-muted-foreground">Thinks across all 11 verticals at once</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50">
              <Network className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">11 Industry Verticals</span>
              <span className="text-xs text-muted-foreground">One platform, every sector</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50">
              <Cpu className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Predictive Dashboard</span>
              <span className="text-xs text-muted-foreground">KPI intelligence that compounds over time</span>
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
