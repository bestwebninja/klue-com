import { FormEvent, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Save } from 'lucide-react';

type Step = { key: string; title: string; description: string };

const PARTNER_TYPES = [
  'Contractor / Trade Partner',
  'Material Supplier',
  'Realtor / Agent / Brokerage',
  'Lender / Capital Partner',
  'Legal / Compliance Partner',
  'Accountant / CPA / Tax Partner',
  'Architect / Planner / Engineer',
  'Inspector / Permit / Municipal Services Partner',
  'Title / Escrow / Closing Partner',
  'Insurance / Bond / Risk Partner',
  'General Service Provider / Business Consultant',
] as const;

const SERVICE_TAXONOMY = [
  'General contractor','Remodeler','Handyman','Plumber','Electrician','HVAC','Roofer','Painter','Flooring','Tiling','Masonry','Framing','Drywall','Insulation','Windows and doors','Siding','Landscaping','Pool contractor','Waterproofing','Glass','Solar / battery / EV','Fire / security','Cleaning / turnover / maintenance',
] as const;

const MATERIAL_TAXONOMY = [
  'Lumber / framing','Roofing','Drywall / insulation','Concrete / masonry','Steel / metals','Plumbing materials','Electrical materials','HVAC materials','Flooring','Tile / stone','Paint / coatings','Windows / doors','Cabinets / millwork','Fasteners / hardware','Tools / equipment','Landscaping / outdoor','Waterproofing','Solar / batteries / EV','Appliances','Glass / mirrors','Pools / water systems','Smart home / security','Fire / safety systems',
] as const;

const REALTOR_PROPERTY_TYPES = ['Residential resale', 'New construction', 'Luxury', 'Investment', 'Fix and flip', 'Rentals', 'Multifamily', 'Commercial'] as const;
const REALTOR_SERVICES = ['Buyer representation', 'Seller representation', 'Leasing', 'Property management', 'Off-market sourcing', 'Investor deal sourcing', 'BPO / broker price opinion', 'CMA', 'Referral partnerships', 'Renovation coordination', 'Contractor referrals', 'Staging coordination', 'Closing coordination'] as const;

const STEPS: Step[] = [
  { key: 'partnerType', title: 'Partner Type', description: 'Tell us what type of partner you are.' },
  { key: 'businessDetails', title: 'Personal & Business', description: 'Legal identity and primary contact details.' },
  { key: 'address', title: 'Business Address', description: 'Business location and key operational contacts.' },
  { key: 'compliance', title: 'Licensing & Compliance', description: 'Licenses, insurance, bonded status, and certifications.' },
  { key: 'territories', title: 'Territories Served', description: 'Coverage map and territory preferences.' },
  { key: 'categories', title: 'Categories Offered', description: 'Role-specific capabilities and scope.' },
  { key: 'integrations', title: 'Feed / Integration Setup', description: 'Data sync readiness and update cadence.' },
  { key: 'uploads', title: 'Uploads', description: 'Upload required supporting documentation.' },
  { key: 'terms', title: 'Commercial Terms', description: 'Consent and commercial preferences.' },
  { key: 'review', title: 'Review & Submit', description: 'Review, fix missing items, and submit.' },
];

const emailSchema = z.string().email();

type FormState = {
  partner_type: string;
  entity_type: string;
  offer_type: string;
  legal_business_name: string;
  dba_name: string;
  contact_first_name: string;
  contact_last_name: string;
  job_title: string;
  business_email: string;
  mobile_phone: string;
  office_phone: string;
  website: string;
  years_in_business: string;
  employee_count: string;
  business_description: string;
  logo_upload: string;
  profile_or_cover_upload: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  mailing_same_as_business: boolean;
  billing_contact: string;
  operations_contact: string;
  technical_contact: string;
  license_number: string;
  license_state: string;
  license_type: string;
  license_expiration_date: string;
  insurance_status: string;
  insurance_provider: string;
  policy_number: string;
  insurance_certificate_upload: string;
  bonded_status: string;
  bond_certificate_upload: string;
  business_registration_upload: string;
  government_id_upload: string;
  certifications: string;
  w9_upload: string;
  states_served: string;
  counties_served: string;
  cities_served: string;
  towns_served: string;
  zip_codes_served: string;
  radius_from_zip: string;
  entire_state: boolean;
  excluded_counties_or_zips: string;
  preferred_territory_request: string;
  exclusive_territory_interest: boolean;
  apply_for_preferred_partner: boolean;
  service_taxonomy: string[];
  emergency_availability: boolean;
  residential_commercial_scope: string;
  average_project_size: string;
  min_project_value: string;
  max_project_value: string;
  supplier_type: string;
  business_model: string;
  branch_count: string;
  warehouse_count: string;
  showroom_count: string;
  material_taxonomy: string[];
  catalog_profile: string;
  brokerage_name: string;
  realtor_role: string;
  nmls_number: string;
  mls_membership: boolean;
  mls_id: string;
  realtor_association_membership: string;
  years_in_real_estate: string;
  languages_spoken: string;
  property_types_served: string[];
  service_offerings: string[];
  neighborhoods_served: string;
  sync_method: string;
  update_frequency: string;
  data_types_available: string[];
  api_docs_url: string;
  sample_file_upload: string;
  sandbox_credentials: string;
  webhook_support: boolean;
  logo: string;
  registration_docs: string;
  licenses: string;
  insurance: string;
  bond: string;
  w9: string;
  government_id: string;
  sample_catalog: string;
  rate_cards: string;
  accept_partner_agreement: boolean;
  accept_terms: boolean;
  accept_privacy_and_compliance: boolean;
  lead_fee_interest: boolean;
  transaction_fee_interest: boolean;
  promoted_listing_interest: boolean;
  preferred_territory_application: boolean;
  referral_commission_acknowledgment: boolean;
  verification_tier: string;
  compliance_status: string;
  risk_score_placeholder: string;
  preferred_territory_under_review: boolean;
  source_tracking: string;
  manual_review_flags: string;
};

const INITIAL: FormState = {
  partner_type: '', entity_type: '', offer_type: '', legal_business_name: '', dba_name: '', contact_first_name: '', contact_last_name: '', job_title: '', business_email: '', mobile_phone: '', office_phone: '', website: '', years_in_business: '', employee_count: '', business_description: '', logo_upload: '', profile_or_cover_upload: '',
  address_line_1: '', address_line_2: '', city: '', state: '', zip: '', country: 'United States', mailing_same_as_business: true, billing_contact: '', operations_contact: '', technical_contact: '',
  license_number: '', license_state: '', license_type: '', license_expiration_date: '', insurance_status: '', insurance_provider: '', policy_number: '', insurance_certificate_upload: '', bonded_status: '', bond_certificate_upload: '', business_registration_upload: '', government_id_upload: '', certifications: '', w9_upload: '',
  states_served: '', counties_served: '', cities_served: '', towns_served: '', zip_codes_served: '', radius_from_zip: '', entire_state: false, excluded_counties_or_zips: '', preferred_territory_request: '', exclusive_territory_interest: false, apply_for_preferred_partner: false,
  service_taxonomy: [], emergency_availability: false, residential_commercial_scope: '', average_project_size: '', min_project_value: '', max_project_value: '',
  supplier_type: '', business_model: '', branch_count: '', warehouse_count: '', showroom_count: '', material_taxonomy: [], catalog_profile: '',
  brokerage_name: '', realtor_role: '', nmls_number: '', mls_membership: false, mls_id: '', realtor_association_membership: '', years_in_real_estate: '', languages_spoken: '', property_types_served: [], service_offerings: [], neighborhoods_served: '',
  sync_method: '', update_frequency: '', data_types_available: [], api_docs_url: '', sample_file_upload: '', sandbox_credentials: '', webhook_support: false,
  logo: '', registration_docs: '', licenses: '', insurance: '', bond: '', w9: '', government_id: '', sample_catalog: '', rate_cards: '',
  accept_partner_agreement: false, accept_terms: false, accept_privacy_and_compliance: false, lead_fee_interest: false, transaction_fee_interest: false, promoted_listing_interest: false, preferred_territory_application: false, referral_commission_acknowledgment: false,
  verification_tier: 'pending', compliance_status: 'pending_review', risk_score_placeholder: '', preferred_territory_under_review: false, source_tracking: 'web_partner_signup', manual_review_flags: '',
};

function ToggleList({ options, values, onToggle }: { options: readonly string[]; values: string[]; onToggle: (next: string[]) => void; }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {options.map((option) => {
        const checked = values.includes(option);
        return (
          <label key={option} className="flex items-center gap-2 rounded-md border p-2 text-sm">
            <Checkbox checked={checked} onCheckedChange={(next) => onToggle(next === true ? [...values, option] : values.filter((entry) => entry !== option))} />
            <span>{option}</span>
          </label>
        );
      })}
    </div>
  );
}

export function PartnerOnboardingWizard() {
  const { user } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isSupplier = form.partner_type === 'Material Supplier';
  const isRealtor = form.partner_type === 'Realtor / Agent / Brokerage';

  useEffect(() => {
    const loadDraft = async () => {
      if (!user) {
        setLoadingDraft(false);
        return;
      }
      const { data, error } = await (supabase
        .from('partner_onboarding_applications' as any)
        .select('*')
        .eq('applicant_user_id', user.id)
        .in('status', ['draft', 'submitted'])
        .order('updated_at', { ascending: false })
        .limit(1) as any);

      if (error) {
        toast({ title: 'Unable to load draft', description: error.message, variant: 'destructive' });
      } else if (data?.[0]) {
        const row = data[0];
        setApplicationId(row.id);
        setForm((prev) => ({ ...prev, ...(row.application_payload ?? {}) }));
      }
      setLoadingDraft(false);
    };

    loadDraft();
  }, [user]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const validateStep = (index: number): string[] => {
    const issues: string[] = [];
    if (index === 0) {
      if (!form.partner_type) issues.push('Partner type is required.');
      if (!form.entity_type) issues.push('Entity type is required.');
      if (!form.offer_type) issues.push('Offer type is required.');
    }
    if (index === 1) {
      if (!form.legal_business_name) issues.push('Legal business name is required.');
      if (!form.contact_first_name || !form.contact_last_name) issues.push('Contact first and last name are required.');
      if (!emailSchema.safeParse(form.business_email).success) issues.push('A valid business email is required.');
      if (form.mobile_phone.trim().length < 7) issues.push('Mobile phone is required.');
    }
    if (index === 5) {
      if (!isSupplier && !isRealtor && form.service_taxonomy.length === 0) issues.push('Pick at least one service category.');
      if (isSupplier && form.material_taxonomy.length === 0) issues.push('Pick at least one material category.');
      if (isRealtor && form.property_types_served.length === 0) issues.push('Pick at least one property type.');
    }
    if (index === 8) {
      if (!form.accept_partner_agreement || !form.accept_terms || !form.accept_privacy_and_compliance) {
        issues.push('Required consents must be accepted.');
      }
    }
    return issues;
  };

  const missingWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (!form.logo_upload && !form.logo) warnings.push('No logo uploaded yet.');
    if (!form.business_registration_upload && !form.registration_docs) warnings.push('Business registration document is missing.');
    if (!form.license_number) warnings.push('License number not provided.');
    if (!form.w9_upload && !form.w9) warnings.push('W9 is missing.');
    return warnings;
  }, [form]);

  const persistDraft = async (nextStatus: 'draft' | 'submitted' = 'draft') => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please sign in to save onboarding progress.', variant: 'destructive' });
      return null;
    }

    const payload = {
      applicant_user_id: user.id,
      status: nextStatus,
      partner_type: form.partner_type,
      entity_type: form.entity_type,
      offer_type: form.offer_type,
      application_payload: form,
      verification_tier: form.verification_tier,
      compliance_status: form.compliance_status,
      risk_score_placeholder: form.risk_score_placeholder,
      preferred_territory_under_review: form.preferred_territory_under_review,
      source_tracking: form.source_tracking,
      manual_review_flags: form.manual_review_flags,
    };

    let result;
    if (applicationId) {
      result = await (supabase.from('partner_onboarding_applications' as any).update(payload).eq('id', applicationId).select('id').single() as any);
    } else {
      result = await (supabase.from('partner_onboarding_applications' as any).insert(payload).select('id').single() as any);
    }

    if (result.error) {
      toast({ title: 'Unable to save draft', description: result.error.message, variant: 'destructive' });
      return null;
    }

    const id = result.data.id as string;
    setApplicationId(id);
    return id;
  };

  const onSaveDraft = async () => {
    setSavingDraft(true);
    const id = await persistDraft('draft');
    setSavingDraft(false);
    if (id) toast({ title: 'Draft saved', description: 'Your onboarding draft was saved securely.' });
  };

  const onUpload = async (field: keyof FormState, file: File | null) => {
    if (!file || !user) return;
    const baseId = applicationId ?? 'draft';
    const path = `${user.id}/${baseId}/${field}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('partner-onboarding-documents').upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return;
    }
    updateField(field, path as FormState[keyof FormState]);
    toast({ title: 'Uploaded', description: `${file.name} attached.` });
  };

  const nextStepIssues = validateStep(stepIndex);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const issues = validateStep(8);
    if (issues.length > 0) {
      toast({ title: 'Submission blocked', description: issues[0], variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const id = await persistDraft('draft');
    if (!id) {
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.functions.invoke('submit-partner-onboarding', { body: { application_id: id } });
    setSubmitting(false);

    if (error) {
      toast({ title: 'Submission failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Application submitted', description: 'Kluje compliance and partnerships teams will review your onboarding submission.' });
  };

  if (loadingDraft) {
    return <Card><CardContent className="py-8 text-sm text-muted-foreground">Loading onboarding draft...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-xl">Partner onboarding wizard</CardTitle>
          <Badge variant="secondary">{stepIndex + 1} of {STEPS.length}</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STEPS.map((step, index) => (
            <div key={step.key} className="space-y-1">
              <div className={`h-1.5 rounded-full ${index <= stepIndex ? 'bg-primary' : 'bg-muted'}`} />
              <p className={`text-[11px] ${index === stepIndex ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{step.title}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{STEPS[stepIndex].description}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {stepIndex === 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Label>Partner Type</Label><Select value={form.partner_type} onValueChange={(v) => updateField('partner_type', v)}><SelectTrigger><SelectValue placeholder="Select partner type" /></SelectTrigger><SelectContent>{PARTNER_TYPES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Entity Type</Label><Select value={form.entity_type} onValueChange={(v) => updateField('entity_type', v)}><SelectTrigger><SelectValue placeholder="Entity type" /></SelectTrigger><SelectContent>{['Individual', 'Company', 'Multi-location enterprise'].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Offer Type</Label><Select value={form.offer_type} onValueChange={(v) => updateField('offer_type', v)}><SelectTrigger><SelectValue placeholder="Offer type" /></SelectTrigger><SelectContent>{['Services', 'Products', 'Both'].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
            </div>
          )}

          {stepIndex === 1 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {['legal_business_name','dba_name','contact_first_name','contact_last_name','job_title','business_email','mobile_phone','office_phone','website','years_in_business','employee_count'].map((key) => (
                <div key={key}><Label>{key.replaceAll('_', ' ')}</Label><Input value={form[key as keyof FormState] as string} onChange={(e) => updateField(key as keyof FormState, e.target.value as never)} /></div>
              ))}
              <div className="sm:col-span-2"><Label>Business Description</Label><Textarea rows={3} value={form.business_description} onChange={(e) => updateField('business_description', e.target.value)} /></div>
              <div><Label>Logo Upload</Label><Input type="file" onChange={(e) => onUpload('logo_upload', e.target.files?.[0] ?? null)} /></div>
              <div><Label>Profile / Cover Upload</Label><Input type="file" onChange={(e) => onUpload('profile_or_cover_upload', e.target.files?.[0] ?? null)} /></div>
            </div>
          )}

          {stepIndex === 2 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {['address_line_1','address_line_2','city','state','zip','country','billing_contact','operations_contact','technical_contact'].map((key) => (
                <div key={key}><Label>{key.replaceAll('_', ' ')}</Label><Input value={form[key as keyof FormState] as string} onChange={(e) => updateField(key as keyof FormState, e.target.value as never)} /></div>
              ))}
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.mailing_same_as_business} onCheckedChange={(checked) => updateField('mailing_same_as_business', checked === true)} /> Mailing same as business</label>
            </div>
          )}

          {stepIndex === 3 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {['license_number','license_state','license_type','license_expiration_date','insurance_status','insurance_provider','policy_number','certifications'].map((key) => (
                <div key={key}><Label>{key.replaceAll('_', ' ')}</Label><Input type={key.includes('date') ? 'date' : 'text'} value={form[key as keyof FormState] as string} onChange={(e) => updateField(key as keyof FormState, e.target.value as never)} /></div>
              ))}
              {['insurance_certificate_upload','bond_certificate_upload','business_registration_upload','government_id_upload','w9_upload'].map((key) => (
                <div key={key}><Label>{key.replaceAll('_', ' ')}</Label><Input type="file" onChange={(e) => onUpload(key as keyof FormState, e.target.files?.[0] ?? null)} /></div>
              ))}
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.bonded_status === 'bonded'} onCheckedChange={(checked) => updateField('bonded_status', checked === true ? 'bonded' : 'not_bonded')} /> Bonded</label>
            </div>
          )}

          {stepIndex === 4 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {['states_served','counties_served','cities_served','towns_served','zip_codes_served','radius_from_zip','excluded_counties_or_zips','preferred_territory_request'].map((key) => (
                <div key={key}><Label>{key.replaceAll('_', ' ')}</Label><Input value={form[key as keyof FormState] as string} onChange={(e) => updateField(key as keyof FormState, e.target.value as never)} /></div>
              ))}
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.entire_state} onCheckedChange={(checked) => updateField('entire_state', checked === true)} /> Entire state coverage</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.exclusive_territory_interest} onCheckedChange={(checked) => updateField('exclusive_territory_interest', checked === true)} /> Exclusive territory interest</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.apply_for_preferred_partner} onCheckedChange={(checked) => updateField('apply_for_preferred_partner', checked === true)} /> Apply for preferred partner</label>
            </div>
          )}

          {stepIndex === 5 && (
            <div className="space-y-4">
              {!isSupplier && !isRealtor && (
                <>
                  <div><Label>Service taxonomy</Label><ToggleList options={SERVICE_TAXONOMY} values={form.service_taxonomy} onToggle={(next) => updateField('service_taxonomy', next)} /></div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {['residential_commercial_scope','average_project_size','min_project_value','max_project_value'].map((key) => <div key={key}><Label>{key.replaceAll('_', ' ')}</Label><Input value={form[key as keyof FormState] as string} onChange={(e) => updateField(key as keyof FormState, e.target.value as never)} /></div>)}
                  </div>
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.emergency_availability} onCheckedChange={(checked) => updateField('emergency_availability', checked === true)} /> Emergency availability</label>
                </>
              )}
              {isSupplier && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>Supplier type</Label><Select value={form.supplier_type} onValueChange={(v) => updateField('supplier_type', v)}><SelectTrigger><SelectValue placeholder="Supplier type" /></SelectTrigger><SelectContent>{['Wholesale','Retail','Manufacturer','Distributor','Liquidator / overstock','Specialty supplier'].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Business model</Label><Select value={form.business_model} onValueChange={(v) => updateField('business_model', v)}><SelectTrigger><SelectValue placeholder="Business model" /></SelectTrigger><SelectContent>{['B2B only','B2C only','Both'].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
                    {['branch_count','warehouse_count','showroom_count'].map((key) => <div key={key}><Label>{key.replaceAll('_', ' ')}</Label><Input value={form[key as keyof FormState] as string} onChange={(e) => updateField(key as keyof FormState, e.target.value as never)} /></div>)}
                  </div>
                  <div><Label>Material taxonomy</Label><ToggleList options={MATERIAL_TAXONOMY} values={form.material_taxonomy} onToggle={(next) => updateField('material_taxonomy', next)} /></div>
                  <div><Label>Catalog profile fields (optional)</Label><Textarea rows={4} placeholder="category, subcategory, brand, sku, unit, min_order_qty, wholesale_price, retail_price, bulk_tier_pricing, stock_status, lead_time, delivery_fee, pickup_available, returns_policy, warranty" value={form.catalog_profile} onChange={(e) => updateField('catalog_profile', e.target.value)} /></div>
                </>
              )}
              {isRealtor && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {['brokerage_name','realtor_role','nmls_number','mls_id','realtor_association_membership','years_in_real_estate','languages_spoken','neighborhoods_served'].map((key) => <div key={key}><Label>{key.replaceAll('_', ' ')}</Label><Input value={form[key as keyof FormState] as string} onChange={(e) => updateField(key as keyof FormState, e.target.value as never)} /></div>)}
                  </div>
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.mls_membership} onCheckedChange={(checked) => updateField('mls_membership', checked === true)} /> MLS membership</label>
                  <div><Label>Property types served</Label><ToggleList options={REALTOR_PROPERTY_TYPES} values={form.property_types_served} onToggle={(next) => updateField('property_types_served', next)} /></div>
                  <div><Label>Service offerings</Label><ToggleList options={REALTOR_SERVICES} values={form.service_offerings} onToggle={(next) => updateField('service_offerings', next)} /></div>
                </>
              )}
            </div>
          )}

          {stepIndex === 6 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Sync method</Label><Select value={form.sync_method} onValueChange={(v) => updateField('sync_method', v)}><SelectTrigger><SelectValue placeholder="Sync method" /></SelectTrigger><SelectContent>{['Google Sheets','Excel / CSV upload','API','EDI / ERP connector','Manual entry','Build the feed for me'].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Update frequency</Label><Select value={form.update_frequency} onValueChange={(v) => updateField('update_frequency', v)}><SelectTrigger><SelectValue placeholder="Update frequency" /></SelectTrigger><SelectContent>{['Real time','Hourly','Daily','Weekly','On demand'].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div><Label>Data types available</Label><ToggleList options={['product_catalog','pricing','inventory','location_availability','delivery_eta','promotions','brand_data','images','spec_sheets']} values={form.data_types_available} onToggle={(next) => updateField('data_types_available', next)} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                {['api_docs_url','sandbox_credentials'].map((key) => <div key={key}><Label>{key.replaceAll('_', ' ')}</Label><Input value={form[key as keyof FormState] as string} onChange={(e) => updateField(key as keyof FormState, e.target.value as never)} /></div>)}
                <div><Label>Sample file upload</Label><Input type="file" onChange={(e) => onUpload('sample_file_upload', e.target.files?.[0] ?? null)} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.webhook_support} onCheckedChange={(checked) => updateField('webhook_support', checked === true)} /> Webhook support available</label>
              {isSupplier && <p className="text-xs text-muted-foreground border rounded-md p-3">Supplier feed expected schema fields: supplier_id, branch_id, sku, product_name, category, subcategory, brand, description, unit, wholesale_price, retail_price, inventory_qty, inventory_status, lead_time_days, pickup_available, delivery_available, state, city, zip, image_url, spec_url, last_updated.</p>}
            </div>
          )}

          {stepIndex === 7 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {['logo','registration_docs','licenses','insurance','bond','w9','government_id','sample_catalog','rate_cards'].map((key) => (
                <div key={key}><Label>{key.replaceAll('_', ' ')}</Label><Input type="file" onChange={(e) => onUpload(key as keyof FormState, e.target.files?.[0] ?? null)} /></div>
              ))}
            </div>
          )}

          {stepIndex === 8 && (
            <div className="space-y-3">
              {['accept_partner_agreement', 'accept_terms', 'accept_privacy_and_compliance', 'lead_fee_interest', 'transaction_fee_interest', 'promoted_listing_interest', 'preferred_territory_application', 'referral_commission_acknowledgment'].map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm rounded-md border p-2"><Checkbox checked={form[key as keyof FormState] as boolean} onCheckedChange={(checked) => updateField(key as keyof FormState, (checked === true) as never)} /> {key.replaceAll('_', ' ')}</label>
              ))}
            </div>
          )}

          {stepIndex === 9 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/20">
                <h3 className="font-medium text-sm mb-2">Application summary</h3>
                <dl className="grid sm:grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-muted-foreground">Partner type</dt><dd>{form.partner_type || '—'}</dd></div>
                  <div><dt className="text-muted-foreground">Entity type</dt><dd>{form.entity_type || '—'}</dd></div>
                  <div><dt className="text-muted-foreground">Business</dt><dd>{form.legal_business_name || '—'}</dd></div>
                  <div><dt className="text-muted-foreground">Email</dt><dd>{form.business_email || '—'}</dd></div>
                  <div><dt className="text-muted-foreground">Territories</dt><dd>{form.states_served || form.zip_codes_served || '—'}</dd></div>
                  <div><dt className="text-muted-foreground">Compliance status</dt><dd>{form.compliance_status}</dd></div>
                </dl>
              </div>

              {missingWarnings.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Missing item warnings</p>
                  <ul className="list-disc pl-5 text-sm">
                    {missingWarnings.map((warning) => <li key={warning}>{warning}</li>)}
                  </ul>
                </div>
              )}

              <div className="rounded-lg border p-3 text-sm">Trust & transparency: Kluje performs identity, licensing, insurance, and compliance checks before activation. Some applications may require manual review.</div>
            </div>
          )}

          {nextStepIssues.length > 0 && stepIndex < 9 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {nextStepIssues[0]}
            </div>
          )}

          <div className="border-t pt-4 flex flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={stepIndex === 0 || submitting} onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button type="button" variant="secondary" disabled={savingDraft || submitting} onClick={onSaveDraft}>
                <Save className="w-4 h-4 mr-1" /> {savingDraft ? 'Saving...' : 'Save Draft'}
              </Button>
            </div>

            {stepIndex < 9 ? (
              <Button type="button" disabled={nextStepIssues.length > 0 || submitting} onClick={() => setStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1))}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={submitting}>
                <CheckCircle2 className="w-4 h-4 mr-1" /> {submitting ? 'Submitting...' : 'Submit Partner Onboarding'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
