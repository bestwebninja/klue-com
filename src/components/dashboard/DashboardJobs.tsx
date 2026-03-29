import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Clock, Crown, Send, CheckCircle, Filter, SlidersHorizontal, X, MapPin, User, Mail, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MaskedLocation } from '@/components/MaskedLocation';
import { MaskedLocationMap } from '@/components/MaskedLocationMap';
import { calculateDistance } from '@/lib/distance';
import type { Database } from '@/integrations/supabase/types';

interface HomeownerDetails {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

type JobListing = Database['public']['Tables']['job_listings']['Row'] & {
  service_categories?: Database['public']['Tables']['service_categories']['Row'] | null;
  distance?: number;
  relevanceScore?: number;
  homeowner?: HomeownerDetails | null;
};

type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];
type ProviderLocation = Database['public']['Tables']['provider_locations']['Row'];

interface DashboardJobsProps {
  userId: string;
  isSubscribed: boolean;
  onSubscribe: () => void;
}

type SortOption = 'relevance' | 'newest' | 'closest';

const DashboardJobs = ({ userId, isSubscribed, onSubscribe }: DashboardJobsProps) => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([]);
  const [myQuotes, setMyQuotes] = useState<Record<string, { status: string; homeowner?: HomeownerDetails | null }>>({});
  const [quoteMessage, setQuoteMessage] = useState('');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Filter states
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [providerCategories, setProviderCategories] = useState<string[]>([]);
  const [providerLocation, setProviderLocation] = useState<ProviderLocation | null>(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchMyQuotes();
    fetchCategories();
    fetchProviderData();
  }, [userId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [jobs, locationFilter, sortBy, providerCategories, providerLocation]);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('job_listings')
      .select('*, service_categories(*)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      setJobs(data || []);
    }
  };

  const fetchMyQuotes = async () => {
    // First fetch quote requests with job listing info
    const { data, error } = await supabase
      .from('quote_requests')
      .select(`
        job_listing_id, 
        status,
        job_listings!inner(posted_by)
      `)
      .eq('provider_id', userId);

    if (error) {
      console.error('Error fetching quotes:', error);
      return;
    }

    // For accepted/completed quotes, fetch homeowner details
    const acceptedQuotes = data?.filter(q => 
      q.status === 'accepted' || q.status === 'completed'
    ) || [];
    
    const homeownerIds = acceptedQuotes
      .map(q => (q.job_listings as unknown as { posted_by: string | null })?.posted_by)
      .filter(Boolean) as string[];

    let homeownerMap: Record<string, HomeownerDetails> = {};
    
    if (homeownerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', homeownerIds);
      
      profiles?.forEach(p => {
        homeownerMap[p.id] = {
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
        };
      });
    }

    const quotesMap: Record<string, { status: string; homeowner?: HomeownerDetails | null }> = {};
    data?.forEach(q => {
      if (q.job_listing_id) {
        const postedBy = (q.job_listings as unknown as { posted_by: string | null })?.posted_by;
        const isAccepted = q.status === 'accepted' || q.status === 'completed';
        quotesMap[q.job_listing_id] = {
          status: q.status,
          homeowner: isAccepted && postedBy ? homeownerMap[postedBy] || null : null,
        };
      }
    });
    setMyQuotes(quotesMap);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchProviderData = async () => {
    // Fetch provider's services to get their categories
    const { data: services, error: servicesError } = await supabase
      .from('provider_services')
      .select('category_id')
      .eq('provider_id', userId);

    if (!servicesError && services) {
      setProviderCategories(services.map(s => s.category_id).filter(Boolean) as string[]);
    }

    // Fetch provider's primary location
    const { data: locations, error: locationsError } = await supabase
      .from('provider_locations')
      .select('*')
      .eq('provider_id', userId)
      .eq('is_primary', true)
      .maybeSingle();

    if (!locationsError && locations) {
      setProviderLocation(locations);
    } else {
      // If no primary, get first location
      const { data: anyLocation } = await supabase
        .from('provider_locations')
        .select('*')
        .eq('provider_id', userId)
        .limit(1)
        .maybeSingle();
      
      if (anyLocation) {
        setProviderLocation(anyLocation);
      }
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...jobs];

    // Only show jobs that match provider's categories
    if (providerCategories.length > 0) {
      result = result.filter(job => 
        job.category_id && providerCategories.includes(job.category_id)
      );
    }

    // Calculate distance and relevance score for each job
    result = result.map(job => {
      let distance: number | undefined;
      let relevanceScore = 0;

      // Calculate distance if both job and provider have coordinates
      if (job.latitude && job.longitude && providerLocation?.latitude && providerLocation?.longitude) {
        distance = calculateDistance(
          Number(providerLocation.latitude),
          Number(providerLocation.longitude),
          Number(job.latitude),
          Number(job.longitude)
        );
      }

      // Calculate relevance score based on category match
      if (job.category_id && providerCategories.includes(job.category_id)) {
        relevanceScore += 100;
      }

      // Boost score for closer jobs
      if (distance !== undefined) {
        relevanceScore += Math.max(0, 50 - distance); // Closer = higher score
      }

      // Boost score for newer jobs
      const daysSincePosted = (Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24);
      relevanceScore += Math.max(0, 30 - daysSincePosted);

      return { ...job, distance, relevanceScore };
    });

    // Apply location filter
    if (locationFilter.trim()) {
      const searchTerm = locationFilter.toLowerCase();
      result = result.filter(job => 
        job.location?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'closest':
        result.sort((a, b) => {
          if (a.distance === undefined && b.distance === undefined) return 0;
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
        break;
      case 'relevance':
      default:
        result.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        break;
    }

    setFilteredJobs(result);
  };

  const handleRequestQuote = async (jobId: string) => {
    if (!isSubscribed) {
      toast({
        title: 'Subscription Required',
        description: 'You need an active subscription to request quotes. Upgrade for just $4.99/month.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('quote_requests')
      .insert({
        provider_id: userId,
        job_listing_id: jobId,
        message: quoteMessage || null,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit quote request',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Quote request sent!' });
      setQuoteMessage('');
      setSelectedJob(null);
      fetchMyQuotes();
    }

    setIsSubmitting(false);
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
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const clearFilters = () => {
    setLocationFilter('');
    setSortBy('relevance');
  };

  const hasActiveFilters = locationFilter.trim() !== '';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Available Jobs
            </CardTitle>
            <CardDescription>
              Browse jobs and request to quote • {filteredJobs.length} jobs found
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isSubscribed && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                <Crown className="w-4 h-4 text-primary" />
                Subscribe to request quotes
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary/10' : ''}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter & Sort Jobs
              </h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <Input
                  placeholder="Search by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-1 block">Sort by</label>
                <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="closest">Closest to You</SelectItem>
                  </SelectContent>
                </Select>
                {!providerLocation && sortBy === 'closest' && (
                  <p className="text-xs text-amber-600 mt-1">
                    Add a location to enable distance sorting
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredJobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            {hasActiveFilters ? (
              <>
                <p>No jobs match your filters.</p>
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters to see all matching jobs
                </Button>
              </>
            ) : providerCategories.length === 0 ? (
              <p>Add services to your profile to see relevant jobs.</p>
            ) : (
              <p>No jobs matching your services at the moment. Check back later!</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => {
              const quoteData = myQuotes[job.id];
              const hasQuoted = !!quoteData;
              const quoteStatus = quoteData?.status;
              const homeowner = quoteData?.homeowner;
              const showHomeownerDetails = (quoteStatus === 'accepted' || quoteStatus === 'completed') && homeowner;
              
              const getStatusBadge = () => {
                switch (quoteStatus) {
                  case 'accepted':
                    return (
                      <span className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        Accepted
                      </span>
                    );
                  case 'completed':
                    return (
                      <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </span>
                    );
                  default:
                    return (
                      <span className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-2 rounded-lg">
                        <Clock className="w-4 h-4" />
                        Pending
                      </span>
                    );
                }
              };
              
              return (
                <div
                  key={job.id}
                  className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {job.service_categories && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {job.service_categories.name}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(job.created_at)}
                        </span>
                        {job.distance !== undefined && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.distance.toFixed(1)} miles away
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-foreground mb-1">{job.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {job.location && (
                          <MaskedLocation
                            fullLocation={job.location}
                            allowReveal={true}
                            className="text-sm"
                          />
                        )}
                        <span className="font-medium text-foreground">
                          {formatBudget(Number(job.budget_min), Number(job.budget_max))}
                        </span>
                      </div>

                      {/* Small location map - masked until user clicks to reveal */}
                      {job.location && (
                        <MaskedLocationMap 
                          location={job.location}
                          latitude={job.latitude ? Number(job.latitude) : undefined}
                          longitude={job.longitude ? Number(job.longitude) : undefined}
                          className="h-24 w-full mt-3" 
                        />
                      )}

                      {/* Homeowner contact details - shown when quote is accepted */}
                      {showHomeownerDetails && (
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                          <h5 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Customer Contact Details
                          </h5>
                          <div className="space-y-1.5 text-sm">
                            {homeowner.full_name && (
                              <p className="text-foreground font-medium">{homeowner.full_name}</p>
                            )}
                            {homeowner.email && (
                              <a 
                                href={`mailto:${homeowner.email}`}
                                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                {homeowner.email}
                              </a>
                            )}
                            {homeowner.phone && (
                              <a 
                                href={`tel:${homeowner.phone}`}
                                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                {homeowner.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      {hasQuoted ? (
                        getStatusBadge()
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant={isSubscribed ? 'default' : 'outline'}
                              onClick={() => setSelectedJob(job.id)}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Request Quote
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request to Quote</DialogTitle>
                            </DialogHeader>
                            
                            {!isSubscribed ? (
                              <div className="text-center py-4">
                                <Crown className="w-12 h-12 mx-auto mb-4 text-primary" />
                                <h3 className="font-semibold mb-2">Subscription Required</h3>
                                <p className="text-muted-foreground mb-4">
                                  Upgrade to Pro for just $4.99/month to request quotes on jobs.
                                </p>
                                <Button onClick={onSubscribe}>
                                  Upgrade Now
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="bg-muted/50 p-3 rounded-lg">
                                  <h4 className="font-medium">{job.title}</h4>
                                  <p className="text-sm text-muted-foreground">{job.location}</p>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">
                                    Message (optional)
                                  </label>
                                  <Textarea
                                    placeholder="Introduce yourself and explain why you're a good fit for this job..."
                                    value={quoteMessage}
                                    onChange={(e) => setQuoteMessage(e.target.value)}
                                    className="mt-1"
                                  />
                                </div>
                                
                                <Button 
                                  className="w-full" 
                                  onClick={() => handleRequestQuote(job.id)}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? 'Sending...' : 'Send Quote Request'}
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardJobs;
