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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { Briefcase, Home, Loader2, MapPin, CheckCircle, AlertCircle, UserCircle } from 'lucide-react';

import { isValidUSZipCode, formatUSZipCode } from '@/lib/zipCodeValidation';

type UserType = 'provider' | 'homeowner';

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

  // Provider-specific state
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);

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

      if (profile?.phone && roles.length > 0) {
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

  // Fetch categories
  useEffect(() => {
    const fetchMainCategories = async () => {
      const { data } = await supabase
        .from('service_categories')
        .select('*')
        .is('parent_id', null)
        .order('name');
      if (data) setMainCategories(data);
    };
    fetchMainCategories();
  }, []);

  useEffect(() => {
    if (selectedMainCategory) {
      const fetchSubs = async () => {
        const { data } = await supabase
          .from('service_categories')
          .select('*')
          .eq('parent_id', selectedMainCategory)
          .order('name');
        if (data) setSubcategories(data);
      };
      fetchSubs();
      setSelectedSubcategories([]);
    } else {
      setSubcategories([]);
    }
  }, [selectedMainCategory]);

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

  const toggleSubcategory = (categoryId: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

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
      if (!selectedMainCategory) {
        toast({ title: 'Category required', description: 'Please select your main service category.', variant: 'destructive' });
        return;
      }
      if (selectedSubcategories.length === 0) {
        toast({ title: 'Service required', description: 'Please select at least one service.', variant: 'destructive' });
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
        // Assign provider role
        await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'provider' as any });

        // Add services
        const serviceInserts = selectedSubcategories.map(categoryId => ({
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

        // Welcome email
        supabase.functions.invoke('send-provider-welcome-notification', {
          body: { userId: user.id },
        }).catch(err => console.error('Welcome email error:', err));

        toast({ title: 'Profile complete!', description: 'Redirecting to your provider dashboard...' });
        navigate('/dashboard');
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
                    placeholder="Smith Plumbing Ltd"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be displayed on your public profile and quotes.
                  </p>
                </div>

                <div>
                  <Label htmlFor="mainCategory">Main Service Category <span className="text-destructive">*</span></Label>
                  <Select value={selectedMainCategory} onValueChange={setSelectedMainCategory}>
                    <SelectTrigger id="mainCategory">
                      <SelectValue placeholder="Select your main category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose the category that best describes your primary trade.
                  </p>
                </div>

                {selectedMainCategory && subcategories.length > 0 && (
                  <div>
                    <Label>Services Offered <span className="text-destructive">*</span> (select all that apply)</Label>
                    <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
                      {subcategories.map((cat) => (
                        <div key={cat.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cp-service-${cat.id}`}
                            checked={selectedSubcategories.includes(cat.id)}
                            onCheckedChange={() => toggleSubcategory(cat.id)}
                          />
                          <label htmlFor={`cp-service-${cat.id}`} className="text-sm cursor-pointer text-foreground">
                            {cat.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedSubcategories.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedSubcategories.length} service{selectedSubcategories.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                )}

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
              disabled={isLoading || !verifiedPhone || !acceptedTerms}
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
