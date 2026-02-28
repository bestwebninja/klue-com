import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, AlertCircle } from 'lucide-react';
import { isValidUSZipCode, formatUSZipCode } from '@/lib/zipCodeValidation';

// Fix default marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

// Component to handle map click events
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to fly map to a position
function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);
  return null;
}

export const LocationPicker = ({
  onLocationSelect,
  initialLocation,
  placeholder = "Search for a location...",
  className = "",
}: LocationPickerProps) => {
  const initialCenter: [number, number] = initialLocation?.latitude && initialLocation?.longitude
    ? [initialLocation.latitude, initialLocation.longitude]
    : [39.8283, -98.5795]; // Default to center of US

  const [markerPosition, setMarkerPosition] = useState<[number, number]>(initialCenter);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [zipCodeWarning, setZipCodeWarning] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.address) {
        const address = data.display_name || '';
        const city = data.address.city || data.address.town || data.address.village || '';
        let zipCode = data.address.postcode || '';

        if (zipCode && isValidUSZipCode(zipCode)) {
          zipCode = formatUSZipCode(zipCode);
          setZipCodeWarning(null);
        } else if (zipCode) {
          setZipCodeWarning('Invalid US ZIP code format detected');
        } else {
          setZipCodeWarning('No ZIP code found for this location. Please search for a specific US ZIP code.');
        }

        setSearchQuery(address);
        onLocationSelect({
          address,
          city,
          postcode: zipCode && isValidUSZipCode(zipCode) ? formatUSZipCode(zipCode) : zipCode,
          latitude: lat,
          longitude: lng,
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchLocation(searchQuery);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchLocation]);

  const selectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const address = item.display_name || '';
    const city = item.address?.city || item.address?.town || item.address?.village || '';
    let zipCode = item.address?.postcode || '';

    if (zipCode && isValidUSZipCode(zipCode)) {
      zipCode = formatUSZipCode(zipCode);
      setZipCodeWarning(null);
    } else if (zipCode) {
      setZipCodeWarning('Invalid US ZIP code format detected');
    } else {
      setZipCodeWarning('No ZIP code found. Please search for a specific US ZIP code (e.g., 90210).');
    }

    setSearchQuery(address);
    setSuggestions([]);
    setShowSuggestions(false);
    setMarkerPosition([lat, lng]);
    setFlyTarget([lat, lng]);

    onLocationSelect({
      address,
      city,
      postcode: zipCode && isValidUSZipCode(zipCode) ? formatUSZipCode(zipCode) : zipCode,
      latitude: lat,
      longitude: lng,
    });
  };

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
            {suggestions.map((item, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(item);
                }}
              >
                <MapPin className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <span className="truncate">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ZIP code validation warning */}
      {zipCodeWarning && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{zipCodeWarning}</span>
        </div>
      )}

      {/* Map container */}
      <div className="relative">
        <div className="w-full h-64 rounded-lg border border-border overflow-hidden">
          <MapContainer
            center={initialCenter}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={markerPosition}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const latlng = e.target.getLatLng();
                  setMarkerPosition([latlng.lat, latlng.lng]);
                  reverseGeocode(latlng.lat, latlng.lng);
                },
              }}
            />
            <MapClickHandler onLocationSelect={handleMapClick} />
            <FlyTo position={flyTarget} />
          </MapContainer>
        </div>
        <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground z-[1000]">
          Click or drag marker to set location
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
