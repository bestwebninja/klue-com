import { useState, useEffect, useRef } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { LocationPicker } from '@/components/LocationPicker';
import { StaticLocationMap } from '@/components/StaticLocationMap';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import heroPostJob from '@/assets/hero-post-job.jpg';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Briefcase, 
  Clock, 
  MapPin, 
  Loader2, 
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Sparkles
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type JobListing = Database['public']['Tables']['job_listings']['Row'];
type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];
type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

const PostJob = () => {
  const { user, loading: authLoading } = useAuth();
  const { isProvider, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [myJobs, setMyJobs] = useState<JobListing[]>([]);
  const [quotes, setQuotes] = useState<Record<string, QuoteRequest[]>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Redirect providers away - they cannot post jobs
  useEffect(() => {
    if (!roleLoading && isProvider) {
      toast({
        title: 'Access denied',
        description: 'Service providers cannot post jobs. Please use your provider dashboard.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [isProvider, roleLoading, navigate, toast]);

  // Common US locations with ZIP code areas
  const usLocations = [
    { name: 'New York', zipCode: '10001' },
    { name: 'Los Angeles', zipCode: '90001' },
    { name: 'Chicago', zipCode: '60601' },
    { name: 'Houston', zipCode: '77001' },
    { name: 'Phoenix', zipCode: '85001' },
    { name: 'Philadelphia', zipCode: '19101' },
    { name: 'San Antonio', zipCode: '78201' },
    { name: 'San Diego', zipCode: '92101' },
    { name: 'Dallas', zipCode: '75201' },
    { name: 'San Jose', zipCode: '95101' },
    { name: 'Austin', zipCode: '78701' },
    { name: 'Jacksonville', zipCode: '32099' },
    { name: 'San Francisco', zipCode: '94101' },
    { name: 'Columbus', zipCode: '43085' },
    { name: 'Indianapolis', zipCode: '46201' },
    { name: 'Charlotte', zipCode: '28201' },
    { name: 'Seattle', zipCode: '98101' },
    { name: 'Denver', zipCode: '80201' },
    { name: 'Washington DC', zipCode: '20001' },
    { name: 'Nashville', zipCode: '37201' },
    { name: 'Boston', zipCode: '02101' },
    { name: 'Las Vegas', zipCode: '89101' },
    { name: 'Portland', zipCode: '97201' },
    { name: 'Miami', zipCode: '33101' },
    { name: 'Atlanta', zipCode: '30301' },
    { name: 'Minneapolis', zipCode: '55401' },
    { name: 'Tampa', zipCode: '33601' },
    { name: 'Orlando', zipCode: '32801' },
    { name: 'Detroit', zipCode: '48201' },
    { name: 'Pittsburgh', zipCode: '15201' },
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    main_category_id: '',
    category_id: '',
    location: '',
    budget_min: '',
    budget_max: '',
  });

  // Derived category lists for hierarchical selection
  const mainCategories = categories.filter(c => !c.parent_id);
  const subCategories = categories.filter(c => c.parent_id === formData.main_category_id);

  useEffect(() => {
    fetchCategories();
    if (user) {
      fetchMyJobs();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  };

  const fetchMyJobs = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('job_listings')
      .select('*')
      .eq('posted_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      setMyJobs(data || []);
      // Fetch quotes for each job
      if (data && data.length > 0) {
        fetchQuotesForJobs(data.map(j => j.id));
      }
    }
    setLoading(false);
  };

  const fetchQuotesForJobs = async (jobIds: string[]) => {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .in('job_listing_id', jobIds)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch profiles for providers
      const providerIds = [...new Set(data.map(q => q.provider_id))];
      let profilesMap: Record<string, any> = {};
      
      if (providerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', providerIds);
        
        if (profilesData) {
          profilesMap = Object.fromEntries(profilesData.map(p => [p.id, p]));
        }
      }
      
      const grouped: Record<string, QuoteRequest[]> = {};
      data.forEach((quote) => {
        const jobId = quote.job_listing_id as string;
        if (!grouped[jobId]) grouped[jobId] = [];
        grouped[jobId].push({
          ...quote,
          profiles: profilesMap[quote.provider_id] || null,
        } as QuoteRequest);
      });
      setQuotes(grouped);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to post a job.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title and description.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Geocode the location if provided
      let latitude: number | null = null;
      let longitude: number | null = null;
      
      if (formData.location.trim()) {
        try {
          const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('geocode-location', {
            body: { location: formData.location.trim() }
          });
          
          if (!geocodeError && geocodeData?.success) {
            latitude = geocodeData.latitude;
            longitude = geocodeData.longitude;
          }
        } catch (geoError) {
          console.error('Geocoding failed, continuing without coordinates:', geoError);
        }
      }

      const { data: newJob, error } = await supabase.from('job_listings').insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id || null,
        location: formData.location.trim() || null,
        latitude,
        longitude,
        budget_min: formData.budget_min ? Number(formData.budget_min) : null,
        budget_max: formData.budget_max ? Number(formData.budget_max) : null,
        posted_by: user.id,
      }).select('id').single();

      if (error) throw error;

      // Send thank-you email notification to the job poster
      if (newJob?.id) {
        supabase.functions.invoke('send-job-posted-notification', {
          body: { jobId: newJob.id, userId: user.id }
        }).catch(err => console.error('Failed to send job posted notification:', err));

        // Send job lead notifications to matching providers
        supabase.functions.invoke('send-job-lead-notifications', {
          body: { jobId: newJob.id, maxDistance: 50 }
        }).catch(err => console.error('Failed to send job lead notifications:', err));
      }

      toast({ title: 'Job posted successfully!' });
      setFormData({
        title: '',
        description: '',
        main_category_id: '',
        category_id: '',
        location: '',
        budget_min: '',
        budget_max: '',
      });
      setIsDialogOpen(false);
      fetchMyJobs();
    } catch (error: any) {
      toast({
        title: 'Error posting job',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: string) => {
    const { error } = await supabase
      .from('job_listings')
      .update({ status })
      .eq('id', jobId);

    if (error) {
      toast({
        title: 'Error updating job',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: `Job marked as ${status}` });
      fetchMyJobs();
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a job title first to generate a description.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const categoryName = categories.find(c => c.id === formData.category_id)?.name;
      
      const { data, error } = await supabase.functions.invoke('generate-job-description', {
        body: {
          title: formData.title,
          category: categoryName,
          location: formData.location,
          budgetMin: formData.budget_min,
          budgetMax: formData.budget_max,
        },
      });

      if (error) throw error;

      if (data?.description) {
        setFormData(p => ({ ...p, description: data.description }));
        toast({ title: 'Description generated!' });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error generating description:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Could not generate description. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
    if (min) return `From £${min.toLocaleString()}`;
    return `Up to £${max?.toLocaleString()}`;
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    return category?.name;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Post a Job for Free & Get Quotes | Kluje" description="Describe your project in minutes and get up to 3 quotes from qualified service providers. Completely free to post with no obligation to hire." pageType="post-job" />
      <Navbar />

      <PageHero
        backgroundImage={heroPostJob}
        title="Post a Job"
        description="Describe your project and receive quotes from qualified professionals"
        variant="compact"
      >
        {user && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Post a New Job</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="main_category">Main Category *</Label>
                  <select
                    id="main_category"
                    value={formData.main_category_id}
                    onChange={(e) => setFormData(p => ({ ...p, main_category_id: e.target.value, category_id: '' }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Select a main category</option>
                    {mainCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                {formData.main_category_id && subCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="sub_category">Service Type *</Label>
                    <select
                      id="sub_category"
                      value={formData.category_id}
                      onChange={(e) => setFormData(p => ({ ...p, category_id: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select a service type</option>
                      {subCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2 relative">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    ref={titleInputRef}
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(p => ({ ...p, title: e.target.value }));
                      setShowTitleSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowTitleSuggestions(formData.title.length > 0 || true)}
                    onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 150)}
                    placeholder="e.g., Kitchen Renovation"
                    maxLength={100}
                    autoComplete="off"
                  />
                  {/* Title suggestions dropdown */}
                  {showTitleSuggestions && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {categories
                        .filter(cat => 
                          formData.title.length === 0 || 
                          cat.name.toLowerCase().includes(formData.title.toLowerCase())
                        )
                        .slice(0, 8)
                        .map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setFormData(p => ({ ...p, title: cat.name, category_id: cat.id }));
                              setShowTitleSuggestions(false);
                            }}
                          >
                            {cat.name}
                          </button>
                        ))}
                      {formData.title.length > 0 && !categories.some(cat => 
                        cat.name.toLowerCase() === formData.title.toLowerCase()
                      ) && (
                        <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
                          Press Enter to use custom title
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateDescription}
                      disabled={isGeneratingDescription || !formData.title.trim()}
                      className="text-xs h-7 gap-1.5"
                    >
                      {isGeneratingDescription ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the work you need done..."
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <LocationPicker
                    placeholder="Search for job location..."
                    onLocationSelect={(location) => {
                      setFormData(p => ({ 
                        ...p, 
                        location: location.city ? `${location.city}, ${location.postcode}` : location.address 
                      }));
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget_min">Min Budget ($)</Label>
                    <Input
                      id="budget_min"
                      type="number"
                      value={formData.budget_min}
                      onChange={(e) => setFormData(p => ({ ...p, budget_min: e.target.value }))}
                      placeholder="0"
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget_max">Max Budget ($)</Label>
                    <Input
                      id="budget_max"
                      type="number"
                      value={formData.budget_max}
                      onChange={(e) => setFormData(p => ({ ...p, budget_max: e.target.value }))}
                      placeholder="0"
                      min={0}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Job'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </PageHero>

      {/* Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {!user ? (
            <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Sign in to post a job
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create an account or sign in to post jobs and receive quotes from qualified service providers.
                  </p>
                  <Button asChild size="lg">
                    <Link to="/auth">Sign In / Sign Up</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : myJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    No jobs posted yet
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Post your first job to start receiving quotes from professionals.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Tabs defaultValue="open" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="open">
                      Open ({myJobs.filter(j => j.status === 'open').length})
                    </TabsTrigger>
                    <TabsTrigger value="closed">
                      Closed ({myJobs.filter(j => j.status !== 'open').length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="open">
                    <div className="space-y-4">
                      {myJobs.filter(j => j.status === 'open').map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          quotes={quotes[job.id] || []}
                          categoryName={getCategoryName(job.category_id)}
                          formatDate={formatDate}
                          formatBudget={formatBudget}
                          onClose={() => handleUpdateJobStatus(job.id, 'closed')}
                        />
                      ))}
                      {myJobs.filter(j => j.status === 'open').length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          No open jobs
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="closed">
                    <div className="space-y-4">
                      {myJobs.filter(j => j.status !== 'open').map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          quotes={quotes[job.id] || []}
                          categoryName={getCategoryName(job.category_id)}
                          formatDate={formatDate}
                          formatBudget={formatBudget}
                          onReopen={() => handleUpdateJobStatus(job.id, 'open')}
                          isClosed
                        />
                      ))}
                      {myJobs.filter(j => j.status !== 'open').length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          No closed jobs
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </section>

      <Footer />
    </div>
  );
};

interface JobCardProps {
  job: JobListing;
  quotes: QuoteRequest[];
  categoryName: string | null;
  formatDate: (date: string) => string;
  formatBudget: (min: number | null, max: number | null) => string;
  onClose?: () => void;
  onReopen?: () => void;
  isClosed?: boolean;
}

const JobCard = ({ job, quotes, categoryName, formatDate, formatBudget, onClose, onReopen, isClosed }: JobCardProps) => {
  const [showQuotes, setShowQuotes] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {categoryName && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {categoryName}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded ${isClosed ? 'bg-muted text-muted-foreground' : 'bg-green-100 text-green-700'}`}>
                {isClosed ? 'Closed' : 'Open'}
              </span>
            </div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <CardDescription className="mt-2">{job.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            {isClosed ? (
              <Button variant="outline" size="sm" onClick={onReopen}>
                Reopen
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onClose}>
                <XCircle className="w-4 h-4 mr-1" />
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(job.created_at)}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
              )}
              <span className="font-medium text-foreground">
                {formatBudget(Number(job.budget_min), Number(job.budget_max))}
              </span>
            </div>
          </div>
          
          {/* Small location map */}
          {job.location && (
            <StaticLocationMap 
              location={job.location}
              latitude={job.latitude ? Number(job.latitude) : undefined}
              longitude={job.longitude ? Number(job.longitude) : undefined}
              className="h-28 w-full md:w-48 flex-shrink-0" 
            />
          )}
        </div>

        {/* Quotes Section */}
        <div className="border-t border-border pt-4">
          <button
            onClick={() => setShowQuotes(!showQuotes)}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            {quotes.length} Quote{quotes.length !== 1 ? 's' : ''} Received
          </button>

          {showQuotes && quotes.length > 0 && (
            <div className="mt-4 space-y-3">
              {quotes.map((quote) => (
                <div key={quote.id} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {quote.profiles?.avatar_url ? (
                        <img 
                          src={quote.profiles.avatar_url} 
                          alt={quote.profiles.full_name || 'Provider'} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Link 
                          to={`/service-provider/${quote.provider_id}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {quote.profiles?.full_name || 'Service Provider'}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(quote.created_at)}
                        </span>
                      </div>
                      {quote.message && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {quote.message}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        {quote.profiles?.email && (
                          <a 
                            href={`mailto:${quote.profiles.email}`}
                            className="text-xs text-primary flex items-center gap-1 hover:underline"
                          >
                            <Mail className="w-3 h-3" />
                            Email
                          </a>
                        )}
                        {quote.profiles?.phone && (
                          <a 
                            href={`tel:${quote.profiles.phone}`}
                            className="text-xs text-primary flex items-center gap-1 hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            Call
                          </a>
                        )}
                        <Link
                          to={`/service-provider/${quote.provider_id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showQuotes && quotes.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              No quotes received yet. Providers will contact you soon!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostJob;
