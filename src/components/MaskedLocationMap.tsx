import { useState } from 'react';
import { MapPin, Eye, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { StaticLocationMap } from './StaticLocationMap';
import { cn } from '@/lib/utils';

interface MaskedLocationMapProps {
  /** The full location string */
  location: string;
  /** Masked/general area version of the location */
  maskedLocation?: string;
  /** Exact latitude (only used when revealed) */
  latitude?: number | null;
  /** Exact longitude (only used when revealed) */
  longitude?: number | null;
  /** Additional class names */
  className?: string;
}

/**
 * Displays a location map with privacy protection.
 * - Public/unauthenticated users see only a placeholder with general area
 * - Authenticated users can click to reveal the exact location on map
 */
export function MaskedLocationMap({
  location,
  maskedLocation,
  latitude,
  longitude,
  className = '',
}: MaskedLocationMapProps) {
  const { user } = useAuth();
  const [isRevealed, setIsRevealed] = useState(false);

  // Derive masked location if not provided
  const generalArea = maskedLocation || deriveGeneralArea(location);

  if (!location) {
    return null;
  }

  // If user is not logged in, show placeholder
  if (!user) {
    return (
      <div className={cn('flex items-center justify-center bg-muted rounded-lg', className)}>
        <div className="text-center p-4">
          <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground font-medium">{generalArea}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" />
            Sign in to view exact location
          </p>
        </div>
      </div>
    );
  }

  // If user is logged in but hasn't revealed yet
  if (!isRevealed) {
    return (
      <div className={cn('flex items-center justify-center bg-muted rounded-lg', className)}>
        <div className="text-center p-4">
          <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground font-medium">{generalArea}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsRevealed(true);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Exact Location
          </Button>
        </div>
      </div>
    );
  }

  // Full map revealed
  return (
    <StaticLocationMap
      location={location}
      latitude={latitude}
      longitude={longitude}
      className={className}
    />
  );
}

/**
 * Derives a general area from a full location string.
 */
function deriveGeneralArea(fullLocation: string): string {
  const parts = fullLocation.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    return parts[1];
  }
  
  const masked = fullLocation
    .replace(/^\d+\s+/, '')
    .replace(/\b[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2}\b/gi, '')
    .replace(/\b\d{5}(-\d{4})?\b/g, '')
    .trim();
  
  return masked || 'General Area';
}

export default MaskedLocationMap;
