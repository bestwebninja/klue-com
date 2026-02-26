import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { MapPin, Loader2 } from 'lucide-react';

interface StaticLocationMapProps {
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  className?: string;
}

export const StaticLocationMap = ({ 
  location, 
  latitude: cachedLat, 
  longitude: cachedLng,
  className = '' 
}: StaticLocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { token: mapboxToken, error: tokenError, isLoading: tokenLoading } = useMapboxToken();
  const [coordinates, setCoordinates] = useState<[number, number] | null>(
    cachedLat && cachedLng ? [cachedLng, cachedLat] : null
  );
  const [isLoading, setIsLoading] = useState(!cachedLat || !cachedLng);
  const [error, setError] = useState(false);

  // Use cached coordinates if available
  useEffect(() => {
    if (cachedLat && cachedLng) {
      setCoordinates([cachedLng, cachedLat]);
      setIsLoading(false);
    }
  }, [cachedLat, cachedLng]);

  // Set error if token is not available
  useEffect(() => {
    if (tokenError) {
      setError(true);
    }
  }, [tokenError]);

  // Geocode location only if no cached coordinates
  useEffect(() => {
    const geocodeLocation = async () => {
      // Skip if we have cached coordinates or token is still loading
      if (cachedLat && cachedLng) {
        return;
      }
      
      if (tokenLoading) {
        return;
      }
      
      if (!mapboxToken || !location) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxToken}&country=gb&limit=1`
        );
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          setCoordinates([lng, lat]);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    geocodeLocation();
  }, [mapboxToken, location, cachedLat, cachedLng, tokenLoading]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !coordinates) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: coordinates,
      zoom: 12,
      interactive: false, // Static map - no interaction
      attributionControl: false,
    });

    // Add marker
    new mapboxgl.Marker({ color: '#2563eb' })
      .setLngLat(coordinates)
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, coordinates]);

  if (!location) {
    return null;
  }

  if (isLoading || tokenLoading) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <div className="text-center p-2">
          <MapPin className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">{location}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden border border-border ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute bottom-1 left-1 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs text-muted-foreground">
        {location}
      </div>
    </div>
  );
};

export default StaticLocationMap;
