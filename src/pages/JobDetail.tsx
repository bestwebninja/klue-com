import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";
import { 
  Calendar, 
  DollarSign, 
  Share2, 
  MessageSquare, 
  CheckCircle, 
  Loader2,
  User,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone
} from "lucide-react";
import { MaskedLocation } from "@/components/MaskedLocation";
import QuoteMessages from "@/components/QuoteMessages";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface QuoteWithProvider {
  id: string;
  message: string | null;
  status: string;
  created_at: string;
  provider_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null;
}

interface ExistingQuoteData {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  job_listing_id: string;
  homeowner?: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [expandedMessageQuoteId, setExpandedMessageQuoteId] = useState<string | null>(null);

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      // Use secure RPC function for public access
      const { data, error } = await supabase
        .rpc('get_public_job_listing', { p_job_id: id });

      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      const jobData = data[0];
      
      // Map to expected format
      return {
        id: jobData.id,
        title: jobData.title,
        description: jobData.description,
        location: jobData.location_area,
        budget_min: jobData.budget_min,
        budget_max: jobData.budget_max,
        created_at: jobData.created_at,
        updated_at: jobData.updated_at,
        status: jobData.status,
        category_id: jobData.category_id,
        service_categories: jobData.category_name ? { 
          name: jobData.category_name, 
          icon: jobData.category_icon 
        } : null,
        profiles: null, // Public view doesn't expose poster info
        posted_by: null, // Not exposed for privacy
      };
    },
    enabled: !!id,
  });

  const isOwnJob = user?.id === job?.posted_by;

  // Fetch quotes for this job (only for job poster)
  const { data: jobQuotes, isLoading: quotesLoading } = useQuery({
    queryKey: ['job-quotes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          id,
          message,
          status,
          created_at,
          provider_id
        `)
        .eq('job_listing_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch profiles for providers
      const providerIds = data.map(q => q.provider_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio')
        .in('id', providerIds);
      
      const profilesMap = Object.fromEntries((profilesData || []).map(p => [p.id, p]));
      
      return data.map(quote => ({
        ...quote,
        profiles: profilesMap[quote.provider_id] || null,
      })) as QuoteWithProvider[];
    },
    enabled: !!id && isOwnJob,
  });

  // Check if current user is a provider with active subscription
  const { data: providerStatus } = useQuery({
    queryKey: ['provider-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'provider')
        .maybeSingle();

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .maybeSingle();

      return {
        isProvider: !!roles,
        hasActiveSubscription: profile?.subscription_status === 'active',
      };
    },
    enabled: !!user,
  });

  // Check if user already submitted a quote for this job (with homeowner details for accepted quotes)
  const { data: existingQuote } = useQuery<ExistingQuoteData | null>({
    queryKey: ['existing-quote', id, user?.id],
    queryFn: async (): Promise<ExistingQuoteData | null> => {
      if (!user || !id) return null;
      
      const { data } = await supabase
        .from('quote_requests')
        .select('id, status, message, created_at, job_listing_id')
        .eq('job_listing_id', id)
        .eq('provider_id', user.id)
        .maybeSingle();

      if (!data) return null;

      // If quote is accepted, fetch homeowner details
      if (data.status === 'accepted' || data.status === 'completed') {
        const { data: jobData } = await supabase
          .from('job_listings')
          .select('posted_by')
          .eq('id', id)
          .single();

        if (jobData?.posted_by) {
          const { data: homeownerProfile } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone')
            .eq('id', jobData.posted_by)
            .single();

          return {
            id: data.id,
            status: data.status,
            message: data.message,
            created_at: data.created_at,
            job_listing_id: data.job_listing_id,
            homeowner: homeownerProfile,
          };
        }
      }

      return {
        id: data.id,
        status: data.status,
        message: data.message,
        created_at: data.created_at,
        job_listing_id: data.job_listing_id,
      };
    },
    enabled: !!user && !!id && !isOwnJob,
  });

  const submitQuoteMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user || !id) throw new Error('Missing required data');
      
      const { data, error } = await supabase
        .from('quote_requests')
        .insert({
          job_listing_id: id,
          provider_id: user.id,
          message: message.trim() || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return { data, message: message.trim() || null };
    },
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: ['existing-quote', id, user?.id] });
      setQuoteDialogOpen(false);
      toast({
        title: "Quote submitted!",
        description: "The job poster will be notified of your interest.",
      });
      
      // Send email notifications to homeowner and provider
      supabase.functions.invoke('send-quote-notification', {
        body: {
          jobId: id,
          providerId: user?.id,
          message,
        },
      }).catch(err => console.error('Failed to send quote notification:', err));
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit quote",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateQuoteStatusMutation = useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: string; status: string }) => {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status })
        .eq('id', quoteId);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['job-quotes', id] });
      toast({
        title: status === 'accepted' ? "Quote accepted!" : "Quote declined",
        description: status === 'accepted' 
          ? "The provider will be notified." 
          : "The provider has been notified.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update quote",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRequestQuote = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in as a provider to submit a quote.",
      });
      // Redirect back to this job after login
      navigate(`/auth?type=provider&redirect=${encodeURIComponent(`/jobs/${id}`)}`);
      return;
    }

    if (!providerStatus?.isProvider) {
      toast({
        title: "Provider account required",
        description: "Only registered service providers can submit quotes.",
        variant: "destructive",
      });
      return;
    }

    if (!providerStatus?.hasActiveSubscription) {
      toast({
        title: "Subscription required",
        description: "An active subscription is required to submit quotes. Please upgrade your plan.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    if (existingQuote) {
      toast({
        title: "Already submitted",
        description: "You have already submitted a quote for this job.",
      });
      return;
    }

    setQuoteDialogOpen(true);
  };

  const handleSubmitQuote = (message: string) => {
    submitQuoteMutation.mutate(message);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: job?.description,
          url: url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Job link copied to clipboard",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'declined':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-8">
          <Card className="text-center py-12">
            <CardContent>
              <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
              <p className="text-muted-foreground mb-4">
                This job listing may have been removed or is no longer available.
              </p>
              <Button asChild>
                <Link to="/jobs">Browse All Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const budgetDisplay = job.budget_min && job.budget_max
    ? `$${job.budget_min.toLocaleString()} - $${job.budget_max.toLocaleString()}`
    : job.budget_min
    ? `From $${job.budget_min.toLocaleString()}`
    : job.budget_max
    ? `Up to $${job.budget_max.toLocaleString()}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${job.title} – Job in ${job.location || 'US'} | Kluje`}
        description={job.description?.substring(0, 155) || `View this ${job.service_categories?.name || ''} job on Kluje and request to quote.`}
        keywords={[job.service_categories?.name, 'job', 'quote', 'US', job.location].filter(Boolean) as string[]}
        pageType="job-detail"
        pageContent={job.description}
        canonical={`https://klue-us.lovable.app/jobs/${id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": job.title,
          "description": job.description,
          "datePosted": job.created_at,
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressRegion": job.location || "",
              "addressCountry": "US"
            }
          },
          "hiringOrganization": {
            "@type": "Organization",
            "name": "Kluje",
            "sameAs": "https://klue-us.lovable.app"
          },
          ...(job.budget_min && job.budget_max && {
            "baseSalary": {
              "@type": "MonetaryAmount",
              "currency": "USD",
              "value": {
                "@type": "QuantitativeValue",
                "minValue": job.budget_min,
                "maxValue": job.budget_max,
                "unitText": "PROJECT"
              }
            }
          }),
          "industry": job.service_categories?.name || "Home Services"
        }}
      />
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
                    {job.service_categories && (
                      <Badge variant="secondary" className="text-sm">
                        {job.service_categories.name}
                      </Badge>
                    )}
                  </div>
                  <Badge 
                    variant={job.status === 'open' ? 'default' : 'secondary'}
                    className="shrink-0"
                  >
                    {job.status === 'open' ? 'Open' : job.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {job.location && (
                    <MaskedLocation
                      fullLocation={job.location}
                      maskedLocation={job.location}
                      allowReveal={false}
                      className="text-sm"
                    />
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </span>
                  {budgetDisplay && (
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <PoundSterling className="h-4 w-4" />
                      {budgetDisplay}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <h2 className="font-semibold mb-3">Job Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Posted By - only show if not own job */}
            {job.profiles && !isOwnJob && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-semibold mb-3">Posted By</h2>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {job.profiles.avatar_url ? (
                        <img 
                          src={job.profiles.avatar_url} 
                          alt={job.profiles.full_name || 'User'} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-medium">
                          {job.profiles.full_name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{job.profiles.full_name || 'Anonymous'}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quotes Section - Only visible to job poster */}
            {isOwnJob && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Quotes Received</h2>
                    {jobQuotes && jobQuotes.length > 0 && (
                      <Badge variant="secondary">{jobQuotes.length} quote{jobQuotes.length !== 1 ? 's' : ''}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {quotesLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : jobQuotes && jobQuotes.length > 0 ? (
                    <div className="space-y-4">
                      {jobQuotes.map((quote, index) => (
                        <div key={quote.id}>
                          {index > 0 && <Separator className="my-4" />}
                          <div className="space-y-4">
                            {/* Provider Info */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={quote.profiles?.avatar_url || undefined} />
                                  <AvatarFallback>
                                    <User className="h-5 w-5" />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {quote.profiles?.full_name || 'Service Provider'}
                                    </span>
                                    <Badge variant={getStatusBadgeVariant(quote.status)} className="capitalize text-xs">
                                      {quote.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <Link to={`/service-provider/${quote.provider_id}`}>
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View Profile
                                </Link>
                              </Button>
                            </div>

                            {/* Quote Message */}
                            {quote.message && (
                              <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm whitespace-pre-wrap">{quote.message}</p>
                              </div>
                            )}

                            {/* Provider Bio */}
                            {quote.profiles?.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {quote.profiles.bio}
                              </p>
                            )}

                            {/* Action Buttons - only show for pending quotes */}
                            {quote.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateQuoteStatusMutation.mutate({ 
                                    quoteId: quote.id, 
                                    status: 'accepted' 
                                  })}
                                  disabled={updateQuoteStatusMutation.isPending}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuoteStatusMutation.mutate({ 
                                    quoteId: quote.id, 
                                    status: 'declined' 
                                  })}
                                  disabled={updateQuoteStatusMutation.isPending}
                                >
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            )}

                            {/* Messaging - only show for accepted quotes */}
                            {quote.status === 'accepted' && (
                              <div className="mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-between"
                                  onClick={() => setExpandedMessageQuoteId(
                                    expandedMessageQuoteId === quote.id ? null : quote.id
                                  )}
                                >
                                  <span className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    Messages
                                  </span>
                                  {expandedMessageQuoteId === quote.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                                {expandedMessageQuoteId === quote.id && (
                                  <div className="mt-3 border rounded-lg bg-background">
                                    <QuoteMessages
                                      quoteRequestId={quote.id}
                                      otherUserId={quote.provider_id}
                                      otherUserName={quote.profiles?.full_name || undefined}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No quotes yet</p>
                      <p className="text-sm">Service providers will be able to submit quotes for your job.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardContent className="pt-6 space-y-4">
                {isOwnJob ? (
                  <div className="text-center space-y-2">
                    <Badge variant="outline" className="mb-2">Your Job</Badge>
                    <p className="text-sm text-muted-foreground">
                      {jobQuotes?.length || 0} quote{(jobQuotes?.length || 0) !== 1 ? 's' : ''} received
                    </p>
                  </div>
                ) : existingQuote ? (
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Quote Submitted</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted {formatDistanceToNow(new Date(existingQuote.created_at), { addSuffix: true })}
                      </p>
                      <Badge variant={getStatusBadgeVariant(existingQuote.status)} className="capitalize">
                        {existingQuote.status}
                      </Badge>
                    </div>

                    {/* Show homeowner contact details for accepted quotes */}
                    {(existingQuote.status === 'accepted' || existingQuote.status === 'completed') && existingQuote.homeowner && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Customer Contact Details
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{existingQuote.homeowner.full_name || 'Not provided'}</span>
                          </div>
                          {existingQuote.homeowner.email && (
                            <a 
                              href={`mailto:${existingQuote.homeowner.email}`}
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <Mail className="h-4 w-4" />
                              {existingQuote.homeowner.email}
                            </a>
                          )}
                          {existingQuote.homeowner.phone && (
                            <a 
                              href={`tel:${existingQuote.homeowner.phone}`}
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <Phone className="h-4 w-4" />
                              {existingQuote.homeowner.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Messaging for accepted quotes - provider view */}
                    {existingQuote.status === 'accepted' && job.posted_by && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Message Job Poster
                        </p>
                        <div className="border rounded-lg bg-background">
                          <QuoteMessages
                            quoteRequestId={existingQuote.id}
                            otherUserId={job.posted_by}
                            otherUserName={job.profiles?.full_name || undefined}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button 
                    className="w-full gap-2" 
                    size="lg" 
                    onClick={handleRequestQuote}
                    disabled={job.status !== 'open'}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Submit Quote
                  </Button>
                )}
                <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  Share Job
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      <QuoteRequestDialog
        open={quoteDialogOpen}
        onOpenChange={setQuoteDialogOpen}
        onSubmit={handleSubmitQuote}
        isSubmitting={submitQuoteMutation.isPending}
        jobTitle={job?.title}
      />
    </div>
  );
};

export default JobDetail;
