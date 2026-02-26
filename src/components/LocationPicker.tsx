import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Loader2, AlertCircle } from 'lucide-react';
import { isValidUKPostcode, formatUKPostcode } from '@/lib/postcodeValidation';

interface LocationPickerProps {
  onLocationSelect: (location: {
    address: string;
    city: string;
    postcode: string;
    latitude: number;
    longitude: number;
  }) => void;
  initialLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  placeholder?: string;
  className?: string;
}

export const LocationPicker = ({
  onLocationSelect,
  initialLocation,
  placeholder = "Search for a location...",
  className = "",
}: LocationPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const { token: mapboxToken, error, isLoading: tokenLoading } = useMapboxToken();
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [postcodeWarning, setPostcodeWarning] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || tokenLoading) return;

    mapboxgl.accessToken = mapboxToken;

    const initialCenter: [number, number] = initialLocation?.longitude && initialLocation?.latitude
      ? [initialLocation.longitude, initialLocation.latitude]
      : [-0.1276, 51.5074]; // Default to London

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker
    marker.current = new mapboxgl.Marker({ color: '#2563eb', draggable: true })
      .setLngLat(initialCenter)
      .addTo(map.current);

    // Handle marker drag
    marker.current.on('dragend', async () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        await reverseGeocode(lngLat.lng, lngLat.lat);
      }
    });

    // Handle map click
    map.current.on('click', async (e) => {
      marker.current?.setLngLat(e.lngLat);
      await reverseGeocode(e.lngLat.lng, e.lngLat.lat);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, tokenLoading]);

  const reverseGeocode = async (lng: number, lat: number) => {
    if (!mapboxToken) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=address,place,postcode`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];
        
        const address = feature.place_name || '';
        const city = context.find((c: any) => c.id.startsWith('place'))?.text || 
                    context.find((c: any) => c.id.startsWith('locality'))?.text || '';
        
        // Extract postcode: check if feature itself is a postcode, then check context
        let postcode = '';
        if (feature.place_type?.includes('postcode')) {
          postcode = feature.text || '';
        } else {
          postcode = context.find((c: any) => c.id.startsWith('postcode'))?.text || '';
        }

        // Validate and format the postcode
        if (postcode && isValidUKPostcode(postcode)) {
          postcode = formatUKPostcode(postcode);
          setPostcodeWarning(null);
        } else if (postcode) {
          setPostcodeWarning('Invalid UK postcode format detected');
        } else {
          setPostcodeWarning('No postcode found for this location. Please search for a specific UK postcode.');
        }

        setSearchQuery(address);
        onLocationSelect({
          address,
          city,
          postcode: postcode && isValidUKPostcode(postcode) ? formatUKPostcode(postcode) : postcode,
          latitude: lat,
          longitude: lng,
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.length < 3 || !mapboxToken) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=gb&types=address,place,postcode&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [mapboxToken]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchLocation(searchQuery);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchLocation]);

  const selectSuggestion = (feature: any) => {
    const [lng, lat] = feature.center;
    const context = feature.context || [];
    
    const address = feature.place_name || '';
    
    // Extract city from context or feature
    let city = context.find((c: any) => c.id.startsWith('place'))?.text || 
               context.find((c: any) => c.id.startsWith('locality'))?.text || '';
    
    // Extract postcode: check if feature itself is a postcode, then check context
    let postcode = '';
    if (feature.place_type?.includes('postcode')) {
      postcode = feature.text || '';
      // For postcodes, the place is usually in context
      if (!city) {
        city = context.find((c: any) => c.id.startsWith('place'))?.text || '';
      }
    } else {
      postcode = context.find((c: any) => c.id.startsWith('postcode'))?.text || '';
      // If feature is a place, use it as city
      if (feature.place_type?.includes('place') && !city) {
        city = feature.text || '';
      }
    }

    // Validate and format the postcode
    if (postcode && isValidUKPostcode(postcode)) {
      postcode = formatUKPostcode(postcode);
      setPostcodeWarning(null);
    } else if (postcode) {
      setPostcodeWarning('Invalid UK postcode format detected');
    } else {
      setPostcodeWarning('No postcode found. Please search for a specific UK postcode (e.g., SW1A 1AA).');
    }

    setSearchQuery(address);
    setSuggestions([]);
    setShowSuggestions(false);

    // Update map and marker
    if (map.current && marker.current) {
      map.current.flyTo({ center: [lng, lat], zoom: 15 });
      marker.current.setLngLat([lng, lat]);
    }

    onLocationSelect({
      address,
      city,
      postcode: postcode && isValidUKPostcode(postcode) ? formatUKPostcode(postcode) : postcode,
      latitude: lat,
      longitude: lng,
    });
  };

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 bg-muted rounded-lg ${className}`}>
        <MapPin className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="pl-10 pr-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((feature) => (
              <button
                key={feature.id}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(feature);
                }}
              >
                <MapPin className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <span className="truncate">{feature.place_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Postcode validation warning */}
      {postcodeWarning && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{postcodeWarning}</span>
        </div>
      )}

      {/* Map container */}
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="w-full h-64 rounded-lg border border-border overflow-hidden"
        />
        <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
          Click or drag marker to set location
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
