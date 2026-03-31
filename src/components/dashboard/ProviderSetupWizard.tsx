import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LocationPicker } from '@/components/LocationPicker';
import { mapServicesToCategoryIds } from '@/lib/providerServiceTaxonomy';
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
} from 'lucide-react';
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
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
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
    if (selectedSubcategories.length === 0) {
      toast({ title: 'Services required', description: 'Please select at least one service.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    const insertData = selectedSubcategories.map(categoryId => ({
      provider_id: userId,
      category_id: categoryId,
      custom_name: subCategories.find(c => c.id === categoryId)?.name || '',
    }));

    const { error } = await supabase.from('provider_services').insert(insertData);
    setIsLoading(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save services.', variant: 'destructive' });
    } else {
      setStep('location');
    }
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

        {/* Step 2: Services */}
        {step === 'services' && (
          <div className="space-y-4 max-w-lg mx-auto">
            <div>
              <Label>Main Service Category <span className="text-destructive">*</span></Label>
              <Select value={selectedMainCategory} onValueChange={(v) => { setSelectedMainCategory(v); setSelectedSubcategories([]); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your main category" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMainCategory && subCategories.length > 0 && (
              <div>
                <Label>Services Offered <span className="text-destructive">*</span> (select all that apply)</Label>
                <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3 space-y-2 bg-background">
                  {subCategories.map(cat => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`setup-svc-${cat.id}`}
                        checked={selectedSubcategories.includes(cat.id)}
                        onCheckedChange={() => toggleSubcategory(cat.id)}
                      />
                      <label htmlFor={`setup-svc-${cat.id}`} className="text-sm cursor-pointer text-foreground">
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

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('profile')}>
                <ArrowLeft className="w-4 h-4 mr-1" />Back
              </Button>
              <Button onClick={handleSaveServices} className="flex-1" disabled={isLoading || selectedSubcategories.length === 0}>
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
