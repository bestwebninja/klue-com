/**
 * QuoteBuilderForm — the main quoting form for all service provider types.
 *
 * Sits below the My Quotes stats panel on /dashboard?tab=quotes.
 * Reads service provider type from profile and auto-populates.
 * Writes to QuoteContext → propagates to all department forms.
 *
 * Supports: General Contractor, Subcontractor, Service Provider, Cleaning, Specialist.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle, User, MapPin, Briefcase, Calculator,
  FileText, Send, Save, RefreshCw, Globe2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuote, type ServiceType } from '@/context/QuoteContext';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

// ─── Config by service type ───────────────────────────────────────────────
const SERVICE_TYPE_CONFIG: Record<ServiceType | string, {
  label: string;
  color: string;
  projectTypes: string[];
  tradeTypes: string[];
  showCleaning: boolean;
}> = {
  general_contractor: {
    label: 'General Contractor',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    projectTypes: ['Residential Remodel','New Construction','Commercial TI','Multi-Family','Addition / Expansion','Infrastructure'],
    tradeTypes: ['General Construction','Structural','Roofing','Framing','Concrete','Foundation'],
    showCleaning: false,
  },
  subcontractor: {
    label: 'Subcontractor',
    color: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    projectTypes: ['Trade Work','Specialty Installation','Repair','Service Call','Inspection'],
    tradeTypes: ['Plumbing','Electrical','HVAC','Tile','Drywall','Painting','Flooring','Insulation','Masonry'],
    showCleaning: false,
  },
  service_provider: {
    label: 'Service Provider',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    projectTypes: ['Service Contract','Maintenance','Inspection','Emergency Service','Consulting'],
    tradeTypes: ['Plumbing','Electrical','HVAC','Pest Control','Landscaping','Security','IT / Low-Voltage'],
    showCleaning: false,
  },
  cleaning: {
    label: 'Cleaning Contractor',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    projectTypes: ['Recurring Contract','One-Time Deep Clean','Post-Construction Clean','Move-In / Move-Out','Event Clean-Up'],
    tradeTypes: ['Commercial Cleaning','Residential Cleaning','Industrial Cleaning','Medical / Specialty','Carpet & Upholstery'],
    showCleaning: true,
  },
  specialist: {
    label: 'Specialist',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    projectTypes: ['Specialty Trade','Consulting','Assessment','Remediation','Custom Scope'],
    tradeTypes: ['Abatement','Remediation','Restoration','Surveying','Testing / Inspection'],
    showCleaning: false,
  },
  '': {
    label: 'Service Provider',
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    projectTypes: ['Select a project type…'],
    tradeTypes: ['Select a trade…'],
    showCleaning: false,
  },
};

const BUILDING_TYPES = [
  'Single-Family Home','Condo / Townhome','Multi-Family / Apartment',
  'Office Building','Retail Store','Restaurant','Medical / Healthcare',
  'Warehouse / Industrial','School / Educational','Government / Municipal',
  'Hotel / Hospitality','Gym / Fitness','Church','Post-Construction Site',
];

const PAYMENT_OPTIONS = [
  'Net 30','Net 15','Due on Completion',
  '50% upfront / 50% on completion','Progress Billing','Milestone-Based','COD',
];

const CLEANING_FREQUENCIES = [
  'Daily (5x/week)','Daily (7x/week)','3x / week',
  'Twice a week','Weekly','Bi-Weekly','Monthly','One-Time',
];

function LF({ label, required, hint, children, className }: {
  label: string; required?: boolean; hint?: string;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-orange-500">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function QuoteBuilderForm() {
  const { user } = useAuth();
  const { quote, setQuote, generateQuoteNo } = useQuote();
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showCleaning, setShowCleaning] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch profile and auto-populate service type + name
  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    (supabase as any)
      .from('profiles')
      .select('full_name, service_type_key, service_type_label, zip, phone')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (!data?.service_type_key) {
          setProfileIncomplete(true);
        } else {
          const svcType = (data.service_type_key as ServiceType) ?? '';
          setQuote({
            serviceType: svcType,
            serviceTypeLabel: data.service_type_label ?? SERVICE_TYPE_CONFIG[svcType]?.label ?? '',
            providerName: data.full_name ?? '',
            siteZip: quote.siteZip || data.zip || '',
          });
          setShowCleaning(SERVICE_TYPE_CONFIG[svcType]?.showCleaning ?? false);
        }
        setProfileLoading(false);
      });
  }, [user?.id]);

  // Auto-generate quote number on mount if empty
  useEffect(() => {
    if (!quote.quoteNo) {
      setQuote({ quoteNo: generateQuoteNo() });
    }
  }, []);

  const config = SERVICE_TYPE_CONFIG[quote.serviceType || ''] ?? SERVICE_TYPE_CONFIG[''];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleGoToCleaning = () => {
    navigate('/gc-dashboard');
    // The GCCommandDashboard will open to Cleaning dept
  };

  if (profileLoading) {
    return (
      <Card className="border-border/60 mt-6">
        <CardContent className="py-8 flex items-center justify-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">{t('Loading')} profile…</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-500/20 mt-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-orange-500" />
            {t('New Quote')} / Estimate Builder
          </CardTitle>
          <div className="flex items-center gap-2">
            {quote.serviceType && (
              <Badge variant="outline" className={cn('text-xs', config.color)}>
                {t(config.label)}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-1 text-xs h-7">
              <Globe2 className="h-3 w-3" />
              {lang === 'en' ? 'Español' : 'English'}
            </Button>
          </div>
        </div>

        {/* Profile incomplete warning */}
        {profileIncomplete && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-300">{t('Profile incomplete')}</p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                {t('Complete your profile')} as a Contractor, General Contractor, Sub Contractor, or Cleaning provider to auto-populate quotes.
              </p>
            </div>
            <Button size="sm" className="text-xs h-7 bg-amber-500 hover:bg-amber-400 text-black" asChild>
              <a href="/dashboard?tab=profile">{t('Complete Profile')}</a>
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Quote # and service type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LF label={t('Quote #')} hint="Auto-generated — edit if needed">
            <Input
              value={quote.quoteNo}
              onChange={e => setQuote({ quoteNo: e.target.value })}
              className="text-sm"
            />
          </LF>
          <LF label={t('Service Provider Type')} hint={t('Auto-populated from your profile')}>
            <select
              value={quote.serviceType}
              onChange={e => {
                const v = e.target.value as ServiceType;
                setQuote({
                  serviceType: v,
                  serviceTypeLabel: SERVICE_TYPE_CONFIG[v]?.label ?? '',
                });
                setShowCleaning(SERVICE_TYPE_CONFIG[v]?.showCleaning ?? false);
              }}
              className="w-full h-9 text-sm border border-input bg-background rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground"
            >
              <option value="">Select provider type…</option>
              <option value="general_contractor">{t('General Contractor')}</option>
              <option value="subcontractor">{t('Subcontractor')}</option>
              <option value="service_provider">{t('Service Provider')}</option>
              <option value="cleaning">{t('Cleaning Contractor')}</option>
              <option value="specialist">{t('Specialist')}</option>
            </select>
          </LF>
        </div>

        {/* Client info */}
        <div className="rounded-lg border border-border/40 overflow-hidden">
          <div className="bg-muted/40 px-4 py-2 flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-[12px] font-semibold">{t('Client')} Information</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LF label={t('Client Name')} required>
              <Input value={quote.clientName} onChange={e => setQuote({ clientName: e.target.value })} placeholder="Full name or company" />
            </LF>
            <LF label={t('Client Phone')}>
              <Input type="tel" value={quote.clientPhone} onChange={e => setQuote({ clientPhone: e.target.value })} placeholder="(305) 555-0000" />
            </LF>
            <LF label={t('Client Email')}>
              <Input type="email" value={quote.clientEmail} onChange={e => setQuote({ clientEmail: e.target.value })} placeholder="client@email.com" />
            </LF>
          </div>
        </div>

        {/* Job site */}
        <div className="rounded-lg border border-border/40 overflow-hidden">
          <div className="bg-muted/40 px-4 py-2 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-[12px] font-semibold">{t('Job Site')}</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LF label={t('Property Address')} className="sm:col-span-2">
              <Input value={quote.siteAddress} onChange={e => setQuote({ siteAddress: e.target.value })} placeholder="Street address" />
            </LF>
            <LF label={t('Zip Code')} hint={t('Weather & regional cost index loads automatically')}>
              <Input
                value={quote.siteZip}
                onChange={e => {
                  setQuote({ siteZip: e.target.value });
                  if (/^\d{5}$/.test(e.target.value)) setShowWeather(true);
                }}
                placeholder="33101"
                maxLength={5}
              />
            </LF>
            <LF label="State">
              <Input value={quote.siteState} onChange={e => setQuote({ siteState: e.target.value })} placeholder="FL" maxLength={2} />
            </LF>
          </div>
        </div>

        {/* Weather widget (auto-shows when ZIP entered) */}
        {showWeather && /^\d{5}$/.test(quote.siteZip) && (
          <WeatherWidget zip={quote.siteZip} />
        )}

        {/* Project scope */}
        <div className="rounded-lg border border-border/40 overflow-hidden">
          <div className="bg-muted/40 px-4 py-2 flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-[12px] font-semibold">{t('Project')} / Scope</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LF label={t('Project Type')}>
              <select
                value={quote.projectType}
                onChange={e => setQuote({ projectType: e.target.value })}
                className="w-full h-9 text-sm border border-input bg-background rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground"
              >
                <option value="">Select…</option>
                {config.projectTypes.map(pt => <option key={pt} value={pt}>{t(pt)}</option>)}
              </select>
            </LF>
            <LF label="Trade Type">
              <select
                value={quote.tradeType}
                onChange={e => setQuote({ tradeType: e.target.value })}
                className="w-full h-9 text-sm border border-input bg-background rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground"
              >
                <option value="">Select…</option>
                {config.tradeTypes.map(tt => <option key={tt} value={tt}>{t(tt)}</option>)}
              </select>
            </LF>
            <LF label="Building Type">
              <select
                value={quote.buildingType}
                onChange={e => setQuote({ buildingType: e.target.value })}
                className="w-full h-9 text-sm border border-input bg-background rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground"
              >
                <option value="">Select…</option>
                {BUILDING_TYPES.map(bt => <option key={bt} value={bt}>{t(bt)}</option>)}
              </select>
            </LF>
            <LF label={t('Square Footage')}>
              <Input type="number" value={quote.squareFootage} onChange={e => setQuote({ squareFootage: e.target.value })} placeholder="2500" />
            </LF>
            <LF label="Scope Description" className="sm:col-span-2">
              <Textarea
                value={quote.scopeDescription}
                onChange={e => setQuote({ scopeDescription: e.target.value })}
                rows={3}
                placeholder="Describe all work to be performed…"
                className="resize-none text-sm"
              />
            </LF>
          </div>
        </div>

        {/* Cleaning-specific section */}
        {showCleaning && (
          <div className="rounded-lg border border-amber-500/30 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCleaning(v => !v)}
              className="w-full flex items-center justify-between bg-amber-500/10 px-4 py-2.5 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-amber-300">Cleaning — Specific Details</span>
                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300">
                  Pushes to CleaningDept
                </Badge>
              </div>
              {showCleaning ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LF label={t('Cleaning Frequency')}>
                <select
                  value={quote.cleaningFrequency}
                  onChange={e => setQuote({ cleaningFrequency: e.target.value })}
                  className="w-full h-9 text-sm border border-input bg-background rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground"
                >
                  <option value="">Select…</option>
                  {CLEANING_FREQUENCIES.map(f => <option key={f} value={f}>{t(f)}</option>)}
                </select>
              </LF>
              <LF label={`${t('Cleaning Areas')} (sq ft)`} hint={t('Total cleanable area')}>
                <Input
                  type="number"
                  value={quote.cleaningAreasSqft}
                  onChange={e => setQuote({ cleaningAreasSqft: e.target.value })}
                  placeholder="2500"
                />
              </LF>
              <LF label="Special Requirements" className="sm:col-span-2">
                <Textarea
                  value={quote.cleaningSpecialRequirements}
                  onChange={e => setQuote({ cleaningSpecialRequirements: e.target.value })}
                  rows={2}
                  placeholder="e.g. Eco-products, medical-grade disinfectants, restricted areas…"
                  className="resize-none text-sm"
                />
              </LF>
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGoToCleaning}
                  className="text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-1.5"
                >
                  <Calculator className="h-3.5 w-3.5" />
                  Open CleaningDept → Auto-populate & calculate pricing
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cost summary */}
        <div className="rounded-lg border border-border/40 overflow-hidden">
          <div className="bg-muted/40 px-4 py-2 flex items-center gap-2">
            <Calculator className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-[12px] font-semibold">{t('Quote')} Cost Builder</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LF label={`${t('Labor')} ($)`}>
              <Input
                type="number"
                placeholder="0.00"
                onChange={e => {
                  const labor = parseFloat(e.target.value) || 0;
                  const items = [...quote.lineItems.filter(li => li.category !== 'labor')];
                  if (labor > 0) items.push({ description: 'Labor', qty: 1, unit: 'lot', unitCost: labor, total: labor, category: 'labor' });
                  setQuote({ lineItems: items });
                }}
              />
            </LF>
            <LF label={`${t('Materials')} ($)`}>
              <Input type="number" placeholder="0.00"
                onChange={e => {
                  const mat = parseFloat(e.target.value) || 0;
                  const items = [...quote.lineItems.filter(li => li.category !== 'materials')];
                  if (mat > 0) items.push({ description: 'Materials', qty: 1, unit: 'lot', unitCost: mat, total: mat, category: 'materials' });
                  setQuote({ lineItems: items });
                }}
              />
            </LF>
            <LF label="Equipment / Rentals ($)">
              <Input type="number" placeholder="0.00"
                onChange={e => {
                  const eq = parseFloat(e.target.value) || 0;
                  const items = [...quote.lineItems.filter(li => li.category !== 'equipment')];
                  if (eq > 0) items.push({ description: 'Equipment', qty: 1, unit: 'lot', unitCost: eq, total: eq, category: 'equipment' });
                  setQuote({ lineItems: items });
                }}
              />
            </LF>
            <LF label={`${t('Subcontractor Costs')} ($)`}>
              <Input type="number" placeholder="0.00"
                onChange={e => {
                  const sub = parseFloat(e.target.value) || 0;
                  const items = [...quote.lineItems.filter(li => li.category !== 'subcontract')];
                  if (sub > 0) items.push({ description: 'Subcontractors', qty: 1, unit: 'lot', unitCost: sub, total: sub, category: 'subcontract' });
                  setQuote({ lineItems: items });
                }}
              />
            </LF>
            <LF label="Overhead %" hint="Typical: 10–15%">
              <Input type="number" value={quote.overheadPct} onChange={e => setQuote({ overheadPct: parseFloat(e.target.value) || 12 })} />
            </LF>
            <LF label="Profit Margin %" hint="Residential avg: 12–18%">
              <Input type="number" value={quote.marginPct} onChange={e => setQuote({ marginPct: parseFloat(e.target.value) || 15 })} />
            </LF>
          </div>

          {/* Live total */}
          {quote.subtotal > 0 && (
            <div className="mx-4 mb-4 rounded-lg bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/40 p-4">
              <div className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-2">
                Live Quote Summary
              </div>
              {[
                ['Subtotal', quote.subtotal],
                [`Overhead (${quote.overheadPct}%)`, quote.overheadAmt],
                [`Margin (${quote.marginPct}%)`, quote.marginAmt],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span>${(val as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div className="border-t border-orange-200/60 pt-2 mt-2 flex justify-between">
                <span className="text-sm font-semibold">Total Quote Value</span>
                <span className="text-sm font-bold text-orange-600">
                  ${quote.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LF label={t('Payment Terms')}>
            <select
              value={quote.paymentTerms}
              onChange={e => setQuote({ paymentTerms: e.target.value })}
              className="w-full h-9 text-sm border border-input bg-background rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground"
            >
              {PAYMENT_OPTIONS.map(o => <option key={o} value={o}>{t(o)}</option>)}
            </select>
          </LF>
          <LF label="Quote Validity (days)">
            <Input type="number" value={quote.validityDays} onChange={e => setQuote({ validityDays: parseInt(e.target.value) || 30 })} />
          </LF>
        </div>

        <LF label={t('Notes')}>
          <Textarea
            value={quote.notes}
            onChange={e => setQuote({ notes: e.target.value })}
            rows={3}
            placeholder="Exclusions, assumptions, special conditions…"
            className="resize-none text-sm"
          />
        </LF>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {t('Generate Quote PDF')}
          </Button>
          <Button variant="outline" className="text-xs h-8 gap-1.5">
            <Send className="h-3.5 w-3.5" />
            {t('Send to Client')}
          </Button>
          <Button
            variant="secondary"
            className="text-xs h-8 gap-1.5"
            onClick={handleSave}
          >
            <Save className="h-3.5 w-3.5" />
            {saved ? '✓ Saved!' : t('Save Draft')}
          </Button>
          <Button
            variant="ghost"
            className="text-xs h-8 gap-1.5 text-muted-foreground"
            onClick={() => navigate('/gc-dashboard')}
          >
            Push to GC Dashboard →
          </Button>
        </div>

        {/* Cross-department push notice */}
        {quote.savedAt && (
          <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-3 py-2">
            ✓ Quote data propagated to Materials, Legals, Cleaning, and Agreements departments in GC Dashboard.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
