import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReviewDialog } from '@/components/ReviewDialog';
import { Star, User, Briefcase, Clock, Loader2, CheckCircle } from 'lucide-react';

interface RatingRequest {
  quote_id: string;
  job_id: string;
  job_title: string;
  provider_id: string;
  provider_name: string | null;
  provider_avatar: string | null;
  completed_at: string;
  has_reviewed: boolean;
}

const DashboardRatingRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RatingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRatingRequests();
    }
  }, [user]);

  const fetchRatingRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get all completed quotes for jobs posted by this user
      const { data: completedQuotes, error: quotesError } = await supabase
        .from('quote_requests')
        .select(`
          id,
          provider_id,
          job_listing_id,
          updated_at,
          job_listings!inner (
            id,
            title,
            posted_by
          )
        `)
        .eq('status', 'completed')
        .eq('job_listings.posted_by', user.id);

      if (quotesError) throw quotesError;

      if (!completedQuotes || completedQuotes.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Get provider profiles
      const providerIds = [...new Set(completedQuotes.map(q => q.provider_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', providerIds);

      const profilesMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

      // Check which ones have been reviewed
      const { data: existingReviews } = await supabase
        .from('reviews')
        .select('provider_id, job_listing_id')
        .eq('reviewer_id', user.id)
        .in('provider_id', providerIds);

      const reviewedPairs = new Set(
        (existingReviews || []).map(r => `${r.provider_id}-${r.job_listing_id || 'null'}`)
      );

      const ratingRequests: RatingRequest[] = completedQuotes.map(quote => {
        const profile = profilesMap[quote.provider_id];
        const jobListing = quote.job_listings as any;
        const hasReviewed = reviewedPairs.has(`${quote.provider_id}-${quote.job_listing_id || 'null'}`) ||
                           reviewedPairs.has(`${quote.provider_id}-null`);

        return {
          quote_id: quote.id,
          job_id: jobListing.id,
          job_title: jobListing.title,
          provider_id: quote.provider_id,
          provider_name: profile?.full_name || null,
          provider_avatar: profile?.avatar_url || null,
          completed_at: quote.updated_at,
          has_reviewed: hasReviewed,
        };
      });

      // Sort: unreviewed first, then by date
      ratingRequests.sort((a, b) => {
        if (a.has_reviewed !== b.has_reviewed) {
          return a.has_reviewed ? 1 : -1;
        }
        return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
      });

      setRequests(ratingRequests);
    } catch (error: any) {
      console.error('Error fetching rating requests:', error);
      toast({
        title: 'Error loading rating requests',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const pendingReviews = requests.filter(r => !r.has_reviewed);
  const completedReviews = requests.filter(r => r.has_reviewed);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No rating requests yet</h2>
          <p className="text-muted-foreground mb-6">
            When service providers complete jobs for you, they may request a rating.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Reviews Section */}
      {pendingReviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Awaiting Your Review</h2>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              {pendingReviews.length}
            </Badge>
          </div>
          
          {pendingReviews.map((request) => (
            <Card key={request.quote_id} className="border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {request.provider_avatar ? (
                      <img
                        src={request.provider_avatar}
                        alt={request.provider_name || 'Provider'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <div>
                        <Link
                          to={`/service-provider/${request.provider_id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {request.provider_name || 'Service Provider'}
                        </Link>
                        <p className="text-sm text-muted-foreground">requested a rating</p>
                      </div>
                      
                      <ReviewDialog
                        providerId={request.provider_id}
                        providerName={request.provider_name || 'Service Provider'}
                        jobId={request.job_id}
                        onReviewSubmitted={fetchRatingRequests}
                        trigger={
                          <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Star className="w-4 h-4" />
                            Leave Review
                          </Button>
                        }
                      />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                        {request.job_title}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        Completed {formatDate(request.completed_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Reviews Section */}
      {completedReviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Already Reviewed</h2>
          
          {completedReviews.map((request) => (
            <Card key={request.quote_id} className="bg-muted/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {request.provider_avatar ? (
                      <img
                        src={request.provider_avatar}
                        alt={request.provider_name || 'Provider'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <div>
                        <Link
                          to={`/service-provider/${request.provider_id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {request.provider_name || 'Service Provider'}
                        </Link>
                        <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Review submitted
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                        {request.job_title}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        Completed {formatDate(request.completed_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardRatingRequests;
