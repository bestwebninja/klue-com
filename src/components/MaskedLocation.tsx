import { useState } from 'react';
import { MapPin, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface MaskedLocationProps {
  /** The full location string (only shown to authenticated users on click) */
  fullLocation?: string | null;
  /** A masked/general area version of the location */
  maskedLocation?: string | null;
  /** Whether to show the reveal button for authenticated users */
  allowReveal?: boolean;
  /** Additional class names */
  className?: string;
  /** Icon size */
  iconSize?: 'sm' | 'md';
  /** Show the map pin icon */
  showIcon?: boolean;
}

/**
 * Displays location information with privacy protection.
 * - Public/unauthenticated users see only the masked general area
 * - Authenticated users can click to reveal the full location
 */
export function MaskedLocation({
  fullLocation,
  maskedLocation,
  allowReveal = true,
  className,
  iconSize = 'md',
  showIcon = true,
}: MaskedLocationProps) {
  const { user } = useAuth();
  const [isRevealed, setIsRevealed] = useState(false);

  // Derive masked location from full location if not provided
  const derivedMaskedLocation = maskedLocation || (fullLocation ? deriveGeneralArea(fullLocation) : null);
  
  // What to display
  const displayLocation = isRevealed && user ? fullLocation : derivedMaskedLocation;

  if (!displayLocation && !fullLocation) {
    return null;
  }

  const iconClasses = iconSize === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  // If user is not logged in, show masked location with lock indicator
  if (!user) {
    return (
      <div className={cn('flex items-center gap-1 text-muted-foreground', className)}>
        {showIcon && <MapPin className={cn(iconClasses, 'text-primary')} />}
        <span className="truncate">{derivedMaskedLocation || 'Location hidden'}</span>
        <span title="Sign in to view details">
          <Lock className="h-3 w-3 ml-1 opacity-50" />
        </span>
      </div>
    );
  }

  // If user is logged in but hasn't revealed yet
  if (!isRevealed && allowReveal && fullLocation && fullLocation !== derivedMaskedLocation) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {showIcon && <MapPin className={cn(iconClasses, 'text-primary')} />}
        <span className="truncate text-muted-foreground">{derivedMaskedLocation || 'Location available'}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 ml-1 text-xs"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsRevealed(true);
          }}
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
      </div>
    );
  }

  // Full location revealed (or no difference between masked and full)
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {showIcon && <MapPin className={cn(iconClasses, 'text-primary')} />}
      <span className="truncate">{displayLocation}</span>
      {isRevealed && allowReveal && fullLocation !== derivedMaskedLocation && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 ml-1 text-xs text-muted-foreground"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsRevealed(false);
          }}
        >
          <EyeOff className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

/**
 * Derives a general area from a full location string.
 * Extracts city/town from typical "Street, City, ZIP" format.
 */
function deriveGeneralArea(fullLocation: string): string {
  const parts = fullLocation.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    // Return the second part (usually city/town)
    return parts[1];
  }
  
  // If single part, try to mask specific details
  // Remove specific street numbers and zip codes
  const masked = fullLocation
    .replace(/^\d+\s+/, '') // Remove leading numbers
    .replace(/\b\d{5}(-\d{4})?\b/g, '') // Remove US zip codes
    .replace(/\b[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2}\b/gi, '') // Remove UK-style postcodes
    .replace(/\b\d{5}(-\d{4})?\b/g, '') // Remove US zip codes
    .trim();
  
  return masked || 'General Area';
}

export default MaskedLocation;
