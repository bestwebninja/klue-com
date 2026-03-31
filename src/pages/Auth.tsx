import { useState, useEffect } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfileComplete } from '@/hooks/useProfileComplete';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { providerServiceTaxonomy } from '@/lib/providerServiceTaxonomy';
import { ZipCodeAutocomplete } from '@/components/auth/ZipCodeAutocomplete';
import { resolveZipLocation, syncZipIntelligence } from '@/lib/onboardingIntelligence';
import { z } from 'zod';
import { Briefcase, Home, Loader2, Mail, CheckCircle, ArrowLeft, KeyRound, Eye, EyeOff, AlertCircle, ArrowRight, User, Building2, Lock, ChevronsUpDown, X, HardHat, Wrench } from 'lucide-react';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';


const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?\":{}|<>]/, 'Password must contain at least one special character');

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type UserType = 'provider' | 'homeowner';
type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-sent' | 'verification-pending' | 'email-not-verified';
type SignupStep = 'select-type' | 'details' | 'create-account';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as UserType | null;
  
  const [userType, setUserType] = useState<UserType>(initialType || 'homeowner');
  const [authView, setAuthView] = useState<AuthView>(initialType === 'provider' ? 'signup' : 'login');
  const [signupStep, setSignupStep] = useState<SignupStep>(initialType ? 'details' : 'select-type');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [county, setCounty] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [signupsRestricted, setSignupsRestricted] = useState(false);
  const [contractorType, setContractorType] = useState<'general' | 'sub' | ''>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isServicePickerOpen, setIsServicePickerOpen] = useState(false);
  
  
  // Check signup restriction on mount
  useEffect(() => {
    (supabase
      .from('site_settings' as any)
      .select('value')
      .eq('key', 'signups_restricted')
      .single() as any)
      .then(({ data }: any) => {
        if (data?.value === true) setSignupsRestricted(true);
      });
  }, []);

  const { signIn, signUp, user } = useAuth();
  const { isProvider, isAdmin, loading: roleLoading } = useUserRole();
  const { isComplete: profileComplete, loading: profileLoading } = useProfileComplete();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Role-based redirect after login
  useEffect(() => {
    if (user && !roleLoading && !profileLoading) {
      if (profileComplete === false) {
        navigate('/complete-profile');
        return;
      }

      const redirectTo = searchParams.get('redirect');
      
      if (redirectTo) {
        toast({ title: 'Welcome back!', description: 'Returning you to where you left off...' });
        navigate(redirectTo);
      } else if (isAdmin) {
        toast({ title: 'Welcome back, Admin!', description: 'Redirecting to your dashboard...' });
        navigate('/dashboard');
      } else if (isProvider) {
        // Check if provider needs to finish setup (no services selected yet)
        checkProviderSetup();
      } else {
        // Homeowner: check if first login → prompt to post a job
        checkHomeownerFirstLogin();
      }
    }
  }, [user, roleLoading, profileLoading, profileComplete, isProvider, isAdmin, navigate, toast, searchParams]);

  const checkProviderSetup = async () => {
    if (!user) return;
    const { data: services } = await supabase
      .from('provider_services')
      .select('id')
      .eq('provider_id', user.id)
      .limit(1);
    
    if (!services || services.length === 0) {
      toast({ title: 'Welcome!', description: 'Let\'s finish setting up your profile.' });
      navigate('/dashboard?setup=true');
    } else {
      toast({ title: 'Welcome back!', description: 'Redirecting to your dashboard...' });
      navigate('/dashboard');
    }
  };

  const checkHomeownerFirstLogin = async () => {
    if (!user) return;
    const { data: jobs } = await supabase
      .from('job_listings')
      .select('id')
      .eq('posted_by', user.id)
      .limit(1);
    
    if (!jobs || jobs.length === 0) {
      toast({ title: 'Welcome to Kluje!', description: 'Post your first job to get quotes from local professionals.' });
      navigate('/post-job');
    } else {
      toast({ title: 'Welcome back!', description: 'Redirecting to your dashboard...' });
      navigate('/my-dashboard');
    }
  };

  const toggleService = (name: string) => {
    setSelectedServices(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  };

  const handleSelectType = (type: UserType) => {
    setUserType(type);
    setSignupStep('details');
  };

  const handleDetailsNext = () => {
    if (userType === 'homeowner') {
      if (!fullName || fullName.trim().length < 2) {
        toast({ title: 'Name required', description: 'Please enter your full name (at least 2 characters).', variant: 'destructive' });
        return;
      }
    } else {
      if (!firstName || firstName.trim().length < 2 || !lastName || lastName.trim().length < 2) {
        toast({ title: 'Name required', description: 'Please enter your first and last name.', variant: 'destructive' });
        return;
      }
      if (!companyName || companyName.trim().length < 2) {
        toast({ title: 'Company name required', description: 'Please enter your company name (at least 2 characters).', variant: 'destructive' });
        return;
      }
      if (zipCode.length !== 5) {
        toast({ title: 'ZIP code required', description: 'Please select a valid 5-digit ZIP code.', variant: 'destructive' });
        return;
      }
      if (!contractorType) {
        toast({ title: 'Contractor type required', description: 'Please select whether you are a General Contractor or Sub Contractor.', variant: 'destructive' });
        return;
      }
      if (selectedServices.length === 0) {
        toast({ title: 'Services required', description: 'Please select at least one service you offer.', variant: 'destructive' });
        return;
      }
    }

    if (!email) {
      toast({ title: 'Email required', description: 'Please enter your email address.', variant: 'destructive' });
      return;
    }

    try {
      emailSchema.parse({ email });
    } catch {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setSignupStep('create-account');
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // If signups are restricted, log the attempt and notify admin
    if (signupsRestricted) {
      supabase.functions.invoke('notify-signup-attempt', {
        body: { email, userType },
      }).catch(() => {
        // Fire-and-forget; also insert directly as fallback
        (supabase.from('signup_attempts' as any).insert({ email, user_type: userType } as any) as any).catch(() => {});
      });
      toast({
        title: 'Signups temporarily paused',
        description: 'We\'re finalising the platform. We\'ve noted your interest and will be in touch!',
      });
      setIsLoading(false);
      return;
    }

    try {
      // Validate password
      passwordSchema.parse(password);

      if (!acceptedTerms) {
        toast({ title: 'Terms required', description: 'Please accept the terms and privacy policy.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const displayName = userType === 'provider' ? companyName : fullName;
      const extraMeta = userType === 'provider' ? {
        user_type: 'provider',
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        company_name: companyName.trim(),
        contractor_type: contractorType,
        selected_services: selectedServices,
        zip_code: zipCode,
        city,
        state,
        county,
        latitude,
        longitude,
      } : {};
      const { error, data } = await signUp(email, password, displayName, extraMeta);
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast({ title: 'Account exists', description: 'This email is already registered. Please login instead.', variant: 'destructive' });
        } else {
          toast({ title: 'Signup failed', description: error.message, variant: 'destructive' });
        }
      } else {

        // Newsletter consent — subscribe silently
        if (newsletterConsent && data?.user) {
          (supabase.from('newsletter_subscribers' as any).insert({
            email: email.trim().toLowerCase(),
            name: userType === 'provider' ? companyName : fullName,
            consent_marketing: true,
            source: 'signup_form',
          } as any) as any).catch(() => {});
        }

        if (userType === 'provider' && data?.user) {
          const normalizedProfile = {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            company_name: companyName.trim(),
            services_offered: selectedServices,
            zip_code: zipCode,
            city: city || null,
            state: state || null,
            county: county || null,
            latitude,
            longitude,
          };

          await supabase.from('profiles').update(normalizedProfile as any).eq('id', data.user.id);
          await supabase.from('provider_services').insert(
            selectedServices.map((service) => ({ provider_id: data.user.id, custom_name: service })),
          );
          await supabase.from('dashboard_bootstraps').upsert({
            user_id: data.user.id,
            role_key: contractorType === 'general' ? 'general-contractor' : 'subcontractor',
            template_key: selectedServices[0]?.toLowerCase() || 'general-contractor',
            profile_snapshot: normalizedProfile,
            widget_config: [],
          } as any);
          syncZipIntelligence(zipCode).catch(() => null);

          // Assign provider role
          await supabase.from('user_roles').insert({ user_id: data.user.id, role: 'provider' as any });

          // Send welcome email
          supabase.functions.invoke('send-provider-welcome-notification', {
            body: { userId: data.user.id }
          }).catch(err => console.error('Failed to send provider welcome email:', err));
        } else if (data?.user) {
          // Send homeowner welcome email
          supabase.functions.invoke('send-homeowner-welcome-notification', {
            body: { userId: data.user.id }
          }).catch(err => console.error('Failed to send homeowner welcome email:', err));
        }
        
        setVerifiedEmail(email);
        setAuthView('verification-pending');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: 'Validation error', description: error.errors[0].message, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      z.object({ email: z.string().email('Invalid email address') }).parse({ email });

      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Email not confirmed') || error.message.includes('email not confirmed')) {
          setVerifiedEmail(email);
          setAuthView('email-not-verified');
        } else {
          toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: 'Validation error', description: error.errors[0].message, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse({ email });
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        setVerifiedEmail(email);
        setAuthView('reset-sent');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: 'Validation error', description: error.errors[0].message, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: verifiedEmail,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      
      if (error) {
        toast({ title: 'Failed to resend', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Email sent!', description: 'A new verification email has been sent to your inbox.' });
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Special views (email-not-verified, verification-pending, reset-sent, forgot-password) ──

  if (authView === 'email-not-verified') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border text-center max-w-md">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Email not verified</h1>
            <p className="text-muted-foreground mb-6">
              Your account <span className="font-medium text-foreground">{verifiedEmail}</span> hasn't been verified yet.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Check your inbox</p>
                  <p>Look for a verification email from Kluje. Don't forget to check your spam/junk folder.</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Button className="w-full" onClick={async () => {
                setIsLoading(true);
                try {
                  const { error } = await supabase.auth.resend({
                    type: 'signup', email: verifiedEmail,
                    options: { emailRedirectTo: `${window.location.origin}/` },
                  });
                  toast(error
                    ? { title: 'Failed to resend', description: error.message, variant: 'destructive' as const }
                    : { title: 'Verification email sent!', description: 'Please check your inbox and click the verification link.' }
                  );
                } catch { toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' }); }
                finally { setIsLoading(false); }
              }} disabled={isLoading}>
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Mail className="w-4 h-4 mr-2" />Resend verification email</>}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => { setAuthView('login'); setEmail(verifiedEmail); }}>
                <ArrowLeft className="w-4 h-4 mr-2" />Back to sign in
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authView === 'verification-pending') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border text-center max-w-md">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Verify your email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a verification link to <span className="font-medium text-foreground">{verifiedEmail}</span>
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">What's next?</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the verification link in the email</li>
                    <li>Come back here and sign in</li>
                    {userType === 'provider' && <li className="font-medium text-foreground">Complete your profile setup</li>}
                    {userType === 'homeowner' && <li className="font-medium text-foreground">Post your first job!</li>}
                  </ol>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={handleResendVerification} disabled={isLoading}>
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : 'Resend verification email'}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setAuthView('login')}>Back to sign in</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authView === 'reset-sent') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border text-center max-w-md">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to <span className="font-medium text-foreground">{verifiedEmail}</span>
            </p>
            <Button variant="ghost" className="w-full" onClick={() => setAuthView('login')}>
              <ArrowLeft className="w-4 h-4 mr-2" />Back to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (authView === 'forgot-password') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Forgot password?</h1>
              <p className="text-muted-foreground text-sm">No worries, we'll send you reset instructions.</p>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : 'Send reset link'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button type="button" onClick={() => setAuthView('login')} className="text-primary hover:underline text-sm inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state after login
  if (user && (roleLoading || profileLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Preparing your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── SIGNUP FLOW ──
  if (authView === 'signup') {
    return (
      <div className="min-h-screen bg-[hsl(220,13%,18%)] flex flex-col">
        <SEOHead title="Create Account | Kluje" description="Sign up as a homeowner or service provider on Kluje." noIndex={true} />
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-8">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border max-w-md w-full">
            
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {['select-type', 'details', 'create-account'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    signupStep === step 
                      ? 'bg-primary text-primary-foreground' 
                      : ['select-type', 'details', 'create-account'].indexOf(signupStep) > i
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {['select-type', 'details', 'create-account'].indexOf(signupStep) > i ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < 2 && <div className={`w-8 h-0.5 ${['select-type', 'details', 'create-account'].indexOf(signupStep) > i ? 'bg-primary/40' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>

            {/* ── Step 1: Select Type ── */}
            {signupStep === 'select-type' && (
              <>
                <div className="text-center mb-6">
                  <Link to="/" className="inline-block mb-4">
                    <span className="text-2xl font-bold text-primary">Kluje</span>
                  </Link>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Get Started</h1>
                  <p className="text-muted-foreground text-sm">How would you like to use Kluje?</p>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => handleSelectType('homeowner')}
                    className="w-full p-6 rounded-xl border-2 border-border hover:border-primary bg-background hover:bg-primary/5 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Home className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1">I'm a Homeowner</h3>
                        <p className="text-sm text-muted-foreground">Post jobs, receive quotes, and hire trusted local professionals.</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectType('provider')}
                    className="w-full p-6 rounded-xl border-2 border-border hover:border-primary bg-background hover:bg-primary/5 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1">I'm a Service Provider</h3>
                        <p className="text-sm text-muted-foreground">Browse jobs, submit quotes, and grow your business.</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button type="button" onClick={() => setAuthView('login')} className="text-primary hover:underline text-sm">
                    Already have an account? Sign in
                  </button>
                </div>
              </>
            )}

            {/* ── Step 2: Basic Details ── */}
            {signupStep === 'details' && (
              <>
                <div className="text-center mb-6">
                  <Link to="/" className="inline-block mb-3">
                    <span className="text-2xl font-bold text-primary">Kluje</span>
                  </Link>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                    {userType === 'homeowner' ? <Home className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                    {userType === 'homeowner' ? 'Homeowner' : 'Service Provider'}
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">Your Details</h1>
                  <p className="text-muted-foreground text-sm">
                    {userType === 'homeowner' ? 'Tell us about yourself' : 'Tell us about your business'}
                  </p>
                </div>

                <div className="space-y-4">
                  {userType === 'homeowner' ? (
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
                      <p className="text-xs text-muted-foreground mt-1">Your name as it will appear on your account.</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Smith"
                          required
                        />
                      </div>

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
                        <p className="text-xs text-muted-foreground mt-1">This will be displayed on your public profile and quotes.</p>
                      </div>

                      <div>
                        <Label htmlFor="zipCode">ZIP Code <span className="text-destructive">*</span></Label>
                        <ZipCodeAutocomplete
                          value={zipCode}
                          onChange={async (value, suggestion) => {
                            setZipCode(value);
                            if (suggestion) {
                              setCity(suggestion.city);
                              setState(suggestion.state);
                            }
                            if (value.length === 5) {
                              const location = await resolveZipLocation(value);
                              setCity(location.city || suggestion?.city || '');
                              setState(location.state || suggestion?.state || '');
                              setCounty(location.county || '');
                              setLatitude(location.latitude ?? null);
                              setLongitude(location.longitude ?? null);
                            }
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Autocomplete with normalized city/state intelligence.</p>
                      </div>

                      {/* Contractor Type */}
                      <div>
                        <Label>Contractor Type <span className="text-destructive">*</span></Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => setContractorType('general')}
                            className={cn(
                              'p-4 rounded-xl border-2 text-left transition-all duration-200',
                              contractorType === 'general'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 bg-background'
                            )}
                          >
                            <HardHat className={cn('w-5 h-5 mb-1', contractorType === 'general' ? 'text-primary' : 'text-muted-foreground')} />
                            <p className="text-sm font-semibold text-foreground">General Contractor</p>
                            <p className="text-[11px] text-muted-foreground">I manage projects &amp; hire subs</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setContractorType('sub')}
                            className={cn(
                              'p-4 rounded-xl border-2 text-left transition-all duration-200',
                              contractorType === 'sub'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 bg-background'
                            )}
                          >
                            <Wrench className={cn('w-5 h-5 mb-1', contractorType === 'sub' ? 'text-primary' : 'text-muted-foreground')} />
                            <p className="text-sm font-semibold text-foreground">Sub Contractor</p>
                            <p className="text-[11px] text-muted-foreground">I specialize in a trade</p>
                          </button>
                        </div>
                      </div>

                      {/* Service Picker */}
                      <div>
                        <Label>Services Offered <span className="text-destructive">*</span></Label>
                        <Popover open={isServicePickerOpen} onOpenChange={setIsServicePickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={isServicePickerOpen}
                              className="mt-1 w-full justify-between font-normal"
                            >
                              {selectedServices.length > 0
                                ? `${selectedServices.length} service${selectedServices.length === 1 ? '' : 's'} selected`
                                : 'Search and select services'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search services..." />
                              <CommandList>
                                <CommandEmpty>No service found.</CommandEmpty>
                                {providerServiceTaxonomy.map((group) => (
                                  <CommandGroup key={group.category} heading={group.category}>
                                    {group.subcategories.map((sub) => {
                                      const isSelected = selectedServices.includes(sub);
                                      return (
                                        <CommandItem
                                          key={sub}
                                          value={`${group.category} ${sub}`}
                                          onSelect={() => toggleService(sub)}
                                        >
                                          <CheckCircle className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                                          <span>{sub}</span>
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                ))}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {selectedServices.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {selectedServices.map((svc) => (
                              <Badge key={svc} variant="secondary" className="gap-1 text-xs">
                                {svc}
                                <button type="button" onClick={() => toggleService(svc)} className="rounded-full hover:text-foreground" aria-label={`Remove ${svc}`}>
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Select all services you provide.</p>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll send a verification link — you must verify your email before you can sign in.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSignupStep('select-type');
                      }}
                      className="flex-shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleDetailsNext}
                      className="flex-1"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button type="button" onClick={() => setAuthView('login')} className="text-primary hover:underline text-sm">
                    Already have an account? Sign in
                  </button>
                </div>
              </>
            )}

            {/* ── Step 3: Create Account (Password) ── */}
            {signupStep === 'create-account' && (
              <>
                <div className="text-center mb-6">
                  <Link to="/" className="inline-block mb-3">
                    <span className="text-2xl font-bold text-primary">Kluje</span>
                  </Link>
                  <h1 className="text-2xl font-bold text-foreground mb-1">Create Your Account</h1>
                  <p className="text-muted-foreground text-sm">Set a secure password to finish</p>
                </div>

                {/* Summary of verified details */}
                <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">
                      {userType === 'homeowner' ? fullName : companyName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{email}</span>
                  </div>
                </div>

                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div>
                    <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrengthIndicator password={password} />
                  </div>

                  {signupsRestricted && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                      <Lock className="w-4 h-4 mt-0.5 shrink-0 text-yellow-600" />
                      <span>New signups are temporarily paused. Submit anyway to register your interest — we'll notify you when we open.</span>
                    </div>
                  )}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                      I agree to the{' '}
                      <a href="/terms" className="text-primary hover:underline" target="_blank">Terms of Service</a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy</a>
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={newsletterConsent}
                      onCheckedChange={(checked) => setNewsletterConsent(checked === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="newsletter" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                      I authorise <strong>kluje.com</strong> to send me newsletter emails with tips, updates, and offers. I can unsubscribe anytime.
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setSignupStep('details')} className="flex-shrink-0">
                      <ArrowLeft className="w-4 h-4 mr-1" />Back
                    </Button>
                    <Button type="submit" className="flex-1" size="lg" disabled={isLoading || !acceptedTerms}>
                      {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : 'Create Account'}
                    </Button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <button type="button" onClick={() => setAuthView('login')} className="text-primary hover:underline text-sm">
                    Already have an account? Sign in
                  </button>
                </div>
              </>
            )}
          {/* Brand signature */}
          <div className="mt-6 pt-5 border-t border-border/30 text-center">
            <p className="font-signature text-3xl text-primary/70 select-none">Just Kluje it</p>
          </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LOGIN FLOW ──
  return (
    <div className="min-h-screen bg-[hsl(220,13%,18%)] flex flex-col">
      <SEOHead title="Sign In | Kluje" description="Log in to your Kluje account." noIndex={true} />
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border max-w-md w-full">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-primary">Kluje</span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password">Password</Label>
                <button type="button" onClick={() => setAuthView('forgot-password')} className="text-primary hover:underline text-xs">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Please wait...</> : 'Sign In'}
            </Button>
          </form>

          {/* Google OAuth */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              try {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: window.location.origin,
                  },
                });
                if (error) {
                  toast({ title: 'Google sign-in failed', description: error.message, variant: 'destructive' });
                }
              } catch (error: any) {
                toast({ title: 'Google sign-in failed', description: error?.message || 'Something went wrong.', variant: 'destructive' });
              } finally { setIsLoading(false); }
            }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>

          <div className="mt-6 text-center">
            <button type="button" onClick={() => { setAuthView('signup'); setSignupStep('select-type'); }} className="text-primary hover:underline text-sm">
              Don't have an account? Sign up
            </button>
          </div>

          {/* Brand signature */}
          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="font-signature text-3xl text-primary/70 select-none">Just Kluje it</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
