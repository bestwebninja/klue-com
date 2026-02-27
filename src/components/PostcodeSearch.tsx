import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, MapPin } from 'lucide-react';
import { z } from 'zod';
import { UK_POSTCODE_REGEX, formatUKPostcode } from '@/lib/postcodeValidation';

const postcodeSchema = z.string()
  .trim()
  .min(1, "Please enter a postcode")
  .max(10, "Postcode too long")
  .regex(UK_POSTCODE_REGEX, "Please enter a valid UK postcode");

interface PostcodeSearchProps {
  onLocationFound: (lat: number, lng: number, postcode: string) => void;
  placeholder?: string;
  className?: string;
  /** @deprecated No longer needed - kept for backwards compat */
  mapboxToken?: string;
}

export const PostcodeSearch = ({
  onLocationFound,
  placeholder = "Enter postcode...",
  className = "",
}: PostcodeSearchProps) => {
  const [postcode, setPostcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    setError(null);

    const validationResult = postcodeSchema.safeParse(postcode);
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    const cleanedPostcode = formatUKPostcode(validationResult.data);

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanedPostcode)}&countrycodes=gb&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search for postcode');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        onLocationFound(lat, lng, cleanedPostcode);
        setPostcode('');
      } else {
        setError('Postcode not found');
      }
    } catch (err) {
      console.error('Postcode search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [postcode, onLocationFound]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={postcode}
            onChange={(e) => {
              setPostcode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-[140px] pl-8 h-9 bg-background/90 backdrop-blur-sm shadow-sm uppercase"
            maxLength={10}
            disabled={isSearching}
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleSearch}
          disabled={isSearching || !postcode.trim()}
          className="h-9 px-3 shadow-sm"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive bg-background/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
          {error}
        </p>
      )}
    </div>
  );
};

export default PostcodeSearch;
