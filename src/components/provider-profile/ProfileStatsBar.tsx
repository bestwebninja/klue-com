import { ThumbsUp, Star, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileStatsBarProps {
  averageRating: number;
  reviewCount: number;
  onLike?: () => void;
  onShare?: (platform: string) => void;
}

export const ProfileStatsBar = ({ 
  averageRating, 
  reviewCount, 
  onLike,
  onShare 
}: ProfileStatsBarProps) => {
  return (
    <section className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        {/* Action Bar */}
        <div className="py-4 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          {/* Like Button */}
          <button 
            onClick={onLike}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-xs font-semibold uppercase tracking-wide">Like</span>
            <ThumbsUp className="w-5 h-5" />
          </button>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px h-12 bg-border" />

          {/* Ratings */}
          <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <span className="text-xs font-semibold uppercase tracking-wide">Ratings</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              out of {reviewCount} rating{reviewCount !== 1 ? 's' : ''}
            </span>
          </button>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px h-12 bg-border" />

          {/* Follow Me / Share */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Follow Me</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={() => onShare?.('facebook')}
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={() => onShare?.('twitter')}
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={() => onShare?.('linkedin')}
              >
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
