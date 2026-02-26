import { useState, useEffect, useCallback } from 'react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MapPin, Navigation, Loader2, X } from 'lucide-react';

interface DistanceFilterProps {
  onFilterChange: (filter: {
    latitude: number;
    longitude: number;
    radius: number;
    locationName: string;
  } | null) => void;
}

const RADIUS_OPTIONS = [
  { value: '5', label: '5 miles' },
  { value: '10', label: '10 miles' },
  { value: '25', label: '25 miles' },
  { value: '50', label: '50 miles' },
  { value: '100', label: '100 miles' },
];

export const DistanceFilter = ({ onFilterChange }: DistanceFilterProps) => {
  const { token: mapboxToken, isLoading: tokenLoading } = useMapboxToken();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);
  const [radius, setRadius] = useState('25');
  const [isOpen, setIsOpen] = useState(false);

  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.length < 3 || !mapboxToken || tokenLoading) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=gb&types=place,postcode,locality&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [mapboxToken, tokenLoading]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchLocation(searchQuery);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchLocation]);

  const selectSuggestion = (feature: any) => {
    const [lng, lat] = feature.center;
    const name = feature.text || feature.place_name;
    
    setSelectedLocation({ latitude: lat, longitude: lng, name });
    setSearchQuery(name);
    setSuggestions([]);
    setShowSuggestions(false);
    
    onFilterChange({
      latitude: lat,
      longitude: lng,
      radius: parseInt(radius),
      locationName: name,
    });
  };

  const handleRadiusChange = (newRadius: string) => {
    setRadius(newRadius);
    if (selectedLocation) {
      onFilterChange({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        radius: parseInt(newRadius),
        locationName: selectedLocation.name,
      });
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get location name
        if (mapboxToken) {
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&types=place,locality`
            );
            const data = await response.json();
            const name = data.features?.[0]?.text || 'Your location';
            
            setSelectedLocation({ latitude, longitude, name });
            setSearchQuery(name);
            onFilterChange({
              latitude,
              longitude,
              radius: parseInt(radius),
              locationName: name,
            });
          } catch (err) {
            setSelectedLocation({ latitude, longitude, name: 'Your location' });
            setSearchQuery('Your location');
            onFilterChange({
              latitude,
              longitude,
              radius: parseInt(radius),
              locationName: 'Your location',
            });
          }
        }
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
      }
    );
  };

  const clearFilter = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSuggestions([]);
    onFilterChange(null);
    setIsOpen(false);
  };

  const hasFilter = selectedLocation !== null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={hasFilter ? "default" : "outline"} 
          className="shrink-0 gap-2"
        >
          <Navigation className="w-4 h-4" />
          {hasFilter ? (
            <span className="max-w-[120px] truncate">
              {selectedLocation.name} ({radius}mi)
            </span>
          ) : (
            'Distance'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filter by distance</h4>
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={clearFilter} className="h-auto p-1">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Location search */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                if (selectedLocation) {
                  setSelectedLocation(null);
                  onFilterChange(null);
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Enter city or postcode..."
              className="pl-10 pr-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}

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

          {/* Use current location button */}
          <Button
            variant="outline"
            size="sm"
            onClick={useCurrentLocation}
            disabled={isLocating}
            className="w-full"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-2" />
            )}
            Use my current location
          </Button>

          {/* Radius selector */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Search radius</label>
            <Select value={radius} onValueChange={handleRadiusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasFilter && (
            <p className="text-xs text-muted-foreground text-center">
              Showing providers within {radius} miles of {selectedLocation.name}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DistanceFilter;
