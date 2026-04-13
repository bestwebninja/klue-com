import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LocationPicker } from '@/components/LocationPicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Settings,
  MapPin,
  User,
  Loader2,
  Sparkles,
  X,
  HardHat,
  Wrench,
  Scale,
} from 'lucide-react';

const GC_OPTIONS = [
  'General Contractor','Building Contractor','Renovation Contractor',
  'Project Manager / Site Supervisor','Handyman','Carpentry / Joinery',
  'Kitchen Renovation','Bathroom Renovation','Flooring Contractor',
  'Painting & Decorating','Plastering','Tiling','Roofing Contractor',
  'Window & Door Installation','Paving & Concrete','Waterproofing',
  'Post-Construction Cleanup',
];
const SUB_OPTIONS = [
  'Electrician','Lighting Specialist','Plumber','HVAC / Air Conditioning',
  'Landscaping Contractor','Garden Designer','Scaffolding Contractor',
  'Swimming Pool Contractor','Interior Designer','Cleaning Services',
  'Maintenance Services','Demolition Contractor','Masonry / Brickwork',
  'Insulation Contractor','Drywall / Sheetrock','Glass & Glazing',
  'Custom Furniture / Millwork',
];
const PROFESSIONAL_OPTIONS = [
  'Realtor / Real Estate Agent','Real Estate Attorney','Title Company / Officer',
  'Architect','Structural Engineer','Civil Engineer',
  'Town Planner / Zoning Consultant','Insurance Agent / Broker',
  'Health & Safety Officer','Security Consultant','Arbitration Specialist',
  'Property Manager','Mortgage Broker / Lender','Home Inspector',
  'Environmental Consultant',
];
import type { Database } from '@/integrations/supabase/types';

type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];

interface ProviderSetupWizardProps {
  userId: string;
  companyName?: string;
  onComplete: () => void;
  onDismiss: () => void;
}

type SetupStep = 'profile' | 'services' | 'location' | 'done';

const ProviderSetupWizard = ({ userId, companyName, onComplete, onDismiss }: ProviderSetupWizardProps) => {
  const [step, setStep] = useState<SetupStep>('profile');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [gcType, setGcType] = useState('');
  const [subType, setSubType] = useState('');
  const [profType, setProfType] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    city: string;
    postcode: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const mainCategories = categories.filter(c => !c.parent_id);
  const subCategories = categories.filter(c => c.parent_id === selectedMainCategory);

  useEffect(() => {
    fetchCategories();
    fetchExistingProfile();
    checkSignupMetadata();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  };

  const fetchExistingProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, bio')
      .eq('id', userId)
      .maybeSingle();
    if (data) {
      setFullName(data.full_name || '');
      setBio(data.bio || '');
    }
  };

  // Auto-populate from signup metadata
  const checkSignupMetadata = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.user_metadata) return;

    const meta = user.user_metadata;
    const signupServices = meta.selected_services as string[] | undefined;

    if (signupServices && signupServices.length > 0) {
      // Fetch categories then auto-save services
      const { data: cats } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');
      if (!cats) return;

      const { categoryIds } = mapServicesToCategoryIds(signupServices, cats);

      if (categoryIds.length > 0) {
        // Check if already saved
        const { data: existing } = await supabase
          .from('provider_services')
          .select('id')
          .eq('provider_id', userId)
          .limit(1);

        if (!existing || existing.length === 0) {
          const insertData = categoryIds.map(categoryId => ({
            provider_id: userId,
            category_id: categoryId,
          }));
          await supabase.from('provider_services').insert(insertData);
        }

        // Skip to location step since services are done
        setStep('location');
      }
    }
  };

  const toggleSubcategory = (id: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast({ title: 'Name required', description: 'Please enter your contact name.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), bio: bio.trim() || null })
      .eq('id', userId);
    setIsLoading(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save profile.', variant: 'destructive' });
    } else {
      setStep('services');
    }
  };

  const handleSaveServices = async () => {
    const chosen = [gcType, subType, profType].filter(Boolean);
    if (chosen.length === 0) {
      toast({ title: 'Category required', description: 'Please select at least one category type.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    // Save service_type_key to profile
    const serviceTypeKey = gcType ? 'general_contractor' : subType ? 'subcontractor' : 'professional';
    const serviceTypeLabel = gcType || subType || profType;
    await (supabase.from('profiles').update({
      service_type_key: serviceTypeKey,
      service_type_label: serviceTypeLabel,
    } as any).eq('id', userId));

    setIsLoading(false);
    setStep('location');
  };

  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      toast({ title: 'Location required', description: 'Please select your service area.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    const { error } = await supabase.from('provider_locations').insert({
      provider_id: userId,
      address: selectedLocation.address,
      city: selectedLocation.city,
      postcode: selectedLocation.postcode,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      is_primary: true,
    });
    setIsLoading(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save location.', variant: 'destructive' });
    } else {
      setStep('done');
    }
  };

  const steps: { key: SetupStep; label: string; icon: typeof Settings }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'services', label: 'Services', icon: Settings },
    { key: 'location', label: 'Location', icon: MapPin },
  ];

  const currentIndex = steps.findIndex(s => s.key === step);

  if (step === 'done') {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <CardContent className="py-10 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">You're all set!</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Your profile is ready. You'll now see job leads matching your services. Upgrade to Pro to start quoting.
          </p>
          <Button size="lg" onClick={onComplete}>
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Complete Your Setup
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Finish setting up your profile to start receiving job leads.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onDismiss} className="text-muted-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s.key
                  ? 'bg-primary text-primary-foreground'
                  : currentIndex > i
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {currentIndex > i ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === s.key ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className={`w-6 sm:w-10 h-0.5 ${currentIndex > i ? 'bg-primary/40' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Profile */}
        {step === 'profile' && (
          <div className="space-y-4 max-w-lg mx-auto">
            <div>
              <Label htmlFor="setup-name">Contact Name <span className="text-destructive">*</span></Label>
              <Input
                id="setup-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
              />
              <p className="text-xs text-muted-foreground mt-1">Your name as the primary business contact.</p>
            </div>
            <div>
              <Label htmlFor="setup-bio">About Your Business</Label>
              <textarea
                id="setup-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell customers about your business, experience, and what sets you apart..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px] resize-y"
                rows={4}
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Continue to Services
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Services — three-category model */}
        {step === 'services' && (
          <div className="space-y-4 max-w-lg mx-auto">
            <div>
              <Label>Select Your Main Category <span className="text-destructive">*</span></Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose your type in any category that applies to you.
              </p>
            </div>

            {/* 1. General Contractors */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-orange-500/15 flex items-center justify-center">
                  <HardHat className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <span className="text-sm font-semibold text-foreground">General Contractors</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Licensed GCs, builders, renovation specialists, project managers &amp; site supervisors.
              </p>
              <Select value={gcType} onValueChange={setGcType}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select your GC type…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— Not applicable —</SelectItem>
                  {GC_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Sub-Contractors */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-500/15 flex items-center justify-center">
                  <Wrench className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <span className="text-sm font-semibold text-foreground">Sub-Contractors</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tradespeople and specialty contractors — electricians, plumbers, HVAC, landscaping &amp; more.
              </p>
              <Select value={subType} onValueChange={setSubType}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select your trade…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— Not applicable —</SelectItem>
                  {SUB_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Professional Services */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-purple-500/15 flex items-center justify-center">
                  <Scale className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <span className="text-sm font-semibold text-foreground">Professional Services</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Licensed professionals — Realtors, Architects, Attorneys, Engineers, Title Officers &amp; more.
              </p>
              <Select value={profType} onValueChange={setProfType}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select your profession…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— Not applicable —</SelectItem>
                  {PROFESSIONAL_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Selected badges */}
            {(gcType || subType || profType) && (
              <div className="flex flex-wrap gap-1.5">
                {gcType && <Badge variant="secondary" className="gap-1 text-xs"><HardHat className="w-3 h-3" />{gcType}<button type="button" onClick={() => setGcType('')}><X className="h-3 w-3 ml-1" /></button></Badge>}
                {subType && <Badge variant="secondary" className="gap-1 text-xs"><Wrench className="w-3 h-3" />{subType}<button type="button" onClick={() => setSubType('')}><X className="h-3 w-3 ml-1" /></button></Badge>}
                {profType && <Badge variant="secondary" className="gap-1 text-xs"><Scale className="w-3 h-3" />{profType}<button type="button" onClick={() => setProfType('')}><X className="h-3 w-3 ml-1" /></button></Badge>}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('profile')}>
                <ArrowLeft className="w-4 h-4 mr-1" />Back
              </Button>
              <Button
                onClick={handleSaveServices}
                className="flex-1"
                disabled={isLoading || (!gcType && !subType && !profType)}
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Continue to Location
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 'location' && (
          <div className="space-y-4 max-w-lg mx-auto">
            <div>
              <Label>Service Area Postcode <span className="text-destructive">*</span></Label>
              <p className="text-xs text-muted-foreground mb-2">Enter your primary service area postcode so customers can find you.</p>
              <LocationPicker
                onLocationSelect={(loc) => setSelectedLocation(loc)}
                initialLocation={selectedLocation ? {
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  address: selectedLocation.address,
                } : undefined}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('services')}>
                <ArrowLeft className="w-4 h-4 mr-1" />Back
              </Button>
              <Button onClick={handleSaveLocation} className="flex-1" disabled={isLoading || !selectedLocation}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Finish Setup
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderSetupWizard;
