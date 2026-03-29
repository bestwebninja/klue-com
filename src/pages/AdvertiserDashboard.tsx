import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Megaphone, BarChart3, DollarSign, Target, Eye, MousePointer,
  TrendingUp, Users, Zap, BrainCircuit, MapPin, Plus, LogIn,
  Mail, Lock, Star, Building2, Mic,
} from 'lucide-react';

// ── Mock campaign data (zeroed — awaiting live data) ──────────────
const campaignStats = [
  { label: 'Active Campaigns',  value: '—', sub: 'No campaigns yet',       icon: Megaphone,     color: 'text-blue-600'   },
  { label: 'Total Impressions', value: '—', sub: 'Awaiting first campaign', icon: Eye,           color: 'text-purple-600' },
  { label: 'Click-Through Rate',value: '—', sub: 'No data yet',            icon: MousePointer,  color: 'text-emerald-600'},
  { label: 'Ad Spend to Date',  value: '—', sub: 'Budget not set',         icon: DollarSign,    color: 'text-amber-600'  },
];

const adFormats = [
  {
    icon: Target,
    title: 'Category Spotlight',
    desc: 'Pin your brand to the top of any of Kluje\'s 11 service category pages. First-look visibility when buyers are actively searching.',
    price: 'From $299/mo',
    badge: 'High Intent',
    color: 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20',
  },
  {
    icon: MapPin,
    title: 'Zip-Code Targeting',
    desc: 'Serve ads hyper-locally by zip code, city, or state. Reach contractors, buyers, and professionals in your exact market.',
    price: 'From $149/mo',
    badge: 'Geo-Targeted',
    color: 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  {
    icon: Users,
    title: 'Provider Sidebar Ads',
    desc: 'Appear in the sidebar of contractor and provider profiles. Capture attention when professionals are already in buying mode.',
    price: 'From $99/mo',
    badge: 'Professional Reach',
    color: 'border-purple-200 bg-purple-50/50 dark:bg-purple-950/20',
  },
  {
    icon: BrainCircuit,
    title: 'AI Voice Sponsorship',
    desc: 'Your brand is read out by Kluje AI Voice when relevant calls are handled — reaching professionals at the exact moment of decision.',
    price: 'From $499/mo',
    badge: 'AI-Native',
    color: 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20',
  },
  {
    icon: Star,
    title: 'Featured Listing Boost',
    desc: 'Elevate your business profile or service listing to the top of search results across the entire Kluje network.',
    price: 'From $59/mo',
    badge: 'Visibility',
    color: 'border-rose-200 bg-rose-50/50 dark:bg-rose-950/20',
  },
  {
    icon: Mic,
    title: 'Newsletter Sponsorship',
    desc: 'Reach Kluje\'s subscriber base of real estate professionals, contractors, and investors with a dedicated placement in the weekly newsletter.',
    price: 'From $249/issue',
    badge: 'Direct Reach',
    color: 'border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20',
  },
];

// ── Login form for non-authenticated users ────────────────────────
function AdvertiserLoginGate({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-2 border-primary/20">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
            <Megaphone className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Advertiser Login</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to your Kluje Advertiser account to manage campaigns and view performance analytics.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Advertiser email" className="pl-9" type="email" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Password" className="pl-9" type="password" />
            </div>
          </div>
          <Button className="w-full" onClick={onLogin}>
            <LogIn className="h-4 w-4 mr-2" />
            Sign in to Advertiser Dashboard
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Don't have an advertiser account?{' '}
            <a href="mailto:marcus@kluje.com" className="text-primary hover:underline">
              Contact us to get started
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main dashboard (post-login) ───────────────────────────────────
function AdvertiserDashboardContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Advertiser Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            AI-powered advertising across America's built economy
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {campaignStats.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="border border-border/60">
            <CardContent className="pt-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insight strip */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-4 flex items-start gap-3">
        <BrainCircuit className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Kluje AI Ad Intelligence — Active</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your campaigns will be continuously optimised by Kluje's neural engine — adjusting bids,
            targeting, and placements in real time based on buyer intent signals, zip-code demand
            patterns, and seasonal construction cycles across all 50 states.
          </p>
        </div>
      </div>

      {/* Ad Format Catalogue */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Ad Formats</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Choose how and where your brand reaches professionals and buyers on the Kluje platform.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adFormats.map((fmt) => {
            const Icon = fmt.icon;
            return (
              <div key={fmt.title} className={`rounded-xl border p-5 space-y-3 ${fmt.color}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center border border-border/40">
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{fmt.badge}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{fmt.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{fmt.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-bold text-foreground">{fmt.price}</span>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Launch
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Who advertises here */}
      <div className="rounded-2xl bg-muted/40 border border-border/60 p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Who Advertises on Kluje?</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Construction material suppliers & distributors',
            'Equipment rental & leasing companies',
            'Mortgage lenders & construction finance',
            'Property technology (PropTech) companies',
            'Insurance providers (contractor & RE focused)',
            'Software tools for contractors & realtors',
            'Accredited training & certification bodies',
            'Legal & compliance service providers',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              {item}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground border-t border-border pt-4">
          To enquire about enterprise advertising packages, direct category sponsorships, or
          AI Voice integration, contact{' '}
          <a href="mailto:marcus@kluje.com" className="text-primary hover:underline">
            marcus@kluje.com
          </a>
        </p>
      </div>

    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────
export default function AdvertiserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);

  // If already signed in to Kluje, let them straight through
  useEffect(() => {
    if (user) setAuthenticated(true);
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Advertiser Dashboard | Kluje"
        description="Manage your Kluje advertising campaigns. AI-powered placements across 11 verticals, zip-code targeting, and real-time performance analytics."
        pageType="website"
      />
      <Navbar />

      <main>
        {/* Hero bar */}
        <div className="bg-gradient-to-r from-slate-900 to-primary/80 text-white py-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Kluje Advertiser Platform</h1>
                <p className="text-sm text-blue-200">AI-optimised ads across America's built economy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-200">
              <BarChart3 className="h-4 w-4" />
              <span>Real-time AI optimisation · 50 States · 11 Verticals</span>
            </div>
          </div>
        </div>

        {authenticated
          ? <AdvertiserDashboardContent />
          : <AdvertiserLoginGate onLogin={() => setAuthenticated(true)} />
        }
      </main>

      <Footer />
    </div>
  );
}
