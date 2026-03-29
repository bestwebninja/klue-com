import { useState } from 'react';
import {
  Check, Mic, BrainCircuit, Zap, Crown, Building2,
  Fingerprint, Shield, TrendingUp, DollarSign, Scale,
  Landmark, Calculator, Ruler, FileText, BarChart3,
  ChevronDown, ChevronUp, Medal, Star,
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import heroPricing from '@/assets/hero-pricing.jpg';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Tier {
  name: string;
  price: number;
  period: string;
  tagline: string;
  icon: React.ElementType;
  color: string;
  ring: string;
  badge?: string;
  features: string[];
  voiceFeatures: string[];
  ideal: string;
}

interface AddOnCategory {
  title: string;
  icon: React.ElementType;
  color: string;
  items: { label: string; price: string }[];
}

// ─── AI Voice Tier Data ───────────────────────────────────────────────────────
const tiers: Tier[] = [
  {
    name: 'Solo',
    price: 49,
    period: '/mo',
    tagline: 'Sole traders & independent professionals',
    icon: Mic,
    color: 'text-blue-600',
    ring: 'border-blue-200',
    ideal: 'Individual contractors, freelance tradespeople, solo realtors',
    features: [
      'AI receptionist answers calls 24/7',
      'Books jobs & qualifies leads automatically',
      'Automated quote follow-ups',
      'Appointment confirmation texts',
      'Voicemail transcription',
      'English & Spanish support',
      'Basic CRM pipeline integration',
      'Performance scoring (free)',
      'Up to 20 AI-handled calls/mo',
    ],
    voiceFeatures: [
      'Google Dialogflow CX voice engine',
      'Speech-to-Text transcription',
      'SMS follow-up on missed calls',
    ],
  },
  {
    name: 'Pro',
    price: 99,
    period: '/mo',
    tagline: 'Growing businesses ready to scale',
    icon: BrainCircuit,
    color: 'text-primary',
    ring: 'border-primary',
    badge: 'Most Popular',
    ideal: 'Contractor firms, realtors, accountants, legal professionals',
    features: [
      'Everything in Solo',
      'Unlimited AI-handled calls',
      'Smart call routing by department',
      'Full CRM pipeline — auto-logs every interaction',
      'Client intake forms via voice',
      'Automated invoice reminders',
      'Contract risk flag alerts',
      'Monthly KPI dashboard briefing',
      'E-signatures & document vault included',
      'Priority listing in search results',
    ],
    voiceFeatures: [
      'Vertex AI + advanced NLP',
      'Multi-department call routing',
      'CRM sync & pipeline automation',
    ],
  },
  {
    name: 'Agency',
    price: 199,
    period: '/mo',
    tagline: 'Multi-user teams & growing agencies',
    icon: Building2,
    color: 'text-purple-600',
    ring: 'border-purple-200',
    ideal: 'Design-build firms, property agencies, consulting groups, legal practices',
    features: [
      'Everything in Pro',
      'Up to 10 team members / seats',
      'Team call routing & transfer',
      'Department-level AI management',
      'Realtor dashboard included',
      'Promoted listings ($59/mo value) included',
      'Accreditation badge eligible',
      'Training marketplace access',
      'Project accounting dashboard',
      'Zip-code risk intelligence reports',
    ],
    voiceFeatures: [
      'Multi-seat AI voice deployment',
      'Team briefing automation',
      'Department performance analytics',
    ],
  },
  {
    name: 'Enterprise',
    price: 399,
    period: '/mo',
    tagline: 'Full AI governance — every department',
    icon: Crown,
    color: 'text-amber-600',
    ring: 'border-amber-200',
    badge: 'Ultimate AI',
    ideal: 'Developers, large contractors, investment firms, multi-location businesses',
    features: [
      'Everything in Agency',
      'Unlimited team seats',
      'Ultimate AI Governance mode',
      'Autonomous scheduling, procurement & HR',
      'Biometric site access integration (coming soon)',
      'Investor & KPI tracker dashboard',
      'National market intelligence reports',
      'API access for custom integrations',
      'Dedicated AI account manager',
      'White-label options available',
    ],
    voiceFeatures: [
      'Full Kluje AI Voice governance suite',
      'Cross-department AI orchestration',
      'Custom AI workflows & triggers',
    ],
  },
];

// ─── Every User Gets ──────────────────────────────────────────────────────────
const everyUserGets = [
  'AI receptionist answers calls 24/7 — books jobs, qualifies leads',
  'Automated quote follow-ups & appointment confirmations',
  'Multilingual support: English & Spanish built in',
  'CRM pipeline integration — auto-logs every interaction',
  'Smart call routing, voicemail transcription, SMS follow-up',
  'Powered by Google Dialogflow CX + Vertex AI + Speech-to-Text',
];

// ─── Add-On Services ──────────────────────────────────────────────────────────
const addOnCategories: AddOnCategory[] = [
  {
    title: 'Embedded Financial Services',
    icon: DollarSign,
    color: 'bg-emerald-600',
    items: [
      { label: 'Payment processing (Stripe/Plaid)', price: '1.5% per txn' },
      { label: 'Contractor credit lines', price: 'Rev-share' },
      { label: 'Escrow accounts', price: '$25–$50/txn' },
      { label: 'Invoice factoring', price: '2–3% fee' },
      { label: 'Insurance brokerage', price: '8–12% trail' },
      { label: 'Bond facilitation', price: '$150/bond' },
      { label: 'Payroll-as-a-service', price: '$6/emp/mo' },
    ],
  },
  {
    title: 'Real Estate Transactions',
    icon: Landmark,
    color: 'bg-blue-600',
    items: [
      { label: 'Realtor–contractor matching', price: '$35/connection' },
      { label: 'Property listing feed', price: '$99/mo per agent' },
      { label: 'AI appraisal system', price: '$75/report' },
      { label: 'Fix & flip deal room', price: '$199/project' },
      { label: 'Development deal negotiation', price: '0.5% deal fee' },
      { label: 'Closing coordination', price: '$150/txn' },
      { label: 'MLS integration', price: '$49/mo' },
    ],
  },
  {
    title: 'Legal & Compliance',
    icon: Scale,
    color: 'bg-orange-600',
    items: [
      { label: 'Smart contracts', price: '$25/contract' },
      { label: 'Lien management', price: '$75/lien' },
      { label: 'AI dispute resolution', price: '$200/case' },
      { label: 'License verification', price: '$15/check' },
      { label: 'OSHA monitoring', price: '$29/mo' },
      { label: 'Permit management', price: '$15/permit' },
      { label: 'Building code AI', price: '$35/project' },
      { label: 'AML / KYC checks', price: '$3/check' },
    ],
  },
  {
    title: 'Architecture & Planning',
    icon: Ruler,
    color: 'bg-indigo-600',
    items: [
      { label: 'Architecture feed access', price: '$149/mo' },
      { label: '3D AI renders', price: '$50/render' },
      { label: 'Blueprint storage', price: '$19/mo' },
      { label: 'Zoning AI check', price: '$25/report' },
      { label: 'Planning submissions', price: '$75/filing' },
      { label: 'Variance management', price: '$100/case' },
    ],
  },
  {
    title: 'Administration Engine',
    icon: FileText,
    color: 'bg-slate-600',
    items: [
      { label: 'E-signatures & vault', price: '$12/mo' },
      { label: 'Project accounting', price: '$29/mo' },
      { label: 'Inspection marketplace', price: '$20/booking' },
      { label: 'Material procurement', price: '1.5% of order' },
      { label: 'Document vault & filing', price: '$12/mo' },
    ],
  },
  {
    title: 'Growth & Intelligence',
    icon: BarChart3,
    color: 'bg-rose-600',
    items: [
      { label: 'Performance scoring', price: 'Free (all tiers)' },
      { label: 'Realtor dashboard', price: '$39/mo' },
      { label: 'Investor tracker', price: '$79/mo' },
      { label: 'Accreditation badge', price: '$199/yr' },
      { label: 'Training marketplace', price: '$49/course' },
      { label: 'Market intelligence reports', price: '$99/mo' },
      { label: 'Promoted listings', price: '$59/mo' },
    ],
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'What is Kluje AI Voice?',
    a: 'Kluje AI Voice is a fully integrated, voice-activated intelligence layer built into every subscription tier. Powered by Google Dialogflow CX, Vertex AI, and Speech-to-Text, it acts as an AI receptionist, call handler, CRM logger, and operations manager — available 24/7, answering calls, booking jobs, qualifying leads, and briefing your team.',
  },
  {
    q: 'Can I add services à la carte on top of my tier?',
    a: 'Yes. Every add-on service module — from smart contracts to AI appraisals to invoice factoring — can be activated individually inside your dashboard. You only pay for what you use, billed per transaction or as a fixed monthly add-on.',
  },
  {
    q: 'What does "Ultimate AI Governance" mean on the Enterprise tier?',
    a: 'At Enterprise level, the Kluje AI Voice system autonomously manages scheduling, client communications, procurement, compliance alerts, HR onboarding, and financial reporting across every department — with minimal human input required. It continuously learns from your data to improve decisions and flag risks.',
  },
  {
    q: 'Is the biometric site access system available now?',
    a: 'Biometric site access is currently in development and will launch as a hardware-integrated feature for Enterprise subscribers. It will enable tamper-proof attendance, restricted zone access control, and real-time site safety monitoring linked directly to your dashboard.',
  },
  {
    q: 'How does the zip-code risk intelligence work?',
    a: "When you select a zip code anywhere on the platform — for a project, property purchase, or materials delivery — Kluje's AI automatically pulls crime statistics, weather risk scores, flood zone data, historical damage claims, and neighbourhood value trends to build a risk composite for that location. This feeds into underwriting, insurance recommendations, and project costing.",
  },
  {
    q: 'Is there a free account?',
    a: 'Yes. You can create a free account to build your profile, add services, browse available jobs, and receive job alerts. A paid tier is required to activate AI Voice, send quote requests, and unlock the full dashboard.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isProvider } = useUserRole();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedAddOn, setExpandedAddOn] = useState<number | null>(null);

  const handleGetStarted = () => {
    if (user && isProvider) {
      navigate('/dashboard?tab=subscription');
    } else if (user) {
      navigate('/auth?mode=provider');
    } else {
      navigate('/auth?mode=signup&provider=true');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Pricing & AI Voice Tiers | Kluje"
        description="Choose your Kluje AI Voice plan. Solo $49, Pro $99, Agency $199, Enterprise $399. Every plan includes a 24/7 AI receptionist powered by Google Dialogflow CX and Vertex AI."
        pageType="pricing"
      />
      <Navbar />

      <PageHero
        backgroundImage={heroPricing}
        title="AI Runs the Platform. You Build the Empire."
        description="Every Kluje subscription comes with Kluje AI Voice — your 24/7 AI receptionist, call handler, CRM logger, and operations manager."
      >
        <Badge variant="secondary">4 Tiers · Cancel Anytime · No Setup Fee</Badge>
      </PageHero>

      {/* ── What Every User Gets ── */}
      <section className="py-10 px-4 bg-primary/5 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Every Subscription Includes Kluje AI Voice</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {everyUserGets.map((item, i) => (
              <div key={i} className="flex items-start gap-2 bg-background rounded-lg p-3 border border-border/60">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tier Cards ── */}
      <section className="py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Choose Your AI Governance Tier</h2>
            <p className="text-muted-foreground">Scale from solo AI receptionist to full autonomous business management</p>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const isFeatured = tier.badge === 'Most Popular';
              return (
                <Card
                  key={tier.name}
                  className={`relative flex flex-col border-2 ${isFeatured ? 'border-primary shadow-lg shadow-primary/10' : tier.ring}`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className={isFeatured ? 'bg-primary text-primary-foreground px-4 py-1' : 'bg-amber-500 text-white px-4 py-1'}>
                        {tier.badge}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4 pt-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-5 w-5 ${tier.color}`} />
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{tier.tagline}</p>
                    <div className="mt-3">
                      <span className={`text-4xl font-bold ${tier.color}`}>${tier.price}</span>
                      <span className="text-muted-foreground text-sm">{tier.period}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 italic">Ideal for: {tier.ideal}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 gap-4">
                    {/* Platform features */}
                    <ul className="space-y-2">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className={`h-4 w-4 shrink-0 mt-0.5 ${isFeatured ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={isFeatured ? '' : 'text-muted-foreground'}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    {/* AI Voice sub-section */}
                    <div className="rounded-lg bg-muted/50 p-3 border border-border/40 mt-auto">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-semibold">AI Voice Engine</p>
                      <ul className="space-y-1">
                        {tier.voiceFeatures.map((vf, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Zap className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                            {vf}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      className="w-full mt-2"
                      variant={isFeatured ? 'default' : 'outline'}
                      onClick={handleGetStarted}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Free Account Strip ── */}
      <section className="py-6 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Start with a free account</p>
            <p className="text-sm text-muted-foreground">Build your profile, add services, browse jobs — no card required.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/auth?mode=signup&provider=true')}>
            Create Free Account
          </Button>
        </div>
      </section>

      {/* ── Add-On Services ── */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Add-On Service Modules</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Activate powerful service modules à la carte inside your dashboard. Every transaction is
              a revenue event — you only pay for what you use.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addOnCategories.map((cat, idx) => {
              const Icon = cat.icon;
              const isOpen = expandedAddOn === idx;
              return (
                <Card key={cat.title} className="border border-border/60">
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedAddOn(isOpen ? null : idx)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <CardTitle className="text-sm font-semibold">{cat.title}</CardTitle>
                        </div>
                        {isOpen
                          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        }
                      </div>
                    </CardHeader>
                  </button>
                  {isOpen && (
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {cat.items.map((item) => (
                          <li key={item.label} className="flex items-center justify-between text-sm gap-2">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-medium text-foreground whitespace-nowrap">{item.price}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Veterans Section ── */}
      <section className="py-14 px-4 bg-gradient-to-br from-blue-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-yellow-400 flex items-center justify-center">
              <Medal className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Kluje Salutes Our Veterans</h2>
          <p className="text-blue-200 leading-relaxed max-w-2xl mx-auto">
            Military veterans who join Kluje as service providers receive a dedicated{' '}
            <strong className="text-yellow-400">Veteran-Owned Business</strong> badge on their profile,
            giving them immediate credibility and priority visibility across the platform. Our
            dedicated Kluje Veterans AI Agent is purpose-built to help veterans start, grow, or
            acquire a business — from SBA loan guidance and VA business resources to contractor
            licence pathways and mentorship matching with other veteran entrepreneurs.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            {[
              { icon: Shield, label: 'Veteran-Owned Badge', desc: 'Displayed on your profile and all quotes — clients know who they\'re hiring' },
              { icon: BrainCircuit, label: 'Veterans AI Agent', desc: 'Dedicated AI built to navigate VA benefits, SBA loans, and business growth' },
              { icon: Star, label: 'Veterans Hire Veterans', desc: 'Smart matching prioritises veteran providers when veteran clients post jobs' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 border border-white/20 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold text-sm">{label}</span>
                </div>
                <p className="text-xs text-blue-200 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <Button
            className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold"
            onClick={handleGetStarted}
          >
            Join as a Veteran Provider
          </Button>
        </div>
      </section>

      {/* ── Biometric & Site Intelligence ── */}
      <section className="py-14 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Fingerprint className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Biometric Site Intelligence — Coming Soon</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kluje's proprietary biometric site access system will launch for Enterprise subscribers,
            bringing AI governance to the physical job site. Verified tradespeople carry a unique
            biometric credential linked to their Kluje profile. Site managers assign access digitally,
            every access event is logged to the project dashboard, and AI monitors for unsafe behaviour,
            restricted zone violations, and materials discrepancies — creating tamper-proof attendance
            records and significantly reducing site theft and insurance liability.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-left">
            {[
              { icon: Fingerprint, label: 'Biometric Access Control', desc: 'Credential-gated physical site entry — no credential, no access' },
              { icon: TrendingUp, label: 'Live Site Dashboard', desc: 'Real-time attendance, zone tracking, and incident logging' },
              { icon: Shield, label: 'Insurance Safety Rewards', desc: 'Clean site records earn preferential premiums with accredited insurers' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-background rounded-xl p-4 border border-border/60 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Manifesto CTA ── */}
      <section className="py-12 px-4 bg-primary/5 border-y border-border">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h3 className="text-xl font-bold">Want to understand the full depth of the platform?</h3>
          <p className="text-muted-foreground text-sm">
            Read the Kluje Platform Manifesto — a continuously updated deep-dive into our neural AI
            architecture, predictive dashboard, biometric systems, veteran programs, and national expansion strategy.
          </p>
          <Button variant="outline" asChild>
            <Link to="/platform-manifesto">Read the Platform Manifesto →</Link>
          </Button>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="rounded-xl border border-border bg-background overflow-hidden">
                  <button
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                  >
                    <span className="font-medium text-sm">{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-3xl font-bold">Ready to Run Your Business on AI?</h2>
          <p className="text-muted-foreground">
            Join the platform where every professional, every deal, and every dollar in America's built economy
            works smarter. Start free, scale with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={handleGetStarted}>Start with Solo — $49/mo</Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/platform-manifesto">Explore the Platform</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Are you a homeowner or business?{' '}
            <Link to="/post-job" className="text-primary hover:underline">Post a job for free</Link>
            {' '}— receive up to 3 AI-matched quotes from verified professionals.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
