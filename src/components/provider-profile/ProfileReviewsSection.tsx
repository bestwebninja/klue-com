import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, User, Pencil, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface Review {
  id: string;
  provider_id: string;
  reviewer_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
  provider_response: string | null;
  provider_response_at: string | null;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

interface ProfileReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  userId?: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  canReview: boolean;
  hasReviewed: boolean;
  onSubmitReview: (data: { rating: number; title: string; content: string }) => Promise<void>;
  onEditReview?: (reviewId: string, data: { rating: number; title: string; content: string }) => Promise<void>;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const StarRating = ({ rating, size = 'md', interactive = false, onRate }: {
  rating: number;
  size?: 'sm' | 'md';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}) => {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            className={`${sizeClass} ${
              star <= (hover || rating)
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

export const ProfileReviewsSection = ({
  reviews,
  averageRating,
  userId,
  providerId,
  providerName,
  providerAvatar,
  canReview,
  hasReviewed,
  onSubmitReview,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: ProfileReviewsSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', content: '' });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }));
  const maxCount = Math.max(...ratingDistribution.map((r) => r.count), 1);

  // Calculate time-based stats
  const now = new Date();
  const last30Days = reviews.filter(
    (r) => new Date(r.created_at) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  ).length;
  const last6Months = reviews.filter(
    (r) => new Date(r.created_at) > new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
  ).length;
  const last12Months = reviews.filter(
    (r) => new Date(r.created_at) > new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  ).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmitReview(reviewForm);
      setReviewForm({ rating: 0, title: '', content: '' });
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Ratings & Reviews</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Rating Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              {/* Write Review Button */}
              {canReview ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mb-6">Write A Review</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Rating *</Label>
                        <StarRating
                          rating={reviewForm.rating}
                          interactive
                          onRate={(r) => setReviewForm((p) => ({ ...p, rating: r }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="review-title">Title (optional)</Label>
                        <Input
                          id="review-title"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                          placeholder="Summarize your experience"
                          maxLength={100}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="review-content">Your Review (optional)</Label>
                        <Textarea
                          id="review-content"
                          value={reviewForm.content}
                          onChange={(e) => setReviewForm((p) => ({ ...p, content: e.target.value }))}
                          placeholder="Share details about your experience..."
                          rows={4}
                          maxLength={1000}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting || reviewForm.rating === 0}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Review'
                        )}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : !userId ? (
                <Link to="/auth">
                  <Button variant="outline" className="w-full mb-6">
                    Login or Register to Submit Answer
                  </Button>
                </Link>
              ) : hasReviewed ? (
                <p className="text-sm text-muted-foreground mb-6">You have already reviewed this provider</p>
              ) : null}

              {/* Average Rating */}
              <div className="text-center mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Average Rating</p>
                <p className="text-5xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
                <StarRating rating={averageRating} />
              </div>

              {/* Time-based Stats */}
              <div className="space-y-1 text-sm text-muted-foreground mb-6">
                <p>{last30Days} last 30 days</p>
                <p>{last6Months} last 6 months</p>
                <p>{last12Months} last 12 months</p>
                <p className="text-foreground font-medium">({reviews.length} total ratings)</p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count }) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="w-3 text-sm font-medium">{rating}</span>
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <Progress 
                      value={(count / maxCount) * 100} 
                      className="flex-1 h-2"
                    />
                    <span className="w-6 text-sm text-right">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right - Reviews List */}
        <div className="lg:col-span-2">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const isOwnReview = userId === review.reviewer_id;

                return (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Rating Sidebar */}
                        <div className="hidden sm:block space-y-2 text-xs border-r border-border pr-4">
                          <div>
                            <p className="text-muted-foreground">Professionalism</p>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quality</p>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <div>
                            <p className="text-muted-foreground">Value</p>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                JobID: {review.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                            </div>
                            <div className="sm:hidden">
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                          </div>

                          <p className="text-muted-foreground mb-3">
                            {review.content || 'No comment provided.'}
                          </p>

                          <p className="text-sm text-foreground text-right">
                            {review.profiles?.full_name || 'Anonymous'}
                            {isOwnReview && <span className="ml-1 text-primary">(You)</span>}
                          </p>

                          {/* Provider Response */}
                          {review.provider_response && (
                            <div className="mt-4 pl-4 border-l-2 border-primary/30 bg-muted/50 p-3 rounded-r-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                  {providerAvatar ? (
                                    <img src={providerAvatar} alt={providerName} className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-3 h-3 text-primary" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                  Response from {providerName}
                                </span>
                              </div>
                              <p className="text-muted-foreground text-sm">{review.provider_response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="text-sm text-muted-foreground">
                Page: {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded border border-border flex items-center justify-center disabled:opacity-50"
                >
                  &lt;
                </button>
                <button
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded border border-border flex items-center justify-center disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
