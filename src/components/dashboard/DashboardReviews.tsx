import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Star, User, MessageSquare, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
  provider_response: string | null;
  provider_response_at: string | null;
  reviewer: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  job_listing: {
    title: string;
  } | null;
}

interface DashboardReviewsProps {
  userId: string;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
        }`}
      />
    ))}
  </div>
);

const DashboardReviews = ({ userId }: DashboardReviewsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['provider-reviews', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          content,
          created_at,
          provider_response,
          provider_response_at,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url),
          job_listing:job_listings(title)
        `)
        .eq('provider_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Review[];
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      const { error } = await supabase
        .from('reviews')
        .update({
          provider_response: response,
          provider_response_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .eq('provider_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Response submitted successfully!' });
      setRespondingTo(null);
      setResponseText('');
      queryClient.invalidateQueries({ queryKey: ['provider-reviews', userId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error submitting response', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmitResponse = (reviewId: string) => {
    if (!responseText.trim()) {
      toast({ title: 'Please enter a response', variant: 'destructive' });
      return;
    }
    respondMutation.mutate({ reviewId, response: responseText.trim() });
  };

  const averageRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reviews ({reviews?.length || 0})
          </CardTitle>
          {averageRating && (
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-lg">{averageRating}</span>
              <span className="text-muted-foreground">average</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!reviews || reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Reviews from your clients will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border border-border rounded-lg p-4">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {review.reviewer?.avatar_url ? (
                        <img
                          src={review.reviewer.avatar_url}
                          alt={review.reviewer.full_name || 'Reviewer'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {review.reviewer?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(review.created_at), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>

                {/* Job Reference */}
                {review.job_listing && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Job: <span className="text-foreground">{review.job_listing.title}</span>
                  </p>
                )}

                {/* Review Content */}
                {review.title && (
                  <h4 className="font-medium text-foreground mb-1">{review.title}</h4>
                )}
                {review.content && (
                  <p className="text-muted-foreground">{review.content}</p>
                )}

                {/* Provider Response */}
                {review.provider_response ? (
                  <div className="mt-4 pl-4 border-l-2 border-primary/30 bg-secondary/50 p-3 rounded-r-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Your Response</p>
                    <p className="text-muted-foreground text-sm">{review.provider_response}</p>
                    {review.provider_response_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Responded on {format(new Date(review.provider_response_at), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                ) : respondingTo === review.id ? (
                  <div className="mt-4 space-y-3">
                    <Textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write your response to this review..."
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSubmitResponse(review.id)}
                        disabled={respondMutation.isPending}
                      >
                        {respondMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Submit Response
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRespondingTo(null);
                          setResponseText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={() => setRespondingTo(review.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Respond to Review
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardReviews;