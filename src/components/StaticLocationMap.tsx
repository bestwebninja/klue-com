import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Fix default marker icon issue in Leaflet + bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
  const [coordinates, setCoordinates] = useState<[number, number] | null>(
    cachedLat && cachedLng ? [cachedLat, cachedLng] : null
  );
  const [isLoading, setIsLoading] = useState(!cachedLat || !cachedLng);
  const [error, setError] = useState(false);

  // Use cached coordinates if available
  useEffect(() => {
    if (cachedLat && cachedLng) {
      setCoordinates([cachedLat, cachedLng]);
      setIsLoading(false);
    }
  }, [cachedLat, cachedLng]);

  // Geocode location only if no cached coordinates
  useEffect(() => {
    const geocodeLocation = async () => {
      if (cachedLat && cachedLng) return;
      if (!location) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('geocode-location', {
          body: { location },
        });

        if (fnError) throw fnError;

        if (data?.success && data.latitude && data.longitude) {
          setCoordinates([data.latitude, data.longitude]);
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
  }, [location, cachedLat, cachedLng]);

  if (!location) {
    return null;
  }

  if (isLoading) {
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
      <MapContainer
        center={coordinates}
        zoom={12}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={coordinates} />
      </MapContainer>
      <div className="absolute bottom-1 left-1 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs text-muted-foreground z-[1000]">
        {location}
      </div>
    </div>
  );
};

export default StaticLocationMap;
