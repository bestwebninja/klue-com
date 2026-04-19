import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  MapPin,
  Settings,
  Sparkles,
  User,
  X,
} from 'lucide-react';

interface ProviderSetupWizardProps {
  userId: string;
  companyName?: string;
  onComplete: () => void;
  onDismiss: () => void;
}

type SetupStep = 'profile' | 'services' | 'location' | 'done';
type YesNo = 'yes' | 'no' | null;
type HomeownerStatus = 'yes' | 'no' | 'looking_to_buy' | null;
type ProfessionalRole = 'tradesman' | 'general_contractor' | 'realtor' | 'none' | null;

type OnboardingState = {
  contactName: string;
  profileTypes: string[];
  primaryGoal: string;
  isVeteran: YesNo;
  veteranBranch: string;
  veteranStatus: string;
  veteranSpecialty: string;
  isHomeowner: HomeownerStatus;
  homeownerIntent: string[];
  professionalRole: ProfessionalRole;
  yearsExperience: string;
  licensed: YesNo;
  insured: YesNo;
  crewSize: string;
  realtorFocus: string;
  realtorConnections: string[];
  ageRange: string;
  gender: string;
  shortIntent: string;
  mainCategory: string;
  specificServices: string[];
  serviceType: string;
  projectSizePreference: string;
  budgetRange: string;
  availability: string;
  financingInterest: string;
  growthSupport: string[];
  city: string;
  state: string;
  zipCode: string;
  serviceRadius: string;
  additionalZipCodes: string[];
  remoteAvailable: YesNo;
  willingToTravel: string;
  areaInterests: string[];
  internalFeedConsent: boolean;
};

const STORAGE_KEY = 'provider_onboarding_state_v2';

const PROFILE_TYPES = [
  'Homeowner',
  'Skilled Tradesman',
  'General Contractor',
  'Realtor',
  'Investor',
  'Veteran',
  'Small Business Owner',
  'Property Manager',
  'Other',
];

const PRIMARY_GOALS = [
  'Get job leads',
  'Find clients',
  'Hire a contractor',
  'Grow my business',
  'Find financing',
  'Connect with veterans',
  'Find local partners',
  'Explore opportunities',
];

const SERVICE_CONFIG = {
  provider: {
    'General Contracting': ['New builds', 'Renovations', 'Tenant improvements', 'Project management'],
    Electrical: ['Panel upgrades', 'Lighting', 'Rewiring', 'EV charger installs'],
    Plumbing: ['Pipe repair', 'Water heaters', 'Fixtures', 'Drain services'],
    HVAC: ['Installations', 'Repairs', 'Ductwork', 'Seasonal tune-ups'],
    Roofing: ['Leak repairs', 'Re-roofing', 'Inspections', 'Gutter installation'],
    Painting: ['Interior painting', 'Exterior painting', 'Commercial repaint', 'Stain & seal'],
    Flooring: ['Hardwood', 'Tile', 'LVP', 'Carpet'],
    Remodeling: ['Kitchen remodeling', 'Bathroom remodeling', 'Whole-home remodel', 'Additions'],
    Landscaping: ['Design', 'Irrigation', 'Hardscapes', 'Tree services'],
    Masonry: ['Brickwork', 'Stone veneer', 'Retaining walls', 'Concrete finishing'],
    Carpentry: ['Trim carpentry', 'Framing', 'Cabinet installation', 'Deck building'],
    'Cleaning / Maintenance': ['Turnover cleaning', 'Routine maintenance', 'Pressure washing', 'Janitorial contracts'],
    'Real Estate': ['Buyer representation', 'Seller representation', 'Property sourcing', 'Listing strategy'],
    'Homeowner Needs': ['Quick repairs', 'Seasonal prep', 'Renovation planning', 'Trusted contractor match'],
    'Financing / Lending': ['Project financing', 'HELOC support', 'Business lines', 'Equipment financing'],
    Other: ['Custom service package', 'Specialty consulting'],
  },
  homeowner: {
    'Homeowner Needs': ['Renovations', 'Repairs', 'Maintenance', 'Energy upgrades', 'Financing options'],
    Remodeling: ['Kitchen makeover', 'Bathroom refresh', 'Basement finishing', 'Accessibility updates'],
    Roofing: ['Leak fixes', 'Roof replacement', 'Storm restoration'],
    Landscaping: ['Curb appeal', 'Drainage fixes', 'Outdoor living'],
    'Financing / Lending': ['Pre-approval guidance', 'Home improvement loans', 'Budget planning'],
    Other: ['Not sure yet, need guidance'],
  },
  realtor: {
    'Real Estate': ['Contractor partner network', 'Investor referrals', 'Property prep', 'Project coordination'],
    Remodeling: ['Flip-ready teams', 'Staging upgrades', 'Value-add scope planning'],
    'General Contracting': ['Bid coordination', 'Renovation oversight', 'Inspection punch lists'],
    'Financing / Lending': ['Bridge loans', 'Investor financing', 'Buyer financing partners'],
    Other: ['Strategic local partnerships'],
  },
} as const;

const initOnboardingState = (): OnboardingState => ({
  contactName: '',
  profileTypes: [],
  primaryGoal: '',
  isVeteran: null,
  veteranBranch: '',
  veteranStatus: '',
  veteranSpecialty: '',
  isHomeowner: null,
  homeownerIntent: [],
  professionalRole: null,
  yearsExperience: '',
  licensed: null,
  insured: null,
  crewSize: '',
  realtorFocus: '',
  realtorConnections: [],
  ageRange: '',
  gender: '',
  shortIntent: '',
  mainCategory: '',
  specificServices: [],
  serviceType: '',
  projectSizePreference: '',
  budgetRange: '',
  availability: '',
  financingInterest: '',
  growthSupport: [],
  city: '',
  state: '',
  zipCode: '',
  serviceRadius: 'zip_only',
  additionalZipCodes: [],
  remoteAvailable: null,
  willingToTravel: '',
  areaInterests: [],
  internalFeedConsent: false,
});

const ProviderSetupWizard = ({ userId, companyName, onComplete, onDismiss }: ProviderSetupWizardProps) => {
  const [step, setStep] = useState<SetupStep>('profile');
  const [state, setState] = useState<OnboardingState>(initOnboardingState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [zipInput, setZipInput] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const trackEvent = useCallback((event: string, payload: Record<string, unknown>) => {
    // analytics hook stub
    console.debug('[analytics]', event, payload);
  }, []);

  useEffect(() => {
    trackEvent('onboarding_step_viewed', { step });
  }, [step, trackEvent]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState({ ...initOnboardingState(), ...JSON.parse(saved) });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const hydrateProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, city, state, zip_code, bio')
        .eq('id', userId)
        .maybeSingle();
      if (!data) return;

      setState(prev => ({
        ...prev,
        contactName: prev.contactName || data.full_name || '',
        city: prev.city || data.city || '',
        state: prev.state || data.state || '',
        zipCode: prev.zipCode || data.zip_code || '',
        shortIntent: prev.shortIntent || data.bio || '',
      }));
    };

    hydrateProfile();
  }, [userId]);

  const flowType = useMemo<'provider' | 'homeowner' | 'realtor'>(() => {
    const isRealtor = state.profileTypes.includes('Realtor') || state.professionalRole === 'realtor';
    const isProvider =
      state.profileTypes.some(type => ['Skilled Tradesman', 'General Contractor', 'Small Business Owner', 'Property Manager'].includes(type)) ||
      ['tradesman', 'general_contractor'].includes(state.professionalRole ?? '');

    if (isRealtor) return 'realtor';
    if (!isProvider && state.profileTypes.includes('Homeowner')) return 'homeowner';
    return 'provider';
  }, [state.profileTypes, state.professionalRole]);

  const mainCategories = useMemo(() => Object.keys(SERVICE_CONFIG[flowType]), [flowType]);

  const filteredSpecificServices = useMemo(() => {
    const options = state.mainCategory
      ? SERVICE_CONFIG[flowType][state.mainCategory as keyof (typeof SERVICE_CONFIG)[typeof flowType]] || []
      : [];

    if (!serviceSearch.trim()) return options;
    return options.filter(option => option.toLowerCase().includes(serviceSearch.toLowerCase()));
  }, [flowType, serviceSearch, state.mainCategory]);

  const stepTitles: Record<Exclude<SetupStep, 'done'>, string> = {
    profile: 'Profile',
    services: 'Services',
    location: 'Location',
  };

  const setField = <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [String(key)]: '' }));
    trackEvent('onboarding_field_updated', { field: key, value });
  };

  const toggleArrayValue = (key: keyof OnboardingState, value: string) => {
    const list = state[key] as string[];
    const next = list.includes(value) ? list.filter(v => v !== value) : [...list, value];
    setField(key as never, next as never);
  };

  const validateStep = (target: Exclude<SetupStep, 'done'>) => {
    const nextErrors: Record<string, string> = {};

    if (target === 'profile') {
      if (!state.contactName.trim()) nextErrors.contactName = 'Contact name is required.';
      if (state.profileTypes.length === 0) nextErrors.profileTypes = 'Select at least one profile type.';
      if (!state.primaryGoal) nextErrors.primaryGoal = 'Choose your primary goal.';
      if (!state.isHomeowner) nextErrors.isHomeowner = 'Please choose your homeowner status.';
      if (!state.professionalRole) nextErrors.professionalRole = 'Please select your professional role.';
      if (state.isVeteran === 'yes' && !state.veteranStatus) nextErrors.veteranStatus = 'Please select veteran status.';
      if (['tradesman', 'general_contractor'].includes(state.professionalRole ?? '') && !state.yearsExperience) {
        nextErrors.yearsExperience = 'Years of experience is required for service pros.';
      }
      if (state.professionalRole === 'realtor' && !state.realtorFocus) nextErrors.realtorFocus = 'Select your realtor focus.';
    }

    if (target === 'services') {
      if (!state.mainCategory) nextErrors.mainCategory = 'Main category is required.';
      if (!state.serviceType) nextErrors.serviceType = 'Select a service type.';
      if (!state.projectSizePreference) nextErrors.projectSizePreference = 'Project size preference is required.';
      if (!state.availability) nextErrors.availability = 'Availability is required.';
      if (!state.financingInterest) nextErrors.financingInterest = 'Please select financing preference.';
    }

    if (target === 'location') {
      if (!state.city.trim()) nextErrors.city = 'City is required.';
      if (!state.state.trim()) nextErrors.state = 'State is required.';
      if (!state.zipCode.trim()) nextErrors.zipCode = 'ZIP code is required.';
      if (!/^\d{5}$/.test(state.zipCode.trim())) nextErrors.zipCode = 'Please enter a valid 5-digit ZIP code.';
      if (!state.willingToTravel) nextErrors.willingToTravel = 'Please select travel preference.';
      if (!state.remoteAvailable) nextErrors.remoteAvailable = 'Please choose remote availability.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const userArchetype = useMemo(() => {
    if (state.isVeteran === 'yes' && state.professionalRole === 'general_contractor') return 'Veteran Contractor Seeking Leads';
    if (flowType === 'homeowner') return 'Homeowner Seeking Renovation Help';
    if (flowType === 'realtor') return 'Realtor Building Local Contractor Network';
    return 'Tradesman Looking for Growth and Financing';
  }, [flowType, state.isVeteran, state.professionalRole]);

  const matchingSummary = useMemo(
    () => ({
      archetype: userArchetype,
      goals: {
        primaryGoal: state.primaryGoal,
        shortIntent: state.shortIntent,
        growthSupport: state.growthSupport,
      },
      profileSignals: {
        profileTypes: state.profileTypes,
        professionalRole: state.professionalRole,
        veteranStatus: state.veteranStatus,
        homeownerStatus: state.isHomeowner,
      },
      serviceSignals: {
        mainCategory: state.mainCategory,
        specificServices: state.specificServices,
        projectSizePreference: state.projectSizePreference,
        budgetRange: state.budgetRange,
        financingInterest: state.financingInterest,
      },
      locationSignals: {
        city: state.city,
        state: state.state,
        zipCode: state.zipCode,
        radius: state.serviceRadius,
        additionalZipCodes: state.additionalZipCodes,
      },
    }),
    [state, userArchetype],
  );

  const handleNext = async () => {
    if (step === 'profile') {
      if (!validateStep('profile')) return;
      trackEvent('onboarding_step_completed', { step: 'profile' });
      setStep('services');
      return;
    }

    if (step === 'services') {
      if (!validateStep('services')) return;
      trackEvent('onboarding_step_completed', { step: 'services', branch: flowType });
      setStep('location');
      return;
    }

    if (step !== 'location') return;
    if (!validateStep('location')) return;

    setIsLoading(true);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: state.contactName,
        bio: state.shortIntent || null,
        city: state.city,
        state: state.state,
        zip_code: state.zipCode,
        services_offered: state.specificServices,
      })
      .eq('id', userId);

    const address = `${state.city}, ${state.state} ${state.zipCode}`;
    const { error: locationError } = await supabase
      .from('provider_locations')
      .upsert(
        {
          provider_id: userId,
          address,
          city: state.city,
          postcode: state.zipCode,
          is_primary: true,
        },
        { onConflict: 'provider_id,address' },
      );

    setIsLoading(false);

    if (profileError || locationError) {
      toast({ title: 'Error', description: 'Unable to complete onboarding. Please try again.', variant: 'destructive' });
      return;
    }

    trackEvent('onboarding_step_completed', { step: 'location' });
    trackEvent('onboarding_completed', { archetype: userArchetype, summary: matchingSummary });
    setStep('done');
  };

  const handleAddZip = () => {
    const trimmed = zipInput.trim();
    if (!/^\d{5}$/.test(trimmed) || state.additionalZipCodes.includes(trimmed)) return;
    setField('additionalZipCodes', [...state.additionalZipCodes, trimmed]);
    setZipInput('');
  };

  const branchInfo = (message: string, branch: string) => {
    trackEvent('onboarding_branch_triggered', { branch });
    return (
      <div className="rounded-xl border border-amber-300/40 bg-amber-400/10 p-3 text-sm text-amber-100">
        {message}
      </div>
    );
  };

  if (step === 'done') {
    return (
      <Card className="border-amber-300/40 bg-[#0a1b3d] text-white">
        <CardContent className="py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-300/20">
            <Sparkles className="h-7 w-7 text-amber-300" />
          </div>
          <h2 className="text-2xl font-bold">Your adaptive profile is ready.</h2>
          <p className="mt-2 text-sm text-slate-200">
            Archetype: <span className="font-semibold text-amber-200">{userArchetype}</span>
          </p>
          <p className="mt-3 text-sm text-slate-300">We use your profile to surface the right projects, partners, and programs.</p>
          <Button className="mt-6 bg-amber-400 text-slate-900 hover:bg-amber-300" size="lg" onClick={onComplete}>
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const steps: { key: Exclude<SetupStep, 'done'>; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'services', label: 'Services', icon: Settings },
    { key: 'location', label: 'Location', icon: MapPin },
  ];

  const currentIndex = steps.findIndex(item => item.key === step);

  return (
    <Card className="border-amber-300/40 bg-[#0a1b3d] text-white">
      <CardContent className="pt-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Sparkles className="h-5 w-5 text-amber-300" />
              Complete Your Setup
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Answering a few details helps us match you to the best leads, tools, and local connections.
            </p>
            {companyName ? <p className="mt-1 text-xs text-slate-400">Company: {companyName}</p> : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onDismiss} className="text-slate-300 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((item, index) => (
            <div key={item.key} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  currentIndex === index
                    ? 'bg-amber-300 text-slate-900'
                    : currentIndex > index
                      ? 'bg-emerald-500/30 text-emerald-200'
                      : 'bg-slate-700 text-slate-300'
                }`}
              >
                {currentIndex > index ? <CheckCircle className="h-4 w-4" /> : index + 1}
              </div>
              <span className={`hidden text-xs sm:inline ${currentIndex === index ? 'text-amber-200' : 'text-slate-300'}`}>
                {item.label}
              </span>
              {index < steps.length - 1 ? (
                <div className={`h-0.5 w-8 sm:w-12 ${currentIndex > index ? 'bg-amber-300/80' : 'bg-slate-700'}`} />
              ) : null}
            </div>
          ))}
        </div>

        {step === 'profile' ? (
          <div className="mx-auto max-w-3xl space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  value={state.contactName}
                  onChange={e => setField('contactName', e.target.value)}
                  placeholder="Jane Smith"
                  className="mt-1 rounded-xl border-slate-500 bg-slate-900"
                />
                <p className="mt-1 text-xs text-slate-300">This identifies your primary account contact.</p>
                {errors.contactName ? <p className="text-xs text-red-300">{errors.contactName}</p> : null}
              </div>

              <div className="md:col-span-2">
                <Label>Profile Type *</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PROFILE_TYPES.map(option => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => toggleArrayValue('profileTypes', option)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        state.profileTypes.includes(option)
                          ? 'border-amber-300 bg-amber-300 text-slate-900'
                          : 'border-slate-500 bg-slate-800 text-slate-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-300">We use this to route leads, connections, and resources.</p>
                {errors.profileTypes ? <p className="text-xs text-red-300">{errors.profileTypes}</p> : null}
              </div>

              <div className="md:col-span-2">
                <Label>Primary Goal *</Label>
                <Select value={state.primaryGoal} onValueChange={value => setField('primaryGoal', value)}>
                  <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900">
                    <SelectValue placeholder="Select your main onboarding goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIMARY_GOALS.map(goal => (
                      <SelectItem key={goal} value={goal}>
                        {goal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.primaryGoal ? <p className="text-xs text-red-300">{errors.primaryGoal}</p> : null}
              </div>

              <div>
                <Label>Are you a veteran?</Label>
                <Select value={state.isVeteran ?? ''} onValueChange={value => setField('isVeteran', value as YesNo)}>
                  <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900">
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Do you own a home? *</Label>
                <Select value={state.isHomeowner ?? ''} onValueChange={value => setField('isHomeowner', value as HomeownerStatus)}>
                  <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900">
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="looking_to_buy">Looking to buy</SelectItem>
                  </SelectContent>
                </Select>
                {errors.isHomeowner ? <p className="text-xs text-red-300">{errors.isHomeowner}</p> : null}
              </div>

              {state.isVeteran === 'yes' ? (
                <div className="space-y-3 md:col-span-2">
                  {branchInfo(
                    'We proudly connect veterans with other veterans, local opportunities, business support, and growth tools.',
                    'veteran_yes',
                  )}
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label>Branch</Label>
                      <Input value={state.veteranBranch} onChange={e => setField('veteranBranch', e.target.value)} className="mt-1 rounded-xl border-slate-500 bg-slate-900" />
                    </div>
                    <div>
                      <Label>Status *</Label>
                      <Select value={state.veteranStatus} onValueChange={value => setField('veteranStatus', value)}>
                        <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900">
                          <SelectValue placeholder="Veteran status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Veteran">Veteran</SelectItem>
                          <SelectItem value="Active Duty">Active Duty</SelectItem>
                          <SelectItem value="Reservist">Reservist</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.veteranStatus ? <p className="text-xs text-red-300">{errors.veteranStatus}</p> : null}
                    </div>
                  </div>
                  <div>
                    <Label>Military specialty (optional)</Label>
                    <Input value={state.veteranSpecialty} onChange={e => setField('veteranSpecialty', e.target.value)} className="mt-1 rounded-xl border-slate-500 bg-slate-900" />
                  </div>
                </div>
              ) : null}

              {state.isHomeowner === 'yes' ? (
                <div className="md:col-span-2">
                  <Label>Homeowner interests</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['renovations', 'repairs', 'maintenance', 'investment property', 'financing'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleArrayValue('homeownerIntent', option)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          state.homeownerIntent.includes(option) ? 'border-amber-300 bg-amber-300 text-slate-900' : 'border-slate-500 bg-slate-800'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {state.isHomeowner === 'no' || state.isHomeowner === 'looking_to_buy' ? (
                <div className="md:col-span-2">
                  {branchInfo('You can access homeownership and financing resources based on your goals.', 'homeowner_resources')}
                </div>
              ) : null}

              <div>
                <Label>Professional Role *</Label>
                <Select value={state.professionalRole ?? ''} onValueChange={value => setField('professionalRole', value as ProfessionalRole)}>
                  <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tradesman">Skilled tradesman</SelectItem>
                    <SelectItem value="general_contractor">General contractor</SelectItem>
                    <SelectItem value="realtor">Realtor</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
                {errors.professionalRole ? <p className="text-xs text-red-300">{errors.professionalRole}</p> : null}
              </div>

              {(state.professionalRole === 'tradesman' || state.professionalRole === 'general_contractor') && (
                <>
                  <div>
                    <Label>Years of experience *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={state.yearsExperience}
                      onChange={e => setField('yearsExperience', e.target.value)}
                      className="mt-1 rounded-xl border-slate-500 bg-slate-900"
                    />
                    {errors.yearsExperience ? <p className="text-xs text-red-300">{errors.yearsExperience}</p> : null}
                  </div>
                  <div>
                    <Label>Crew size</Label>
                    <Input value={state.crewSize} onChange={e => setField('crewSize', e.target.value)} className="mt-1 rounded-xl border-slate-500 bg-slate-900" />
                  </div>
                  <div>
                    <Label>Licensed?</Label>
                    <Select value={state.licensed ?? ''} onValueChange={value => setField('licensed', value as YesNo)}>
                      <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900"><SelectValue placeholder="Choose" /></SelectTrigger>
                      <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Insured?</Label>
                    <Select value={state.insured ?? ''} onValueChange={value => setField('insured', value as YesNo)}>
                      <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900"><SelectValue placeholder="Choose" /></SelectTrigger>
                      <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {state.professionalRole === 'realtor' && (
                <>
                  <div>
                    <Label>Realtor focus *</Label>
                    <Select value={state.realtorFocus} onValueChange={value => setField('realtorFocus', value)}>
                      <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900"><SelectValue placeholder="Choose focus" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.realtorFocus ? <p className="text-xs text-red-300">{errors.realtorFocus}</p> : null}
                  </div>
                  <div className="md:col-span-2">
                    <Label>Who do you want to connect with?</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['contractors', 'investors', 'homeowners', 'vendors'].map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleArrayValue('realtorConnections', option)}
                          className={`rounded-full border px-3 py-1 text-xs ${
                            state.realtorConnections.includes(option) ? 'border-amber-300 bg-amber-300 text-slate-900' : 'border-slate-500 bg-slate-800'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label>Age range</Label>
                <Input value={state.ageRange} onChange={e => setField('ageRange', e.target.value)} placeholder="e.g. 35-44" className="mt-1 rounded-xl border-slate-500 bg-slate-900" />
              </div>
              <div>
                <Label>Gender (optional)</Label>
                <Input value={state.gender} onChange={e => setField('gender', e.target.value)} className="mt-1 rounded-xl border-slate-500 bg-slate-900" />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="shortIntent">What are you hoping to achieve in the next 90 days?</Label>
                <Textarea
                  id="shortIntent"
                  value={state.shortIntent}
                  onChange={e => setField('shortIntent', e.target.value)}
                  className="mt-1 min-h-[90px] rounded-xl border-slate-500 bg-slate-900"
                />
                <p className="mt-1 text-xs text-slate-300">This helps us personalize your matches and opportunities.</p>
              </div>
            </div>
          </div>
        ) : null}

        {step === 'services' ? (
          <div className="mx-auto max-w-3xl space-y-5">
            <div className="rounded-xl border border-slate-500/60 bg-slate-900/70 p-3 text-sm text-slate-200">
              {flowType === 'homeowner'
                ? 'What kind of help do you need?'
                : flowType === 'realtor'
                  ? 'What types of project partners and deals are you looking for?'
                  : 'Build your service profile so we can match leads and opportunities accurately.'}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Main Service Category *</Label>
                <Select
                  value={state.mainCategory}
                  onValueChange={value => {
                    setField('mainCategory', value);
                    setField('specificServices', []);
                  }}
                >
                  <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {mainCategories.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.mainCategory ? <p className="text-xs text-red-300">{errors.mainCategory}</p> : null}
              </div>

              <div>
                <Label>Service Type *</Label>
                <Select value={state.serviceType} onValueChange={value => setField('serviceType', value)}>
                  <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
                {errors.serviceType ? <p className="text-xs text-red-300">{errors.serviceType}</p> : null}
              </div>

              <div className="md:col-span-2">
                <Label>Specific Services Offered</Label>
                <Input
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                  placeholder="Search services"
                  className="mt-1 rounded-xl border-slate-500 bg-slate-900"
                />
                <div className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-600 p-2">
                  {filteredSpecificServices.map(option => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => toggleArrayValue('specificServices', option)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        state.specificServices.includes(option) ? 'border-amber-300 bg-amber-300 text-slate-900' : 'border-slate-500 bg-slate-800'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Project Size Preference *</Label>
                <Select value={state.projectSizePreference} onValueChange={value => setField('projectSizePreference', value)}>
                  <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900"><SelectValue placeholder="Select preference" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small_jobs">Small jobs</SelectItem>
                    <SelectItem value="medium_projects">Medium projects</SelectItem>
                    <SelectItem value="large_projects">Large projects</SelectItem>
                    <SelectItem value="ongoing_contracts">Ongoing contracts</SelectItem>
                    <SelectItem value="consulting_only">Consulting only</SelectItem>
                  </SelectContent>
                </Select>
                {errors.projectSizePreference ? <p className="text-xs text-red-300">{errors.projectSizePreference}</p> : null}
              </div>

              <div>
                <Label>{flowType === 'homeowner' ? 'Project Budget Range' : 'Deal / Budget Range'}</Label>
                <Input
                  value={state.budgetRange}
                  onChange={e => setField('budgetRange', e.target.value)}
                  placeholder={flowType === 'homeowner' ? 'e.g. $15k-$40k' : 'e.g. $5k-$50k or retainers'}
                  className="mt-1 rounded-xl border-slate-500 bg-slate-900"
                />
              </div>

              <div>
                <Label>Availability *</Label>
                <Select value={state.availability} onValueChange={value => setField('availability', value)}>
                  <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900"><SelectValue placeholder="Select availability" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="this_week">This week</SelectItem>
                    <SelectItem value="this_month">This month</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
                {errors.availability ? <p className="text-xs text-red-300">{errors.availability}</p> : null}
              </div>

              <div>
                <Label>Financing Interest *</Label>
                <Select
                  value={state.financingInterest}
                  onValueChange={value => {
                    setField('financingInterest', value);
                    trackEvent('onboarding_branch_triggered', { branch: 'financing_interest', value });
                  }}
                >
                  <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900"><SelectValue placeholder="Select option" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project_lenders">Match me with licensed lenders for projects</SelectItem>
                    <SelectItem value="growth_funding">Match me with business growth funding</SelectItem>
                    <SelectItem value="none">No financing needed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.financingInterest ? <p className="text-xs text-red-300">{errors.financingInterest}</p> : null}
              </div>

              {state.financingInterest && state.financingInterest !== 'none'
                ? branchInfo('Financing preferences help us connect you with licensed funding partners.', 'financing_support')
                : null}

              <div className="md:col-span-2">
                <Label>Growth Support Interests</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Lead generation', 'Social media auto-posting', 'Marketing ideas', 'Veteran business support', 'Referral partnerships'].map(option => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => toggleArrayValue('growthSupport', option)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        state.growthSupport.includes(option) ? 'border-amber-300 bg-amber-300 text-slate-900' : 'border-slate-500 bg-slate-800'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === 'location' ? (
          <div className="mx-auto max-w-3xl space-y-5">
            <p className="text-sm text-slate-300">Your location helps us match you with nearby opportunities and service areas.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>City *</Label>
                <Input value={state.city} onChange={e => setField('city', e.target.value)} className="mt-1 rounded-xl border-slate-500 bg-slate-900" />
                {errors.city ? <p className="text-xs text-red-300">{errors.city}</p> : null}
              </div>
              <div>
                <Label>State *</Label>
                <Input value={state.state} onChange={e => setField('state', e.target.value)} className="mt-1 rounded-xl border-slate-500 bg-slate-900" />
                {errors.state ? <p className="text-xs text-red-300">{errors.state}</p> : null}
              </div>
              <div>
                <Label>ZIP Code *</Label>
                <Input value={state.zipCode} onChange={e => setField('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))} className="mt-1 rounded-xl border-slate-500 bg-slate-900" />
                {errors.zipCode ? <p className="text-xs text-red-300">{errors.zipCode}</p> : null}
              </div>

              <div>
                <Label>Service Radius</Label>
                <Select value={state.serviceRadius} onValueChange={value => setField('serviceRadius', value)}>
                  <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zip_only">ZIP only</SelectItem>
                    <SelectItem value="10_miles">10 miles</SelectItem>
                    <SelectItem value="25_miles">25 miles</SelectItem>
                    <SelectItem value="50_miles">50 miles</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Additional ZIP Codes Served</Label>
                <div className="mt-1 flex gap-2">
                  <Input value={zipInput} onChange={e => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="Add ZIP" className="rounded-xl border-slate-500 bg-slate-900" />
                  <Button type="button" variant="outline" onClick={handleAddZip}>Add</Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {state.additionalZipCodes.map(zip => (
                    <Badge key={zip} className="bg-slate-700 text-slate-100">
                      {zip}
                      <button type="button" onClick={() => setField('additionalZipCodes', state.additionalZipCodes.filter(item => item !== zip))} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Remote / Consulting Available? *</Label>
                <Select value={state.remoteAvailable ?? ''} onValueChange={value => setField('remoteAvailable', value as YesNo)}>
                  <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                </Select>
                {errors.remoteAvailable ? <p className="text-xs text-red-300">{errors.remoteAvailable}</p> : null}
              </div>

              <div>
                <Label>Willing to travel for the right project? *</Label>
                <Select value={state.willingToTravel} onValueChange={value => setField('willingToTravel', value)}>
                  <SelectTrigger className="mt-1 rounded-xl border-slate-500 bg-slate-900"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="occasionally">Occasionally</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
                {errors.willingToTravel ? <p className="text-xs text-red-300">{errors.willingToTravel}</p> : null}
              </div>

              <div className="md:col-span-2">
                <Label>Area Interest Preferences</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Job leads', 'Homeowner projects', 'Veteran networking', 'Realtor partnerships', 'Investor deals', 'Lender opportunities'].map(option => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => toggleArrayValue('areaInterests', option)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        state.areaInterests.includes(option) ? 'border-amber-300 bg-amber-300 text-slate-900' : 'border-slate-500 bg-slate-800'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 rounded-xl border border-slate-500 p-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="internal-feed"
                    checked={state.internalFeedConsent}
                    onCheckedChange={checked => setField('internalFeedConsent', Boolean(checked))}
                  />
                  <Label htmlFor="internal-feed" className="text-sm font-normal">
                    Allow us to create a summary post on our internal board so nearby users can connect with me.
                  </Label>
                </div>

                {state.internalFeedConsent ? (
                  <div className="mt-3 rounded-lg bg-slate-800 p-3 text-xs text-slate-200">
                    Preview: {state.contactName || 'This user'} in {state.city || 'their area'} is seeking {state.primaryGoal || 'new opportunities'} in {state.mainCategory || 'their category'}.
                  </div>
                ) : null}
              </div>

              <div className="md:col-span-2 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-xs text-amber-100">
                Matching preview ready for downstream services: <strong>{userArchetype}</strong>
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-slate-900 p-2 text-[11px] text-slate-300">
                  {JSON.stringify(matchingSummary, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex gap-3">
          {step !== 'profile' ? (
            <Button
              variant="outline"
              onClick={() => setStep(step === 'services' ? 'profile' : 'services')}
              className="border-slate-500 bg-transparent text-slate-200"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : null}

          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="ml-auto bg-amber-400 text-slate-900 hover:bg-amber-300"
            size="lg"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {step === 'location' ? 'Finish Setup' : `Continue to ${stepTitles[step === 'profile' ? 'services' : 'location']}`}
            {step === 'location' ? <CheckCircle className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderSetupWizard;
