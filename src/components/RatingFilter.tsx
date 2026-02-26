import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface RatingFilterProps {
  value: number | null;
  onChange: (rating: number | null) => void;
}

const RATING_OPTIONS = [
  { value: 4, label: '4+ stars' },
  { value: 3, label: '3+ stars' },
  { value: 2, label: '2+ stars' },
  { value: 1, label: '1+ stars' },
];

export const RatingFilter = ({ value, onChange }: RatingFilterProps) => {
  const hasFilter = value !== null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={hasFilter ? "default" : "outline"} 
          className="shrink-0 gap-2"
        >
          <Star className={cn("w-4 h-4", hasFilter && "fill-current")} />
          {hasFilter ? `${value}+ Stars` : 'Rating'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          <p className="text-sm font-medium px-2 py-1 text-muted-foreground">
            Minimum rating
          </p>
          {RATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(value === option.value ? null : option.value)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors",
                value === option.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3",
                      i < option.value
                        ? value === option.value
                          ? "fill-primary-foreground text-primary-foreground"
                          : "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span>& up</span>
            </button>
          ))}
          {hasFilter && (
            <button
              onClick={() => onChange(null)}
              className="w-full px-2 py-2 text-sm text-muted-foreground hover:bg-accent rounded-md transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RatingFilter;
