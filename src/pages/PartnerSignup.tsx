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
import heroBusiness from '@/assets/hero-business.jpg';

type StepKey = 'organization' | 'campaign' | 'review';

type PartnerSignupValues = {
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  partnershipType: string;
  budgetBand: string;
  campaignGoals: string;
  targetMarkets: string;
  launchTimeline: string;
  consent: boolean;
};

const STEPS: { key: StepKey; title: string; description: string }[] = [
  {
    key: 'organization',
    title: 'Organization Details',
    description: 'Tell us who you are and how to reach your team.',
  },
  {
    key: 'campaign',
    title: 'Partnership Plan',
    description: 'Share your preferred program, goals, and launch window.',
  },
  {
    key: 'review',
    title: 'Review & Submit',
    description: 'Confirm your details and submit your partnership request.',
  },
];

const INITIAL_VALUES: PartnerSignupValues = {
  organizationName: '',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  partnershipType: '',
  budgetBand: '',
  campaignGoals: '',
  targetMarkets: '',
  launchTimeline: '',
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

  const isOrgStepValid =
    form.organizationName.trim().length > 1 &&
    form.contactName.trim().length > 1 &&
    /.+@.+\..+/.test(form.email) &&
    form.phone.trim().length >= 7;

  const isCampaignStepValid =
    form.partnershipType.length > 0 &&
    form.budgetBand.length > 0 &&
    form.campaignGoals.trim().length > 12 &&
    form.launchTimeline.length > 0;

  const isReviewStepValid = form.consent;

  const canMoveNext =
    (activeStep.key === 'organization' && isOrgStepValid) ||
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    toast({
      title: 'Partnership request submitted',
      description: 'Our partnerships team will review your application and contact you shortly.',
    });

    setSubmitting(false);
    setForm(INITIAL_VALUES);
    setStepIndex(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Kluje Partners | Partner Signup"
        description="Apply for a Kluje partnership program and launch co-marketing campaigns with high-intent contractor and homeowner audiences."
      />
      <Navbar />

      <PageHero
        backgroundImage={heroBusiness}
        imageAlt="Kluje partner signup for campaign and program onboarding"
        title="Kluje Partners"
        description="Apply in minutes to launch a partnership campaign with Kluje."
        variant="compact"
      />

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-xl">Partner Signup</CardTitle>
              <Badge variant="secondary">{progressLabel}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {STEPS.map((step, index) => (
                <div key={step.key} className="space-y-1">
                  <div className={`h-1.5 rounded-full ${index <= stepIndex ? 'bg-primary' : 'bg-muted'}`} />
                  <p className={`text-xs ${index === stepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
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
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      value={form.organizationName}
                      onChange={(event) => updateField('organizationName', event.target.value)}
                      placeholder="Acme Lending Group"
                      required
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

              {activeStep.key === 'campaign' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Partnership Type</Label>
                      <Select value={form.partnershipType} onValueChange={(value) => updateField('partnershipType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="co-marketing">Co-marketing campaign</SelectItem>
                          <SelectItem value="sponsored-content">Sponsored content series</SelectItem>
                          <SelectItem value="data-api">Data / API partnership</SelectItem>
                          <SelectItem value="lead-program">Performance lead program</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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
                  </div>

                  <div>
                    <Label htmlFor="campaignGoals">Campaign Goals</Label>
                    <Textarea
                      id="campaignGoals"
                      value={form.campaignGoals}
                      onChange={(event) => updateField('campaignGoals', event.target.value)}
                      placeholder="Describe the audience, funnel outcomes, and KPIs you want from Kluje."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetMarkets">Primary Target Markets</Label>
                    <Input
                      id="targetMarkets"
                      value={form.targetMarkets}
                      onChange={(event) => updateField('targetMarkets', event.target.value)}
                      placeholder="Texas, Florida, California"
                    />
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
              )}

              {activeStep.key === 'review' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Handshake className="h-4 w-4 text-primary" />
                      Application Summary
                    </div>
                    <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Organization</dt>
                        <dd>{form.organizationName || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Primary Contact</dt>
                        <dd>{form.contactName || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Partnership Type</dt>
                        <dd>{form.partnershipType || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Budget Range</dt>
                        <dd>{form.budgetBand || '—'}</dd>
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
                      I agree to be contacted by Kluje's partnerships team at the details provided above.
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
                    {submitting ? 'Submitting...' : 'Submit Partner Signup'}
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
