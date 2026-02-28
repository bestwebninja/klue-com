import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Filter, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PostcodeSearch } from '@/components/PostcodeSearch';
import { getCategoryStyle } from '@/lib/mapCategoryStyle';
import { ProviderMapPopup } from '@/components/map';

interface ProviderWithLocation {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  latitude: number;
  longitude: number;
  city: string | null;
  postcode: string | null;
  services: string[];
  primary_service: string | null;
}

interface ProvidersMapProps {
  providers: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    services: { category_name: string; custom_name: string | null }[];
    locations: { city: string | null; postcode: string | null }[];
  }[];
}

function FlyToLocation({ target }: { target: { lat: number; lng: number; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    }
  }, [bounds, map]);
  return null;
}

export const ProvidersMap = ({ providers }: ProvidersMapProps) => {
  const [providersWithCoords, setProvidersWithCoords] = useState<ProviderWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    providers.forEach(p => {
      p.services.forEach(s => categorySet.add(s.category_name));
    });
    return Array.from(categorySet).sort();
  }, [providers]);

  const filteredProviders = useMemo(() => {
    let filtered = providersWithCoords;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provider =>
        provider.full_name?.toLowerCase().includes(query) ||
        provider.city?.toLowerCase().includes(query) ||
        provider.services.some(s => s.toLowerCase().includes(query))
      );
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(provider =>
        provider.services.some(service => selectedCategories.includes(service))
      );
    }
    return filtered;
  }, [providersWithCoords, selectedCategories, searchQuery]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const clearCategoryFilters = () => setSelectedCategories([]);

  // Fetch provider locations
  useEffect(() => {
    const fetchProviderLocations = async () => {
      if (providers.length === 0) {
        setProvidersWithCoords([]);
        setIsLoading(false);
        return;
      }
      try {
        const providerIds = providers.map(p => p.id);
        const { data: locationsData, error } = await supabase
          .rpc('get_public_provider_locations', { provider_ids: providerIds });
        if (error) throw error;

        const validLocations = (locationsData || []).filter(
          (loc: any) => loc.latitude !== null && loc.longitude !== null
        );
        const providerLocationMap = new Map<string, any>();
        validLocations.forEach((loc: any) => {
          const existing = providerLocationMap.get(loc.provider_id);
          if (!existing || (loc.is_primary && !existing.is_primary)) {
            providerLocationMap.set(loc.provider_id, loc);
          }
        });

        const providersWithLocs: ProviderWithLocation[] = [];
        providers.forEach(provider => {
          const location = providerLocationMap.get(provider.id);
          if (location?.latitude && location?.longitude) {
            providersWithLocs.push({
              id: provider.id,
              full_name: provider.full_name,
              avatar_url: provider.avatar_url,
              bio: provider.bio,
              latitude: Number(location.latitude),
              longitude: Number(location.longitude),
              city: location.city,
              postcode: location.postcode,
              services: provider.services.map(s => s.category_name),
              primary_service: provider.services?.[0]?.category_name || null,
            });
          }
        });
        setProvidersWithCoords(providersWithLocs);
      } catch (err) {
        console.error('Error fetching provider locations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProviderLocations();
  }, [providers]);

  const bounds = useMemo(() => {
    if (filteredProviders.length === 0) return null;
    const latLngs = filteredProviders.map(p => [p.latitude, p.longitude] as [number, number]);
    return L.latLngBounds(latLngs);
  }, [filteredProviders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (providersWithCoords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-muted rounded-lg">
        <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No locations to display</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          No service providers have added their location coordinates yet. Try the list view to see all providers.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="w-full h-[500px] rounded-lg border border-border overflow-hidden">
        <MapContainer
          center={[39.8, -98.5]}
          zoom={4}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FlyToLocation target={flyTarget} />
          <FitBounds bounds={bounds} />

          {filteredProviders.map((provider) => {
            const style = getCategoryStyle(provider.primary_service);
            return (
              <CircleMarker
                key={provider.id}
                center={[provider.latitude, provider.longitude]}
                radius={10}
                pathOptions={{
                  fillColor: style.color,
                  color: '#fff',
                  weight: 2,
                  fillOpacity: 0.9,
                }}
              >
                <Popup>
                  <ProviderMapPopup
                    id={provider.id}
                    fullName={provider.full_name}
                    avatarUrl={provider.avatar_url}
                    city={provider.city}
                    postcode={provider.postcode}
                    services={provider.services.slice(0, 3).join(', ')}
                  />
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      
      {/* Search controls */}
      <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap z-[1000]">
        <PostcodeSearch
          onLocationFound={(lat, lng) => {
            setFlyTarget({ lat, lng, zoom: 13 });
          }}
          placeholder="Zoom to ZIP code..."
        />
        
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[180px] pl-8 h-9 bg-background/90 backdrop-blur-sm shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        
        <div className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm text-foreground shadow-sm">
          {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filter toggle button */}
      <Button
        variant={showFilters ? "default" : "secondary"}
        size="sm"
        className="absolute top-3 right-14 shadow-sm z-[1000]"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="w-4 h-4 mr-1" />
        Filter
        {selectedCategories.length > 0 && (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs bg-background text-foreground">
            {selectedCategories.length}
          </Badge>
        )}
      </Button>

      {/* Category filter panel */}
      {showFilters && allCategories.length > 0 && (
        <div className="absolute top-14 right-3 bg-background border border-border rounded-lg shadow-lg p-3 max-w-[280px] max-h-[300px] overflow-y-auto z-[1000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Filter by Service</span>
            {selectedCategories.length > 0 && (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearCategoryFilters}>
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allCategories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvidersMap;
