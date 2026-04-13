import { useState, useEffect } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { VeteranProfileSection, type VeteranProfileData } from '@/components/veteran/VeteranProfileSection';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { mapServicesToCategoryIds, providerServiceTaxonomy } from '@/lib/providerServiceTaxonomy';

import { Briefcase, Home, Loader2, MapPin, CheckCircle, AlertCircle, UserCircle, X, HardHat, Wrench, Scale } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { isValidUSZipCode, formatUSZipCode } from '@/lib/zipCodeValidation';

type UserType = 'provider' | 'homeowner';

// ─── Category option lists ────────────────────────────────────────────────────
const GC_OPTIONS = [
  'General Contractor',
  'Building Contractor',
  'Renovation Contractor',
  'Project Manager / Site Supervisor',
  'Handyman',
  'Carpentry / Joinery',
  'Kitchen Renovation',
  'Bathroom Renovation',
  'Flooring Contractor',
  'Painting & Decorating',
  'Plastering',
  'Tiling',
  'Roofing Contractor',
  'Window & Door Installation',
  'Paving & Concrete',
  'Waterproofing',
  'Post-Construction Cleanup',
];

const SUB_OPTIONS = [
  'Electrician',
  'Lighting Specialist',
  'Plumber',
  'HVAC / Air Conditioning',
  'Landscaping Contractor',
  'Garden Designer',
  'Scaffolding Contractor',
  'Swimming Pool Contractor',
  'Interior Designer',
  'Cleaning Services',
  'Maintenance Services',
  'Demolition Contractor',
  'Masonry / Brickwork',
  'Insulation Contractor',
  'Drywall / Sheetrock',
  'Glass & Glazing',
  'Custom Furniture / Millwork',
];

const PROFESSIONAL_OPTIONS = [
  'Realtor / Real Estate Agent',
  'Real Estate Attorney',
  'Title Company / Officer',
  'Architect',
  'Structural Engineer',
  'Civil Engineer',
  'Town Planner / Zoning Consultant',
  'Insurance Agent / Broker',
  'Health & Safety Officer',
  'Security Consultant',
  'Arbitration Specialist',
  'Property Manager',
  'Mortgage Broker / Lender',
  'Home Inspector',
  'Environmental Consultant',
];

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface LocationData {
  address: string;
  city: string;
  postcode: string;
  latitude: number;
  longitude: number;
}

const CompleteProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userType, setUserType] = useState<UserType>('homeowner');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Provider-specific state — three-category model
  const [gcType, setGcType] = useState('');
  const [subType, setSubType] = useState('');
  const [profType, setProfType] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
  const [veteranData, setVeteranData] = useState<VeteranProfileData | null>(null);

  // Location state
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [zipCodeError, setZipCodeError] = useState<string | null>(null);

  // Check if profile is already complete — redirect if so
  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    const checkProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (roles.length > 0) {
        // Profile is complete, redirect to appropriate dashboard
        navigate(roles.includes('admin') ? '/admin' : roles.includes('provider') ? '/dashboard' : '/user-dashboard');
      } else {
        // Pre-fill name from Google profile if available
        if (profile?.full_name) {
          setFullName(profile.full_name);
        } else if (user.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }
        setProfileChecked(true);
      }
    };

    checkProfile();
  }, [user, authLoading, roleLoading, roles, navigate]);

  // Fetch categories for backend mapping
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('service_categories')
        .select('*')
        .order('name', { ascending: true });
      if (data) setServiceCategories(data);
    };
    fetchCategories();
  }, []);

  // Location search
  const searchLocation = async (query: string) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setLocationSuggestions(data || []);
      setShowLocationSuggestions(true);
    } catch {
      setLocationSuggestions([]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (locationQuery && !selectedLocation) searchLocation(locationQuery);
    }, 300);
    return () => clearTimeout(debounce);
  }, [locationQuery, selectedLocation]);

  const selectLocationSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const city = item.address?.city || item.address?.town || item.address?.village || '';
    let postcode = item.address?.postcode || '';

    if (postcode && isValidUSZipCode(postcode)) {
      postcode = formatUSZipCode(postcode);
      setZipCodeError(null);
    } else if (postcode) {
      setZipCodeError('Invalid US ZIP code format.');
    } else {
      setZipCodeError('No ZIP code found. Please search for a specific US ZIP code.');
    }

    setSelectedLocation({
      address: item.display_name,
      city,
      postcode: postcode && isValidUSZipCode(postcode) ? formatUSZipCode(postcode) : postcode,
      latitude: lat,
      longitude: lng,
    });
    setLocationQuery(item.display_name);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  // Derive combined selections whenever a category dropdown changes
  const allSelected = [gcType, subType, profType].filter(Boolean);

  const toggleSubcategory = (subcategoryName: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(subcategoryName)
        ? prev.filter(serviceName => serviceName !== subcategoryName)
        : [...prev, subcategoryName]
    );
  };

  // Determine primary service_type_key from selections
  const getPrimaryServiceTypeKey = () => {
    if (gcType) return 'general_contractor';
    if (subType) return 'subcontractor';
    if (profType) return 'professional';
    return 'service_provider';
  };

  const getPrimaryServiceTypeLabel = () => gcType || subType || profType || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName || fullName.trim().length < 2) {
      toast({ title: 'Name required', description: 'Please enter your full name.', variant: 'destructive' });
      return;
    }

    if (userType === 'provider') {
      if (!companyName || companyName.trim().length < 2) {
        toast({ title: 'Company name required', description: 'Please enter your company name.', variant: 'destructive' });
        return;
      }
      if (allSelected.length === 0) {
        toast({ title: 'Category required', description: 'Please select at least one category type.', variant: 'destructive' });
        return;
      }
      if (!selectedLocation || !selectedLocation.postcode || !isValidUSZipCode(selectedLocation.postcode)) {
        toast({ title: 'ZIP code required', description: 'Please select a valid US ZIP code.', variant: 'destructive' });
        return;
      }
    }

    if (!acceptedTerms) {
      toast({ title: 'Terms required', description: 'Please accept the Terms of Service and Privacy Policy.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      // Update profile
      const displayName = userType === 'provider' ? companyName : fullName;
      await supabase
        .from('profiles')
        .update({ full_name: displayName })
        .eq('id', user.id);

      if (userType === 'provider') {
        // Save service_type_key + label to profile
        await (supabase.from('profiles').update({
          service_type_key: getPrimaryServiceTypeKey(),
          service_type_label: getPrimaryServiceTypeLabel(),
        } as any).eq('id', user.id));

        // Map all three selections to category IDs
        const { categoryIds, missingServices } = mapServicesToCategoryIds(allSelected, serviceCategories);

        if (missingServices.length > 0) {
          toast({
            title: 'Service mapping error',
            description: 'Some selected services are currently unavailable. Please reselect and try again.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const serviceInserts = categoryIds.map(categoryId => ({
          provider_id: user.id,
          category_id: categoryId,
        }));
        await supabase.from('provider_services').insert(serviceInserts);

        // Add location
        if (selectedLocation) {
          await supabase.from('provider_locations').insert({
            provider_id: user.id,
            address: selectedLocation.address,
            city: selectedLocation.city,
            postcode: selectedLocation.postcode,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            is_primary: true,
          });
        }

        // Veteran profile — fire-and-forget
        if (veteranData?.isVeteran && veteranData.branch) {
          (supabase.from('veteran_profiles' as any).upsert({
            user_id: user.id,
            branch: veteranData.branch,
            rank_grade: veteranData.rankGrade || null,
            rank_title: (veteranData as any).rankTitle || null,
            years_of_service: veteranData.yearsOfService || null,
            service_eras: veteranData.serviceEras,
            specialty_code: veteranData.specialtyCode || null,
            specialty_title: veteranData.specialtyTitle || null,
            unit_type: veteranData.unitType || null,
            last_duty_station: veteranData.lastDutyStation || null,
            last_unit: veteranData.lastUnit || null,
            clearance_level: veteranData.clearanceLevel || 'none',
            va_disability_rating: veteranData.vaDisabilityRating ?? null,
            discharge_type: veteranData.dischargeType || 'honorable',
            is_sdvosb: veteranData.isSdvosb,
            is_vosb: veteranData.isVosb,
            open_to_veteran_network: veteranData.openToVeteranNetwork,
            additional_notes: veteranData.additionalNotes || null,
            subscription_credit_months: 3,
          } as any, { onConflict: 'user_id' }) as any).catch(() => {});
          supabase.from('profiles').update({ is_veteran: true, veteran_branch: veteranData.branch } as any).eq('id', user.id).catch(() => {});
        }

        // Welcome email
        supabase.functions.invoke('send-provider-welcome-notification', {
          body: { userId: user.id },
        }).catch(err => console.error('Welcome email error:', err));

        toast({ title: 'Profile submitted', description: 'Your provider profile is pending review. Redirecting to your dashboard...' });
        navigate('/user-dashboard');
      } else {
        // Homeowner — no role needed (default user)
        supabase.functions.invoke('send-homeowner-welcome-notification', {
          body: { userId: user.id },
        }).catch(err => console.error('Welcome email error:', err));

        toast({ title: 'Profile complete!', description: 'Redirecting to your dashboard...' });
        navigate('/user-dashboard');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || roleLoading || !profileChecked) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(220,13%,18%)] flex flex-col">
      <SEOHead title="Set Up Your Profile | Kluje" description="Add your business details, location, and services to complete your Kluje profile and start receiving job leads from customers." noIndex={true} />
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-10">
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground text-sm">
              Just a few more details to get you started on Kluje.
            </p>
          </div>

          <Tabs value={userType} onValueChange={(v) => setUserType(v as UserType)} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="homeowner" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Homeowner
              </TabsTrigger>
              <TabsTrigger value="provider" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Provider
              </TabsTrigger>
            </TabsList>
            <TabsContent value="homeowner" className="mt-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                <strong className="text-foreground">For homeowners:</strong> Post jobs, receive quotes, and hire trusted local professionals.
              </div>
            </TabsContent>
            <TabsContent value="provider" className="mt-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                <strong className="text-foreground">For service providers:</strong> Browse jobs, submit quotes, and grow your business.
              </div>
            </TabsContent>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {userType === 'provider' ? 'Your full name as the business contact person.' : 'Your name as it will appear on your account.'}
              </p>
            </div>

            {userType === 'provider' && (
              <>
                <div>
                  <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Type your LLC Name"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be displayed on your public profile and quotes.
                  </p>
                </div>

                {/* ── Three-category selector ── */}
                <div className="space-y-3">
                  <div>
                    <Label>Select Your Main Category <span className="text-destructive">*</span></Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Choose your type in any category that applies — select one, two, or all three.
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
                        {GC_OPTIONS.map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
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
                        {SUB_OPTIONS.map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
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
                        {PROFESSIONAL_OPTIONS.map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selected summary badges */}
                  {allSelected.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {gcType && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <HardHat className="w-3 h-3" /> {gcType}
                          <button type="button" onClick={() => setGcType('')} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                        </Badge>
                      )}
                      {subType && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Wrench className="w-3 h-3" /> {subType}
                          <button type="button" onClick={() => setSubType('')} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                        </Badge>
                      )}
                      {profType && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Scale className="w-3 h-3" /> {profType}
                          <button type="button" onClick={() => setProfType('')} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Location field */}
                <div className="relative">
                  <Label htmlFor="cp-location">Service Area ZIP Code <span className="text-destructive">*</span></Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="cp-location"
                      type="text"
                      value={locationQuery}
                      onChange={(e) => {
                        setLocationQuery(e.target.value);
                        if (selectedLocation) setSelectedLocation(null);
                      }}
                      placeholder="Enter your ZIP code (e.g., 90210)"
                      className="pl-9 pr-8"
                    />
                    {isSearchingLocation && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                    {selectedLocation && !isSearchingLocation && (
                      <button
                        type="button"
                        onClick={() => { setSelectedLocation(null); setLocationQuery(''); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >×</button>
                    )}
                  </div>

                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                          onClick={() => selectLocationSuggestion(suggestion)}
                        >
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{suggestion.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedLocation && !zipCodeError && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Location set: {selectedLocation.postcode || selectedLocation.city || 'Selected'}
                    </p>
                  )}
                  {zipCodeError && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {zipCodeError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a US ZIP code to set your primary service area
                  </p>
                </div>
              </>
            )}


            {/* Veteran program — shown for all user types */}
            <VeteranProfileSection
              mode="full"
              onChange={(data) => setVeteranData(data.isVeteran ? data : null)}
            />

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="cp-terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="cp-terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                I agree to the{' '}
                <a href="/terms" className="text-primary hover:underline" target="_blank">Terms of Service</a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy</a>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !acceptedTerms}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
