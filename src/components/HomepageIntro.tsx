import { Link } from 'react-router-dom';
import {
  BrainCircuit, Network, TrendingUp, Cpu,
  ShieldCheck, Mic, Fingerprint, CloudLightning,
  MapPin, Users, Scale, Calculator, Landmark,
  HardHat, Home, Building2, Eye, Lock,
} from 'lucide-react';

// ─── Reusable card primitives ────────────────────────────────────────────────

function PillarCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/20">
      <Icon className="h-6 w-6 text-primary" />
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </div>
  );
}

function FeatureBlock({
  icon: Icon,
  color,
  title,
  children,
}: {
  icon: React.ElementType;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 p-5 rounded-xl bg-card border border-border/30">
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <h4 className="text-base font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HomepageIntro() {
  return (
    <section aria-label="About Kluje" className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-14">

          {/* ── 1. Opening ── */}
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              The AI Platform Powering America's Built Economy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Kluje is not a directory. It is a self-learning, self-predicting neural command platform —
              built to govern every professional, every dollar, every risk, and every decision across the
              entire built economy. From a{' '}
              <Link to="/services/build-ops" className="text-primary hover:underline">licensed contractor</Link>
              {' '}quoting a kitchen remodel to a{' '}
              <Link to="/services/capital" className="text-primary hover:underline">construction lender</Link>
              {' '}underwriting a $40 million mixed-use development — Kluje's AI sits at the center of every
              transaction, protecting every party, and compounding its intelligence with every interaction
              across all 50 states.
            </p>
          </div>

          {/* ── 2. Who Kluje Serves ── */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1 text-center">Who Kluje Serves</h3>
            <p className="text-muted-foreground text-center mb-6">
              Every professional in the built economy — one unified platform
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { icon: HardHat,   label: 'Contractors & Trades',   desc: 'AI-matched jobs, performance scoring, tiered growth' },
                { icon: Home,      label: 'Realtors & Agents',       desc: 'Market prediction, off-market alerts, buyer matching' },
                { icon: Scale,     label: 'Legal Professionals',     desc: 'Contract risk, compliance monitoring, dispute forecasting' },
                { icon: Calculator,label: 'Accountants & CPAs',      desc: 'Cash flow AI, tax optimisation, preferred lender access' },
                { icon: Building2, label: 'Town Planners & Developers', desc: 'Zoning intelligence, pipeline tracking, environmental risk' },
                { icon: Landmark,  label: 'Lenders & Capital',       desc: 'Accredited deal flow, construction finance routing' },
                { icon: Users,     label: 'First-Time Buyers',       desc: 'AI quote protection, zip-code risk profiles, guided journeys' },
                { icon: Network,   label: 'Business Consultants',    desc: 'Strategy, operations, HR — all AI-assisted and measured' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-card border border-border/50 text-base">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                  <span className="text-sm text-muted-foreground leading-snug">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3. AI Risk Intelligence ── */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-foreground mb-1">AI Risk Intelligence — Know Before You Build or Buy</h3>
              <p className="text-muted-foreground mb-4">
                Kluje's neural risk engine layers hyper-local data into every quote, deal, and decision —
                so no professional or buyer ever operates blind.
              </p>
            </div>
            <FeatureBlock icon={MapPin} color="bg-blue-600" title="Zip-Code Risk Profiles">
              Before a first-time buyer signs or a contractor prices a job, Kluje surfaces a real-time risk
              composite for that exact zip code — crime statistics, flood and storm exposure, wildfire risk,
              freeze-thaw cycles, historical weather damage claims, and neighbourhood value trajectory.
              Buyers are empowered. Professionals are protected from liability.
            </FeatureBlock>
            <FeatureBlock icon={CloudLightning} color="bg-indigo-600" title="Weather Pattern Forecasting">
              Seasonal demand curves are predicted weeks in advance. Contractors know when weather windows
              will open or close for roofing, foundations, and exteriors. Lenders understand seasonal cash
              flow risk. Developers model weather delays into budgets before breaking ground — not after.
            </FeatureBlock>
            <FeatureBlock icon={ShieldCheck} color="bg-emerald-600" title="First-Time Buyer Quote Protection">
              When a homeowner or first-time buyer posts a project, Kluje's AI benchmarks every incoming
              quote against regional labour rates, material costs, and comparable jobs completed on the
              platform. Quotes that deviate significantly above market trigger an AI alert —{' '}
              <em>before</em> the buyer signs — protecting them from over-quoting and predatory pricing.
            </FeatureBlock>
            <FeatureBlock icon={Landmark} color="bg-amber-600" title="Preferred Accredited Financial Partners">
              Kluje curates a network of accredited, licensed financial institutions — lenders, insurers,
              and capital providers — that compete to offer the most competitive rates to verified
              professionals and buyers on the platform. Over time, Kluje's AI identifies which partners
              deliver the best outcomes by sector, zip code, and deal size, automatically surfacing the
              most advantageous offers and making Kluje the preferred procurement channel for the entire
              real estate finance ecosystem.
            </FeatureBlock>
          </div>

          {/* ── 4. Kluje AI Voice System ── */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Kluje AI Voice — Your Entire Business, Spoken Into Existence</h3>
                <p className="text-muted-foreground">The AI Core component that runs every department, for every provider, at every tier</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Kluje AI Voice is not a chatbot. It is a fully integrated voice-activated intelligence layer
              that operates as the operational brain of every business on the platform. A sole-trader
              roofer can ask "What jobs are available within 30 miles this week?" A mid-size
              design-build firm can instruct the system to schedule all client follow-ups, generate
              invoice reminders, flag any contracts with open liability clauses, and brief the project
              manager on weather risk for next week's pour — all by voice, in seconds.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              As providers scale through Kluje's tiered membership model, AI Voice evolves with them —
              from answering basic scheduling queries at the entry tier, to autonomously managing entire
              departments at the upper tiers: scheduling, procurement, compliance, client communications,
              financial reporting, HR, and risk alerts. The highest tier represents true{' '}
              <strong className="text-foreground">Ultimate AI Governance</strong> — where the AI manages
              every measurable aspect of a business with minimal human intervention, dramatically
              reducing the cost of human error, eliminating process gaps, and compressing the operational
              overhead that kills growth in small and mid-market firms.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                'Scheduling & Dispatch',
                'Client Communications',
                'Invoice & Payment Chasing',
                'Contract Risk Flagging',
                'Compliance Monitoring',
                'Procurement Automation',
                'HR & Onboarding',
                'Real-Time KPI Briefings',
              ].map((item) => (
                <div key={item} className="text-xs text-center bg-background/60 border border-border/40 rounded-lg px-2 py-2 text-foreground font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* ── 5. Biometric Site Intelligence ── */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-foreground mb-1">Biometric Site Intelligence — Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Kluje's proprietary site access and monitoring system brings AI governance to the physical
                job site — closing the last gap between platform intelligence and on-the-ground execution.
              </p>
            </div>
            <FeatureBlock icon={Fingerprint} color="bg-rose-600" title="Biometric Access Control">
              Every tradesperson verified on Kluje will carry a unique biometric credential linked to
              their platform profile. Site managers assign access permissions digitally — and only
              credentialed, insured, and verified trades gain physical entry to the site. No valid
              credential, no entry. Every access event is timestamped and logged to the project dashboard,
              giving developers, insurers, and project managers a tamper-proof attendance record.
            </FeatureBlock>
            <FeatureBlock icon={Eye} color="bg-purple-600" title="On-Site Behaviour Monitoring">
              Kluje's site intelligence layer uses AI-assisted monitoring to detect and flag patterns
              associated with unsafe behaviour — including loitering without task assignment (shirking),
              erratic movement signatures, and presence in restricted zones. Incidents are logged
              automatically, reducing the exposure of developers and contractors to workplace safety
              violations and insurance claims.
            </FeatureBlock>
            <FeatureBlock icon={Lock} color="bg-slate-700" title="Theft & Materials Security">
              Unauthorised material removal triggers instant alerts to site managers and project owners.
              The system cross-references delivery manifests with on-site inventory logs, flagging
              discrepancies in real time. Kluje's data trail creates a provable chain of custody for
              every material from supplier to installed position — dramatically reducing the $1B+
              annual loss attributed to construction site theft across the US.
            </FeatureBlock>
            <FeatureBlock icon={ShieldCheck} color="bg-teal-600" title="Insurance & Compliance Rewards">
              Verified site compliance data flows directly to Kluje's accredited insurance partners.
              Contractors with clean site records — zero incidents, full access compliance, no theft
              flags — qualify for preferential premiums. The AI builds a living safety score for every
              professional, rewarding those who operate to the highest standard and making Kluje the
              most trusted credential in the built economy.
            </FeatureBlock>
          </div>

          {/* ── 6. Predictive Dashboard & Investor Moat ── */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h3 className="text-lg font-semibold text-foreground text-center">The Dashboard That Gets Smarter Every Day</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every quote posted, every deal closed, every site accessed, every invoice paid, and every
              KPI logged on Kluje feeds back into a central neural intelligence layer that learns
              continuously. In year one, the dashboard is powerful. After a full year of national KPI
              data — covering seasonal demand cycles, regional pricing benchmarks, contractor performance
              distributions, material cost volatility, capital flow patterns, weather impact on project
              timelines, and buyer risk profiles across every zip code in America — the dashboard
              transitions from reactive reporting to <strong className="text-foreground">genuine
              prediction</strong>. It surfaces the right opportunity to the right professional before
              they knew to look for it. It alerts a first-time buyer to an emerging neighbourhood three
              months before valuations move. It warns a developer that a subcontractor's risk profile
              is deteriorating before a project breaks ground.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For investors, this represents a compounding, defensible moat unlike anything currently
              operating in the real estate and built economy sector: proprietary neural infrastructure
              that becomes exponentially more valuable with every user, deep vertical integration across
              11 high-value sectors that cannot be replicated quickly, national network effects locking
              in both supply and demand, a biometric site data layer with no direct competitor, and an
              AI Voice governance system that makes switching costs prohibitive at scale. The platform
              does not just serve the built economy — over time, it <em>becomes</em> the operating
              system the built economy runs on.
            </p>
          </div>

          {/* ── 7. Platform Pillars ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PillarCard icon={BrainCircuit}    title="Neural AI Engine"         desc="Self-learns across all 11 verticals simultaneously" />
            <PillarCard icon={Mic}             title="Kluje AI Voice"           desc="Voice-governed operations from sole trader to enterprise" />
            <PillarCard icon={Fingerprint}     title="Biometric Site Access"    desc="Verified, logged, tamper-proof — every trade, every site" />
            <PillarCard icon={Cpu}             title="Predictive Dashboard"     desc="KPI intelligence that compounds into national foresight" />
            <PillarCard icon={MapPin}          title="Zip-Code Risk Engine"     desc="Crime, weather, value trajectory — before you commit" />
            <PillarCard icon={ShieldCheck}     title="Buyer Quote Protection"   desc="AI benchmarks every quote against real market data" />
            <PillarCard icon={Landmark}        title="Accredited Finance Network" desc="Competing lenders, best rates, AI-matched to your deal" />
            <PillarCard icon={TrendingUp}      title="Built to Scale"           desc="Network effects, national reach, unassailable moat" />
          </div>

        </div>
      </div>
    </section>
  );
}
