import { useState, useEffect } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Loader2, X, Briefcase, DollarSign, Calendar, Send, CheckCircle, Users, ArrowUpDown, MapPin, List, Map as MapIcon } from 'lucide-react';
import { JobsMap } from '@/components/JobsMap';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MaskedLocation } from '@/components/MaskedLocation';
import { HierarchicalCategoryFilter } from '@/components/HierarchicalCategoryFilter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { QuoteRequestDialog } from '@/components/QuoteRequestDialog';
import heroContractor from '@/assets/hero-contractor.jpg';

type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];

interface JobPost {
  id: string;
  title: string;
  description: string;
  location: string | null;
  location_area?: string | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
  posted_by?: string | null;
  category: { name: string; icon: string | null } | null;
  category_name?: string | null;
  category_icon?: string | null;
  poster?: { full_name: string | null; avatar_url: string | null } | null;
}

const JOBS_PER_PAGE = 12;
const MAX_QUOTES_PER_JOB = 3;

const BrowseJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isProvider } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [existingQuotes, setExistingQuotes] = useState<Set<string>>(new Set());
  const [jobQuoteCounts, setJobQuoteCounts] = useState<Map<string, number>>(new Map());
  const [requestingQuote, setRequestingQuote] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [selectedJobForQuote, setSelectedJobForQuote] = useState<JobPost | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [mapLocateNonce, setMapLocateNonce] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, selectedCategoryId, categories]);

  useEffect(() => {
    if (user && isProvider) {
      fetchExistingQuotes();
      fetchSubscriptionStatus();
    }
  }, [user, isProvider]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, locationFilter]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');
    
    if (data) setCategories(data);
  };

  const fetchSubscriptionStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .maybeSingle();
    
    if (data) setSubscriptionStatus(data.subscription_status);
  };

  const fetchExistingQuotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('quote_requests')
      .select('job_listing_id')
      .eq('provider_id', user.id);
    
    if (data) {
      setExistingQuotes(new Set(data.map(q => q.job_listing_id).filter(Boolean) as string[]));
    }
  };

  const fetchJobQuoteCounts = async (jobIds: string[]) => {
    if (jobIds.length === 0) return;
    
    const { data } = await supabase
      .from('quote_requests')
      .select('job_listing_id')
      .in('job_listing_id', jobIds);
    
    if (data) {
      const counts = new Map<string, number>();
      data.forEach(q => {
        if (q.job_listing_id) {
          counts.set(q.job_listing_id, (counts.get(q.job_listing_id) || 0) + 1);
        }
      });
      setJobQuoteCounts(counts);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Use selected category ID directly (already includes subcategory support)
      const categoryId = selectedCategoryId;

      // Get total count using secure function
      const { data: countData } = await supabase
        .rpc('count_public_job_listings', { p_category_id: categoryId });
      setTotalCount(Number(countData) || 0);

      // Fetch paginated data using secure function (no posted_by exposed)
      const offset = (currentPage - 1) * JOBS_PER_PAGE;

      const { data, error } = await supabase
        .rpc('get_public_job_listings', { 
          p_category_id: categoryId,
          p_limit: JOBS_PER_PAGE,
          p_offset: offset
        });

      if (error) throw error;
      
      // Map the data to match JobPost interface
      const mappedJobs: JobPost[] = (data || []).map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location_area, // Use the sanitized location
        budget_min: job.budget_min,
        budget_max: job.budget_max,
        created_at: job.created_at,
        category: job.category_name ? { name: job.category_name, icon: job.category_icon } : null,
      }));
      
      setJobs(mappedJobs);
      
      // Fetch quote counts for displayed jobs
      if (data && data.length > 0) {
        fetchJobQuoteCounts(data.map((j: any) => j.id));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = (e: React.MouseEvent, job: JobPost) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to job detail after login so they can submit quote
      navigate(`/auth?type=provider&redirect=${encodeURIComponent(`/jobs/${job.id}`)}`);
      return;
    }

    if (!isProvider) {
      toast.error('Only service providers can request quotes');
      return;
    }

    if (subscriptionStatus !== 'active') {
      toast.error('An active subscription is required to request quotes');
      navigate('/dashboard?tab=subscription');
      return;
    }

    const currentCount = jobQuoteCounts.get(job.id) || 0;
    if (currentCount >= MAX_QUOTES_PER_JOB) {
      toast.error('This job has reached the maximum number of quotes');
      return;
    }

    // Open dialog for custom message
    setSelectedJobForQuote(job);
    setQuoteDialogOpen(true);
  };

  const handleSubmitQuoteRequest = async (message: string) => {
    if (!user || !selectedJobForQuote) return;
    
    const jobId = selectedJobForQuote.id;
    setRequestingQuote(jobId);
    
    try {
      const { error } = await supabase
        .from('quote_requests')
        .insert({
          job_listing_id: jobId,
          provider_id: user.id,
          message: message.trim() || null,
          status: 'pending',
        });

      if (error) throw error;

      setExistingQuotes(prev => new Set([...prev, jobId]));
      setJobQuoteCounts(prev => new Map(prev).set(jobId, (prev.get(jobId) || 0) + 1));
      setQuoteDialogOpen(false);
      setSelectedJobForQuote(null);
      toast.success('Quote request sent successfully!');

      // Send email notification (edge function looks up job poster server-side)
      supabase.functions.invoke('send-quote-notification', {
        body: {
          jobId,
          providerId: user.id,
          message: message.trim() || null,
        },
      }).catch(err => console.error('Failed to send quote notification:', err));
    } catch (error: any) {
      console.error('Error requesting quote:', error);
      toast.error(error.message || 'Failed to send quote request');
    } finally {
      setRequestingQuote(null);
    }
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget not specified';
    if (min && max) return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
    if (min) return `From £${min.toLocaleString()}`;
    return `Up to £${max?.toLocaleString()}`;
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Client-side filtering for search and location (server handles category)
  const filteredJobs = jobs
    .filter(job => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower);

      const locationLower = locationFilter.toLowerCase();
      const matchesLocation = !locationFilter ||
        job.location?.toLowerCase().includes(locationLower);

      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'budget-high':
          return (b.budget_max || b.budget_min || 0) - (a.budget_max || a.budget_min || 0);
        case 'budget-low':
          return (a.budget_min || a.budget_max || Infinity) - (b.budget_min || b.budget_max || Infinity);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(null);
    setSelectedCategoryName(null);
    setLocationFilter('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategoryId !== null || locationFilter || sortBy !== 'newest';

  const totalPages = Math.ceil(totalCount / JOBS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Open Jobs & Leads for Tradespeople | Kluje" description="Browse open jobs posted by UK homeowners and businesses. Find leads in your trade, request to quote, and grow your service provider business." pageType="browse-jobs" />
      <Navbar />
      
      <main>
        <PageHero
          backgroundImage={heroContractor}
          title="Browse Jobs"
          description="Find projects that match your skills and start earning"
        />

        {/* Filters Section */}
        <section className="py-4 sm:py-6 lg:py-8 bg-secondary border-b border-border">
          <div className="container mx-auto px-4">
            {/* Mobile: Stacked filters */}
            <div className="flex flex-col gap-3 lg:hidden">
              {/* Search - full width on mobile */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              
              {/* Category + Location in row */}
              <div className="grid grid-cols-2 gap-3">
                <HierarchicalCategoryFilter
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryChange={(categoryId, categoryName) => {
                    setSelectedCategoryId(categoryId);
                    setSelectedCategoryName(categoryName);
                    setCurrentPage(1);
                  }}
                />
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
              </div>
              
              {/* Sort + Clear row */}
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1 bg-background">
                    <ArrowUpDown className="w-4 h-4 mr-2 shrink-0" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                    <SelectItem value="budget-low">Budget: Low to High</SelectItem>
                  </SelectContent>
                </Select>
                
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0 text-xs">
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop: Original horizontal layout */}
            <div className="hidden lg:flex flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>

              {/* Hierarchical Category Filter */}
              <HierarchicalCategoryFilter
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={(categoryId, categoryName) => {
                  setSelectedCategoryId(categoryId);
                  setSelectedCategoryName(categoryName);
                  setCurrentPage(1);
                }}
              />

              {/* Location Filter */}
              <div className="relative w-[200px]">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-background">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg z-50">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                  <SelectItem value="budget-low">Budget: Low to High</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="shrink-0">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Results Count and View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {loading ? 'Loading...' : `${totalCount} job${totalCount !== 1 ? 's' : ''} found`}
              </p>
              <div className="flex items-center gap-4">
                {totalPages > 1 && viewMode === 'list' && (
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                )}
                {/* View Mode Toggle */}
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none gap-1.5"
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">List</span>
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setViewMode('map');
                      setMapLocateNonce((n) => n + 1);
                    }}
                    className="rounded-none gap-1.5"
                  >
                    <MapIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Map</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Map View */}
            {viewMode === 'map' ? (
              <JobsMap
                selectedCategoryId={selectedCategoryId}
                categories={categories}
                autoLocateNonce={mapLocateNonce}
              />
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Loading jobs..." />
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-4">
                    {hasActiveFilters 
                      ? 'Try adjusting your filters to see more results.'
                      : 'There are no open jobs at the moment. Check back soon!'}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.map((job) => {
                    const hasRequested = existingQuotes.has(job.id);
                    const isRequesting = requestingQuote === job.id;
                    const quoteCount = jobQuoteCounts.get(job.id) || 0;
                    const isFull = quoteCount >= MAX_QUOTES_PER_JOB;
                    const timeAgo = formatDistanceToNow(new Date(job.created_at), { addSuffix: true });

                    return (
                      <Link key={job.id} to={`/jobs/${job.id}`}>
                        <Card className="group relative h-full overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                          {/* Header */}
                          <div className="p-4 pb-3 border-b border-border/50">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {job.category && <Badge variant="secondary">{job.category.name}</Badge>}
                                {isFull && (
                                  <Badge variant="destructive" className="text-xs">
                                    <Users className="w-3 h-3 mr-1" />
                                    Full
                                  </Badge>
                                )}
                                {!isFull && quoteCount > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <Users className="w-3 h-3 mr-1" />
                                    {quoteCount}/{MAX_QUOTES_PER_JOB}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{timeAgo}</span>
                              </div>
                            </div>
                          </div>

                          <CardContent className="p-4">

                            {/* Title */}
                            <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {job.title}
                            </h3>

                            {/* Description */}
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                              {job.description}
                            </p>

                            {/* Details */}
                            <div className="space-y-2 mb-4">
                              {job.location && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  <span className="line-clamp-1">{job.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <PoundSterling className="w-4 h-4" />
                                <span>{formatBudget(job.budget_min, job.budget_max)}</span>
                              </div>
                            </div>

                            {/* Posted By and Request Quote */}
                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={job.poster?.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(job.poster?.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {job.poster?.full_name || 'Anonymous'}
                                </span>
                              </div>

                              {/* Request Quote Button - Only for providers */}
                              {isProvider && (
                                  <Button
                                    size="sm"
                                    variant={hasRequested ? 'outline' : isFull ? 'secondary' : 'default'}
                                    disabled={hasRequested || isRequesting || isFull}
                                    onClick={(e) => handleRequestQuote(e, job)}
                                    className="shrink-0"
                                  >
                                    {isRequesting ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : hasRequested ? (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Requested
                                      </>
                                    ) : isFull ? (
                                      <>
                                        <Users className="w-4 h-4 mr-1" />
                                        Full
                                      </>
                                    ) : (
                                      <>
                                        <Send className="w-4 h-4 mr-1" />
                                        Quote
                                      </>
                                    )}
                                  </Button>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {getPageNumbers().map((page, index) => (
                          <PaginationItem key={index}>
                            {page === 'ellipsis' ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <QuoteRequestDialog
        open={quoteDialogOpen}
        onOpenChange={setQuoteDialogOpen}
        onSubmit={handleSubmitQuoteRequest}
        isSubmitting={requestingQuote !== null}
        jobTitle={selectedJobForQuote?.title}
      />
    </div>
  );
};

export default BrowseJobs;