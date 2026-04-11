import { FormEvent, useMemo, useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle2, Handshake } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import heroBusiness from '@/assets/hero-business.jpg';

type StepKey = 'organization' | 'profile' | 'operations' | 'compliance' | 'campaign' | 'review';

type PartnerSignupValues = {
  organizationName: string;
  dbaName: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  website: string;
  state: string;
  city: string;
  zip: string;
  addressLine1: string;
  addressLine2: string;
  entityType: string;
  partnershipType: string;
  budgetBand: string;
  campaignGoals: string;
  targetMarkets: string;
  launchTimeline: string;
  primaryTerritory: string;
  categories: string[];
  feedType: string;
  preferredRequested: boolean;
  licenseNumber: string;
  licenseState: string;
  insuranceCarrier: string;
  insurancePolicy: string;
  implementationNotes: string;
  consent: boolean;
};

const SERVICE_CATEGORIES = [
  { value: 'hvac', label: 'HVAC' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'general-contractor', label: 'General Contracting' },
  { value: 'solar', label: 'Solar' },
  { value: 'landscaping', label: 'Landscaping' },
];

const STEPS: { key: StepKey; title: string; description: string }[] = [
  {
    key: 'organization',
    title: 'Organization',
    description: 'Tell us who owns this partner account and where to send onboarding updates.',
  },
  {
    key: 'profile',
    title: 'Business Profile',
    description: 'Provide legal entity and headquarters details used for compliance checks.',
  },
  {
    key: 'operations',
    title: 'Operations',
    description: 'Set your partner model, categories, territory, and feed readiness.',
  },
  {
    key: 'compliance',
    title: 'Compliance',
    description: 'Share the licensing and insurance details needed for verification review.',
  },
  {
    key: 'campaign',
    title: 'Campaign Plan',
    description: 'Define launch priorities, budget range, and success outcomes.',
  },
  {
    key: 'review',
    title: 'Review & Submit',
    description: 'Confirm your details and submit your Kluje Partners onboarding request.',
  },
];

const INITIAL_VALUES: PartnerSignupValues = {
  organizationName: '',
  dbaName: '',
  contactName: '',
  contactTitle: '',
  email: '',
  phone: '',
  website: '',
  state: '',
  city: '',
  zip: '',
  addressLine1: '',
  addressLine2: '',
  entityType: '',
  partnershipType: '',
  budgetBand: '',
  campaignGoals: '',
  targetMarkets: '',
  launchTimeline: '',
  primaryTerritory: '',
  categories: [],
  feedType: '',
  preferredRequested: false,
  licenseNumber: '',
  licenseState: '',
  insuranceCarrier: '',
  insurancePolicy: '',
  implementationNotes: '',
  consent: false,
};

const PartnerSignup = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<PartnerSignupValues>(INITIAL_VALUES);

  const activeStep = STEPS[stepIndex];
  const progressLabel = useMemo(() => `${stepIndex + 1} of ${STEPS.length}`, [stepIndex]);

  const updateField = <K extends keyof PartnerSignupValues>(key: K, value: PartnerSignupValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (category: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      categories: checked ? [...prev.categories, category] : prev.categories.filter((item) => item !== category),
    }));
  };

  const isOrganizationStepValid =
    form.organizationName.trim().length > 1 &&
    form.contactName.trim().length > 1 &&
    /.+@.+\..+/.test(form.email) &&
    form.phone.trim().length >= 7;

  const isProfileStepValid =
    form.entityType.length > 0 &&
    form.addressLine1.trim().length > 5 &&
    form.city.trim().length > 1 &&
    form.state.trim().length > 1 &&
    form.zip.trim().length > 2;

  const isOperationsStepValid =
    form.partnershipType.length > 0 &&
    form.categories.length > 0 &&
    form.primaryTerritory.trim().length > 2 &&
    form.feedType.length > 0;

  const isComplianceStepValid =
    form.licenseNumber.trim().length > 2 &&
    form.licenseState.trim().length > 1 &&
    form.insuranceCarrier.trim().length > 2 &&
    form.insurancePolicy.trim().length > 2;

  const isCampaignStepValid =
    form.budgetBand.length > 0 &&
    form.campaignGoals.trim().length > 12 &&
    form.launchTimeline.length > 0;

  const isReviewStepValid = form.consent;

  const canMoveNext =
    (activeStep.key === 'organization' && isOrganizationStepValid) ||
    (activeStep.key === 'profile' && isProfileStepValid) ||
    (activeStep.key === 'operations' && isOperationsStepValid) ||
    (activeStep.key === 'compliance' && isComplianceStepValid) ||
    (activeStep.key === 'campaign' && isCampaignStepValid);

  const onNext = () => {
    if (canMoveNext) {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const onBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isReviewStepValid) {
      toast({
        title: 'Please confirm consent',
        description: 'Accept the outreach consent before you submit.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.functions.invoke('submit-partner-signup', {
      body: {
        organizationName: form.organizationName,
        dbaName: form.dbaName,
        contactName: form.contactName,
        contactTitle: form.contactTitle,
        email: form.email,
        phone: form.phone,
        website: form.website,
        state: form.state,
        city: form.city,
        zip: form.zip,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        entityType: form.entityType,
        partnershipType: form.partnershipType,
        budgetBand: form.budgetBand,
        campaignGoals: form.campaignGoals,
        targetMarkets: form.targetMarkets,
        launchTimeline: form.launchTimeline,
        primaryTerritory: form.primaryTerritory,
        categories: form.categories,
        feedType: form.feedType,
        preferredRequested: form.preferredRequested,
        licenseNumber: form.licenseNumber,
        licenseState: form.licenseState,
        insuranceCarrier: form.insuranceCarrier,
        insurancePolicy: form.insurancePolicy,
        implementationNotes: form.implementationNotes,
      },
    });

    if (error) {
      toast({
        title: 'Unable to submit request',
        description: error.message,
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: 'Partner onboarding request submitted',
      description: 'Our partnerships operations team will review your application and contact you shortly.',
    });

    setSubmitting(false);
    setForm(INITIAL_VALUES);
    setStepIndex(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Kluje Partners | Detailed Onboarding"
        description="Complete Kluje's full partner onboarding intake with business profile, compliance data, and campaign launch planning."
      />
      <Navbar />

      <PageHero
        backgroundImage={heroBusiness}
        imageAlt="Kluje partner onboarding flow for full campaign and compliance setup"
        title="Kluje Partners"
        description="Complete your full onboarding profile to launch partnerships with Kluje."
        variant="compact"
      />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-xl">Partner Onboarding</CardTitle>
              <Badge variant="secondary">{progressLabel}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {STEPS.map((step, index) => (
                <div key={step.key} className="space-y-1">
                  <div className={`h-1.5 rounded-full ${index <= stepIndex ? 'bg-primary' : 'bg-muted'}`} />
                  <p className={`text-[11px] ${index === stepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{activeStep.description}</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              {activeStep.key === 'organization' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="organizationName">Legal Business Name</Label>
                    <Input
                      id="organizationName"
                      value={form.organizationName}
                      onChange={(event) => updateField('organizationName', event.target.value)}
                      placeholder="Acme Lending Group LLC"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dbaName">DBA (optional)</Label>
                    <Input
                      id="dbaName"
                      value={form.dbaName}
                      onChange={(event) => updateField('dbaName', event.target.value)}
                      placeholder="Acme Home Solutions"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Primary Contact</Label>
                    <Input
                      id="contactName"
                      value={form.contactName}
                      onChange={(event) => updateField('contactName', event.target.value)}
                      placeholder="Jordan Smith"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactTitle">Contact Title</Label>
                    <Input
                      id="contactTitle"
                      value={form.contactTitle}
                      onChange={(event) => updateField('contactTitle', event.target.value)}
                      placeholder="Director of Partnerships"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(event) => updateField('phone', event.target.value)}
                      placeholder="(555) 555-0101"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      placeholder="partnerships@acme.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={form.website}
                      onChange={(event) => updateField('website', event.target.value)}
                      placeholder="https://acme.com"
                    />
                  </div>
                </div>
              )}

              {activeStep.key === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Entity Type</Label>
                      <Select value={form.entityType} onValueChange={(value) => updateField('entityType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="llc">LLC</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="sole-proprietor">Sole Proprietor</SelectItem>
                          <SelectItem value="nonprofit">Nonprofit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="addressLine1">HQ Address</Label>
                    <Input
                      id="addressLine1"
                      value={form.addressLine1}
                      onChange={(event) => updateField('addressLine1', event.target.value)}
                      placeholder="123 Main St"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
                    <Input
                      id="addressLine2"
                      value={form.addressLine2}
                      onChange={(event) => updateField('addressLine2', event.target.value)}
                      placeholder="Suite 500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={form.city} onChange={(event) => updateField('city', event.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={form.state} onChange={(event) => updateField('state', event.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP</Label>
                      <Input id="zip" value={form.zip} onChange={(event) => updateField('zip', event.target.value)} required />
                    </div>
                  </div>
                </div>
              )}

              {activeStep.key === 'operations' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Partnership Type</Label>
                      <Select value={form.partnershipType} onValueChange={(value) => updateField('partnershipType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a partner model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead-program">Performance lead program</SelectItem>
                          <SelectItem value="co-marketing">Co-marketing campaign</SelectItem>
                          <SelectItem value="data-api">Data / API partnership</SelectItem>
                          <SelectItem value="sponsored-content">Sponsored content series</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Feed Type</Label>
                      <Select value={form.feedType} onValueChange={(value) => updateField('feedType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select feed integration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No feed required</SelectItem>
                          <SelectItem value="csv">CSV upload</SelectItem>
                          <SelectItem value="api">API push/pull</SelectItem>
                          <SelectItem value="webhook">Webhook callbacks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Service Categories</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-md border border-border p-3">
                      {SERVICE_CATEGORIES.map((category) => {
                        const isChecked = form.categories.includes(category.value);
                        return (
                          <label key={category.value} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => toggleCategory(category.value, checked === true)}
                            />
                            <span>{category.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="primaryTerritory">Primary Territory</Label>
                    <Input
                      id="primaryTerritory"
                      value={form.primaryTerritory}
                      onChange={(event) => updateField('primaryTerritory', event.target.value)}
                      placeholder="Dallas-Fort Worth, TX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetMarkets">Target Markets (optional)</Label>
                    <Input
                      id="targetMarkets"
                      value={form.targetMarkets}
                      onChange={(event) => updateField('targetMarkets', event.target.value)}
                      placeholder="Texas, Florida, Arizona"
                    />
                  </div>

                  <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm">
                    <Checkbox
                      checked={form.preferredRequested}
                      onCheckedChange={(checked) => updateField('preferredRequested', checked === true)}
                    />
                    <span>Request preferred territory review during onboarding.</span>
                  </label>
                </div>
              )}

              {activeStep.key === 'compliance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">Primary License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={form.licenseNumber}
                        onChange={(event) => updateField('licenseNumber', event.target.value)}
                        placeholder="LIC-123456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseState">Issuing State</Label>
                      <Input
                        id="licenseState"
                        value={form.licenseState}
                        onChange={(event) => updateField('licenseState', event.target.value)}
                        placeholder="TX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="insuranceCarrier">Insurance Carrier</Label>
                      <Input
                        id="insuranceCarrier"
                        value={form.insuranceCarrier}
                        onChange={(event) => updateField('insuranceCarrier', event.target.value)}
                        placeholder="CNA"
                      />
                    </div>
                    <div>
                      <Label htmlFor="insurancePolicy">Policy Number</Label>
                      <Input
                        id="insurancePolicy"
                        value={form.insurancePolicy}
                        onChange={(event) => updateField('insurancePolicy', event.target.value)}
                        placeholder="POL-98231"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="implementationNotes">Implementation / Compliance Notes</Label>
                    <Textarea
                      id="implementationNotes"
                      value={form.implementationNotes}
                      onChange={(event) => updateField('implementationNotes', event.target.value)}
                      placeholder="Anything the verification or onboarding team should know before activation."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {activeStep.key === 'campaign' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Estimated Budget</Label>
                      <Select value={form.budgetBand} onValueChange={(value) => updateField('budgetBand', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-10k">Under $10k / month</SelectItem>
                          <SelectItem value="10k-25k">$10k - $25k / month</SelectItem>
                          <SelectItem value="25k-50k">$25k - $50k / month</SelectItem>
                          <SelectItem value="50k-plus">$50k+ / month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Preferred Launch Timeline</Label>
                      <Select value={form.launchTimeline} onValueChange={(value) => updateField('launchTimeline', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="within-2-weeks">Within 2 weeks</SelectItem>
                          <SelectItem value="within-30-days">Within 30 days</SelectItem>
                          <SelectItem value="next-quarter">Next quarter</SelectItem>
                          <SelectItem value="exploring">Just exploring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="campaignGoals">Campaign Goals</Label>
                    <Textarea
                      id="campaignGoals"
                      value={form.campaignGoals}
                      onChange={(event) => updateField('campaignGoals', event.target.value)}
                      placeholder="Describe volume goals, service-line priorities, and conversion KPIs."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {activeStep.key === 'review' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Handshake className="h-4 w-4 text-primary" />
                      Onboarding Summary
                    </div>
                    <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Organization</dt>
                        <dd>{form.organizationName || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Contact</dt>
                        <dd>{form.contactName || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Entity Type</dt>
                        <dd>{form.entityType || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Partnership Type</dt>
                        <dd>{form.partnershipType || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Primary Territory</dt>
                        <dd>{form.primaryTerritory || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Feed Type</dt>
                        <dd>{form.feedType || '—'}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Categories</dt>
                        <dd>{form.categories.length ? form.categories.join(', ') : '—'}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Goals</dt>
                        <dd>{form.campaignGoals || '—'}</dd>
                      </div>
                    </dl>
                  </div>

                  <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm">
                    <Checkbox
                      checked={form.consent}
                      onCheckedChange={(checked) => updateField('consent', checked === true)}
                    />
                    <span>
                      I agree to be contacted by Kluje&apos;s partnerships operations team regarding onboarding, verification, and launch planning.
                    </span>
                  </label>
                </div>
              )}

              <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={onBack} disabled={stepIndex === 0 || submitting}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                {activeStep.key !== 'review' ? (
                  <Button type="button" onClick={onNext} disabled={!canMoveNext || submitting}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting || !isReviewStepValid}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    {submitting ? 'Submitting...' : 'Submit Full Partner Onboarding'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PartnerSignup;
