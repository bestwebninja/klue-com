import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  BrainCircuit, Fingerprint, BarChart3, Mic, MapPin, Shield,
  Zap, TrendingUp, Network, Lock, Eye, DollarSign, Home,
  Building2, Users, CheckCircle, Calendar,
} from 'lucide-react';
import heroManifesto from '@/assets/hero-manifesto.jpg';

export default function PlatformManifesto() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Kluje Platform Manifesto | Deep Dive"
        description="The definitive, continuously-updated guide to Kluje's neural AI architecture, biometric site intelligence, predictive dashboard, and competitive moat."
        pageType="website"
      />
      <Navbar />

      <PageHero
        backgroundImage={heroManifesto}
        title="The Kluje Platform Manifesto"
        description="A living document covering our neural AI architecture, proprietary systems, and why Kluje is unbeatable."
      >
        <Badge variant="secondary">Updated Continuously · Last: 2026-03-29</Badge>
      </PageHero>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* Dictionary Definition */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-8 py-8 space-y-5">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">from the Kluje Dictionary</p>
              <p className="text-3xl font-bold text-foreground">
                kluje{' '}
                <span className="text-base font-normal text-muted-foreground italic">(v.)</span>
                {' '}
                <span className="text-base font-normal text-muted-foreground">/kluːʒ/</span>
              </p>
            </div>
            <ol className="space-y-3 list-none">
              <li className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-semibold">1.</span>{' '}
                  To effortlessly connect a need with the perfect professional; to resolve a home or business challenge through intelligent, trust-verified matching.
                </p>
                <p className="text-sm text-primary/80 italic pl-4">
                  "The boiler packed in on a Sunday morning — I klujet it and had a certified engineer on-site within the hour."
                </p>
              </li>
              <li className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-semibold">2.</span>{' '}
                  (informal) To take decisive, confident action by leveraging the right network at the right moment.
                </p>
                <p className="text-sm text-primary/80 italic pl-4">
                  "Don't overthink it — just Kluje it."
                </p>
              </li>
            </ol>
            <div className="pt-2 border-t border-primary/15 text-center">
              <span className="font-signature text-4xl text-primary/80">Just Kluje it</span>
            </div>
          </div>

          {/* Intro */}
          <div className="space-y-4 text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Kluje is not a marketplace. It is a self-learning, self-predicting neural command
              platform built to govern every professional, every dollar, and every risk decision
              across America's entire built economy.
            </p>
            <p className="text-sm text-muted-foreground italic">
              This document is updated continuously as our platform evolves. Check back regularly for new capabilities.
            </p>
          </div>

          {/* Section 1: Neural AI Engine */}
          <div className="space-y-4 border-t pt-8">
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">The Neural AI Engine</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              At Kluje's core is a self-learning neural network that thinks across all 11 verticals
              simultaneously — routing opportunities, predicting demand, managing risk, and
              orchestrating every moving part of the built economy in real time. Every quote posted,
              every deal closed, every site accessed, every professional hired — feeds back into the
              engine to make it smarter.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {[
                { icon: Network, label: '11 Verticals', desc: 'Cross-sector intelligence' },
                { icon: Zap, label: 'Real-Time Processing', desc: '24/7 decision-making' },
                { icon: TrendingUp, label: 'Predictive', desc: 'Forecasts demand 30+ days out' },
                { icon: Shield, label: 'Risk Management', desc: 'Continuous threat monitoring' },
              ].map(({ icon: Icon, label, desc }) => (
                <Card key={label} className="border-border/40">
                  <CardContent className="pt-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">{label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Section 2: Kluje AI Voice */}
          <div className="space-y-4 border-t pt-8">
            <div className="flex items-center gap-3">
              <Mic className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Kluje AI Voice — The Operating System</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Every user gets a voice-activated AI agent that operates 24/7 as a receptionist, call handler,
              CRM logger, and operations manager. Powered by Google Dialogflow CX + Vertex AI, Kluje AI Voice
              handles everything from initial client calls to invoice follow-ups to compliance alerts — with zero
              human bottleneck.
            </p>
            <ul className="space-y-2 ml-4">
              {[
                'Answers calls 24/7 and books jobs automatically',
                'Qualifies leads in real time',
                'Logs every interaction into CRM',
                'Sends automated reminders and follow-ups',
                'Routes calls intelligently by department',
                'Scales from solo traders to enterprises',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Zip-Code Risk Intelligence */}
          <div className="space-y-4 border-t pt-8">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Zip-Code Risk Intelligence</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              When any project, property, or materials delivery is posted on Kluje, the platform automatically
              pulls hyper-local risk data for that zip code — crime statistics, flood/wildfire exposure, weather
              patterns, historical insurance claims, neighborhood value trajectory. This feeds directly into
              underwriting, insurance pricing, project costing, and deal structuring.
            </p>
            <div className="rounded-lg bg-muted/40 border border-border/40 p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">Data layers included:</p>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                {['Crime rate & trends', 'Flood & wildfire zones', 'Weather impact history', 'Insurance claim data', 'Property valuation trends', 'Demographics & growth'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Biometric Site Intelligence */}
          <div className="space-y-4 border-t pt-8">
            <div className="flex items-center gap-3">
              <Fingerprint className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Biometric Site Intelligence (Coming Soon)</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Kluje's proprietary biometric credential system will bring AI governance to the physical job site.
              Every verified tradesperson carries a unique biometric credential. Site managers assign access
              digitally. Every entry/exit is logged. AI monitors for safety violations, restricted zone access,
              and material discrepancies — creating a tamper-proof attendance record and dramatically reducing
              theft and insurance liability.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              {[
                { icon: Lock, label: 'Access Control', desc: 'Credential-gated physical entry' },
                { icon: Eye, label: 'Live Monitoring', desc: 'Real-time behavior & zone tracking' },
                { icon: DollarSign, label: 'Insurance Rewards', desc: 'Clean records earn premiums' },
              ].map(({ icon: Icon, label, desc }) => (
                <Card key={label} className="border-border/40">
                  <CardContent className="pt-5 space-y-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold">{label}</h3>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Section 5: Predictive Dashboard */}
          <div className="space-y-4 border-t pt-8">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">The Predictive Dashboard</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              In year one, the dashboard is powerful. After a full year of national KPI data — seasonal demand
              curves, regional pricing benchmarks, contractor performance distributions, material cost volatility,
              capital flow patterns, weather impact — the dashboard becomes genuinely predictive. It surfaces
              opportunities before users knew to look. It alerts first-time buyers to emerging neighborhoods.
              It warns developers about subcontractor risk before project start.
            </p>
          </div>

          {/* Section 6: The Moat */}
          <div className="space-y-4 border-t pt-8">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Why Kluje is Unbeatable</h2>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Proprietary Neural Infrastructure', desc: 'No competitor has built a self-learning neural engine across 11 verticals simultaneously' },
                { title: 'Biometric Site Data Layer', desc: 'Zero direct competitor has tamper-proof site access & monitoring' },
                { title: 'AI Voice Governance', desc: 'Switching costs become prohibitive once a business relies on AI to run operations' },
                { title: 'National Network Effects', desc: 'Every user added, every deal closed, every signal captured makes the platform exponentially more valuable' },
                { title: 'Compliance-First Design', desc: 'Built for regulated sectors (construction, real estate, finance); hard to replicate quickly' },
                { title: 'Data Compounding', desc: 'After year one, the intelligence layer becomes so sophisticated that replicating it from scratch takes years' },
              ].map(({ title, desc }) => (
                <div key={title} className="rounded-lg bg-muted/40 border border-border/40 p-4 space-y-1">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="border-t pt-8 space-y-4 text-center">
            <p className="text-muted-foreground">
              Ready to see Kluje in action?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
