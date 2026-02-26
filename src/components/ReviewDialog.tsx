import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Star, Loader2, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  content: z.string().max(1000, 'Review must be less than 1000 characters').optional(),
});

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  size?: 'sm' | 'md';
}

const StarRating = ({ rating, onRate, size = 'md' }: StarRatingProps) => {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="cursor-pointer transition-transform hover:scale-110"
        >
          <Star
            className={`${sizeClass} ${
              star <= (hover || rating)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

// Number of days a review can be edited after submission
export const REVIEW_EDIT_WINDOW_DAYS = 7;

export function canEditReview(reviewCreatedAt: string): boolean {
  const createdDate = new Date(reviewCreatedAt);
  const now = new Date();
  const diffInMs = now.getTime() - createdDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return diffInDays <= REVIEW_EDIT_WINDOW_DAYS;
}

export function getDaysRemaining(reviewCreatedAt: string): number {
  const createdDate = new Date(reviewCreatedAt);
  const now = new Date();
  const diffInMs = now.getTime() - createdDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(REVIEW_EDIT_WINDOW_DAYS - diffInDays));
}

interface ExistingReview {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
}

interface ReviewDialogProps {
  providerId: string;
  providerName: string;
  jobId?: string;
  onReviewSubmitted?: () => void;
  trigger?: React.ReactNode;
  existingReview?: ExistingReview;
  mode?: 'create' | 'edit';
}

export function ReviewDialog({ 
  providerId, 
  providerName, 
  jobId,
  onReviewSubmitted,
  trigger,
  existingReview,
  mode = 'create',
}: ReviewDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens with existing review
  useEffect(() => {
    if (open && existingReview) {
      setRating(existingReview.rating);
      setTitle(existingReview.title || '');
      setContent(existingReview.content || '');
    }
  }, [open, existingReview]);

  const isEditMode = mode === 'edit' && existingReview;
  const daysRemaining = existingReview ? getDaysRemaining(existingReview.created_at) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Please sign in to leave a review', variant: 'destructive' });
      return;
    }

    if (user.id === providerId) {
      toast({ title: 'You cannot review yourself', variant: 'destructive' });
      return;
    }

    // Validate
    const validation = reviewSchema.safeParse({ rating, title: title || undefined, content: content || undefined });
    if (!validation.success) {
      toast({ 
        title: 'Validation error', 
        description: validation.error.errors[0].message,
        variant: 'destructive' 
      });
      return;
    }

    // Check edit window for updates
    if (isEditMode && existingReview && !canEditReview(existingReview.created_at)) {
      toast({
        title: 'Edit window expired',
        description: `Reviews can only be edited within ${REVIEW_EDIT_WINDOW_DAYS} days of submission.`,
        variant: 'destructive',
      });
      setOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            title: title.trim() || null,
            content: content.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id)
          .eq('reviewer_id', user.id);

        if (error) throw error;
        toast({ title: 'Review updated!', description: 'Your changes have been saved.' });
      } else {
        // Check if user already reviewed this provider
        const { data: existingReviewData } = await supabase
          .from('reviews')
          .select('id')
          .eq('provider_id', providerId)
          .eq('reviewer_id', user.id)
          .maybeSingle();

        if (existingReviewData) {
          toast({ 
            title: 'Already reviewed', 
            description: 'You have already left a review for this provider.',
            variant: 'destructive' 
          });
          setOpen(false);
          return;
        }

        const { error } = await supabase.from('reviews').insert({
          provider_id: providerId,
          reviewer_id: user.id,
          job_listing_id: jobId || null,
          rating,
          title: title.trim() || null,
          content: content.trim() || null,
        });

        if (error) throw error;

        // Get reviewer's name for notification
        const { data: reviewerProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        // Send email notification (fire and forget)
        supabase.functions.invoke('send-review-notification', {
          body: {
            providerId,
            reviewerName: reviewerProfile?.full_name || 'A customer',
            rating,
            title: title.trim() || undefined,
            content: content.trim() || undefined,
          },
        }).catch(err => console.error('Failed to send review notification:', err));

        toast({ title: 'Review submitted!', description: 'Thank you for your feedback.' });
      }

      setRating(0);
      setTitle('');
      setContent('');
      setOpen(false);
      onReviewSubmitted?.();
    } catch (error: any) {
      toast({ 
        title: isEditMode ? 'Error updating review' : 'Error submitting review', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = isEditMode ? (
    <Button variant="ghost" size="sm" className="gap-1">
      <Pencil className="w-3 h-3" />
      Edit
    </Button>
  ) : (
    <Button variant="outline" size="sm" className="gap-1">
      <Star className="w-4 h-4" />
      Leave Review
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Review' : `Review ${providerName}`}</DialogTitle>
          <DialogDescription>
            {isEditMode ? (
              <>
                Update your review. You have <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong> remaining to make changes.
              </>
            ) : (
              'Share your experience working with this service provider.'
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating *</Label>
            <StarRating rating={rating} onRate={setRating} />
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="review-title">Title (optional)</Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience"
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="review-content">Your Review (optional)</Label>
            <Textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell others about your experience..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/1000
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
