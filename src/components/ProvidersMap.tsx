import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Loader2, MapPin, Filter, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PostcodeSearch } from '@/components/PostcodeSearch';
import { getCategoryStyle } from '@/lib/mapCategoryStyle';
import { useReactMapPopup, ProviderMapPopup } from '@/components/map';

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

export const ProvidersMap = ({ providers }: ProvidersMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { token: mapboxToken, error: tokenError, isLoading: tokenLoading } = useMapboxToken();
  const [providersWithCoords, setProvidersWithCoords] = useState<ProviderWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { showPopup, closePopup } = useReactMapPopup();

  // Extract unique categories from providers
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    providers.forEach(p => {
      p.services.forEach(s => {
        categorySet.add(s.category_name);
      });
    });
    return Array.from(categorySet).sort();
  }, [providers]);

  // Filter providers by selected categories and search query
  const filteredProviders = useMemo(() => {
    let filtered = providersWithCoords;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provider =>
        provider.full_name?.toLowerCase().includes(query) ||
        provider.city?.toLowerCase().includes(query) ||
        provider.services.some(s => s.toLowerCase().includes(query))
      );
    }
    
    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(provider =>
        provider.services.some(service => selectedCategories.includes(service))
      );
    }
    
    return filtered;
  }, [providersWithCoords, selectedCategories, searchQuery]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearCategoryFilters = () => {
    setSelectedCategories([]);
  };

  // Fetch provider locations with coordinates using the secure public function
  useEffect(() => {
    const fetchProviderLocations = async () => {
      if (providers.length === 0) {
        setProvidersWithCoords([]);
        setIsLoading(false);
        return;
      }

      try {
        const providerIds = providers.map(p => p.id);
        
        // Use the public function that only returns city/postcode (no full addresses)
        const { data: locationsData, error } = await supabase
          .rpc('get_public_provider_locations', { provider_ids: providerIds });

        if (error) throw error;

        // Filter to only locations with coordinates and get primary or first location for each provider
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
          if (location && location.latitude && location.longitude) {
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

  // Initialize map with clustering
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || isLoading || tokenLoading) return;

    mapboxgl.accessToken = mapboxToken;

    // Default to UK center
    const defaultCenter: [number, number] = [-1.5, 53.5];
    const defaultZoom = 5;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter,
      zoom: defaultZoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, isLoading, tokenLoading]);

  // Update map data when filtered providers change
  useEffect(() => {
    if (!map.current) return;

    const updateMapData = () => {
      if (!map.current?.isStyleLoaded()) return;

      // Create GeoJSON from filtered providers
      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: filteredProviders.map(provider => ({
          type: 'Feature',
          properties: {
            id: provider.id,
            full_name: provider.full_name || 'Service Provider',
            avatar_url: provider.avatar_url,
            city: provider.city,
            postcode: provider.postcode,
            services: provider.services.slice(0, 3).join(', '),
            categoryColor: getCategoryStyle(provider.primary_service).color,
            categoryIcon: getCategoryStyle(provider.primary_service).icon,
          },
          geometry: {
            type: 'Point',
            coordinates: [provider.longitude, provider.latitude],
          },
        })),
      };

      // Update or add source
      const source = map.current.getSource('providers') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geojsonData);
      } else {
        // No clustering - show each provider as individual marker with postcode
        map.current.addSource('providers', {
          type: 'geojson',
          data: geojsonData,
        });

        // Individual provider markers
        map.current.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'providers',
          paint: {
            'circle-color': ['get', 'categoryColor'],
            'circle-radius': 10,
            'circle-stroke-width': 2,
            'circle-stroke-color': 'hsl(var(--background))',
          },
        });

        // Category icon at the center of each provider marker
        map.current.addLayer({
          id: 'provider-category-icon',
          type: 'symbol',
          source: 'providers',
          layout: {
            'text-field': ['get', 'categoryIcon'],
            'text-size': 13,
            'text-anchor': 'center',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: {
            'text-color': 'hsl(var(--background))',
            'text-halo-color': ['get', 'categoryColor'],
            'text-halo-width': 2,
          },
        });

        // Postcode label for each provider
        map.current.addLayer({
          id: 'provider-postcode-label',
          type: 'symbol',
          source: 'providers',
          layout: {
            'text-field': ['get', 'postcode'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 11,
            'text-offset': [0, 1.8],
            'text-anchor': 'top',
            'text-allow-overlap': false,
            'text-ignore-placement': false,
          },
          paint: {
            'text-color': 'hsl(var(--foreground))',
            'text-halo-color': 'hsl(var(--background))',
            'text-halo-width': 1.5,
          },
        });

        // No cluster click handler needed - each provider is individual

        // Click on individual provider
        map.current.on('click', 'unclustered-point', (e) => {
          if (!e.features?.length || !map.current) return;
          const properties = e.features[0].properties;
          const geometry = e.features[0].geometry as GeoJSON.Point;
          
          // Render React popup
          showPopup(
            map.current,
            geometry.coordinates as [number, number],
            <ProviderMapPopup
              id={properties?.id}
              fullName={properties?.full_name}
              avatarUrl={properties?.avatar_url}
              city={properties?.city}
              postcode={properties?.postcode}
              services={properties?.services || ''}
            />
          );
        });

        // No cluster hover handlers needed
        map.current.on('mouseenter', 'unclustered-point', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current.on('mouseleave', 'unclustered-point', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
      }

      // Fit bounds to show all filtered providers
      if (filteredProviders.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        filteredProviders.forEach(p => bounds.extend([p.longitude, p.latitude]));
        map.current.fitBounds(bounds, { padding: 60, maxZoom: 12 });
      }
    };

    if (map.current.isStyleLoaded()) {
      updateMapData();
    } else {
      map.current.on('load', updateMapData);
    }
  }, [filteredProviders, showPopup]);

  if (isLoading || tokenLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-muted rounded-lg">
        <MapPin className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">{tokenError}</p>
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
      <div ref={mapContainer} className="w-full h-[500px] rounded-lg border border-border overflow-hidden" />
      
      {/* Search controls */}
      <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
        {/* Postcode search */}
        {mapboxToken && (
          <PostcodeSearch
            mapboxToken={mapboxToken}
            onLocationFound={(lat, lng, postcode) => {
              if (map.current) {
                map.current.flyTo({
                  center: [lng, lat],
                  zoom: 13,
                  duration: 1500,
                });
              }
            }}
            placeholder="Zoom to postcode..."
          />
        )}
        
        {/* Provider search */}
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
        
        {/* Provider count */}
        <div className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm text-foreground shadow-sm">
          {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filter toggle button */}
      <Button
        variant={showFilters ? "default" : "secondary"}
        size="sm"
        className="absolute top-3 right-14 shadow-sm"
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
        <div className="absolute top-14 right-3 bg-background border border-border rounded-lg shadow-lg p-3 max-w-[280px] max-h-[300px] overflow-y-auto z-10">
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
