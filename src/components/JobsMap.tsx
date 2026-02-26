import { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DistanceFilter } from '@/components/DistanceFilter';
import { PostcodeSearch } from '@/components/PostcodeSearch';
import { calculateDistance } from '@/lib/distance';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { getCategoryStyle } from '@/lib/mapCategoryStyle';
import { useReactMapPopup, JobMapPopup } from '@/components/map';

interface JobWithLocation {
  id: string;
  title: string;
  description: string;
  location: string | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
  category_id: string | null;
  category_name: string | null;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface DistanceFilterState {
  latitude: number;
  longitude: number;
  radius: number;
  locationName: string;
}

interface JobsMapProps {
  selectedCategoryId?: string | null;
  categories?: { id: string; name: string; parent_id: string | null }[];
  autoLocateNonce?: number;
}

// Category color palette - accessible, distinct colors using HSL
const CATEGORY_COLORS: Record<string, string> = {
  // Home & Renovation (warm tones)
  'Home DIY and Renovation': 'hsl(var(--cat-home))',
  'Handyman': 'hsl(var(--cat-home))',
  'Electrician': 'hsl(var(--cat-home))',
  'Plumber': 'hsl(var(--cat-home))',
  'Carpenter': 'hsl(var(--cat-home))',
  'Painter': 'hsl(var(--cat-home))',
  'Renovation': 'hsl(var(--cat-home))',
  'Builder': 'hsl(var(--cat-home))',
  // Commercial (cool professional tones)
  'Commercial Renovations and Services': 'hsl(var(--cat-commercial))',
  'Shopfitting': 'hsl(var(--cat-commercial))',
  'Maintenance Service': 'hsl(var(--cat-commercial))',
  'Cleaning Service': 'hsl(var(--cat-commercial))',
  // Events (vibrant, festive)
  'Events and Catering': 'hsl(var(--cat-events))',
  'Catering': 'hsl(var(--cat-events))',
  'Photography': 'hsl(var(--cat-events))',
  'DJ': 'hsl(var(--cat-events))',
  'Wedding Planning': 'hsl(var(--cat-events))',
  // Health & Fitness (calming, wellness)
  'Health and Fitness': 'hsl(var(--cat-health))',
  'Personal Trainer': 'hsl(var(--cat-health))',
  'Massage Therapy': 'hsl(var(--cat-health))',
  // Agriculture & Transport (earthy, industrial)
  'Agriculture, Moving and Transport': 'hsl(var(--cat-transport))',
  'Commercial Movers': 'hsl(var(--cat-transport))',
  'Courier Services': 'hsl(var(--cat-transport))',
  // Pets (friendly, approachable)
  'Pets Services': 'hsl(var(--cat-pets))',
  'Dog Training': 'hsl(var(--cat-pets))',
  'Pet Sitting': 'hsl(var(--cat-pets))',
  // Business Services (professional blues)
  'Business Services': 'hsl(var(--cat-business))',
  'Accounting': 'hsl(var(--cat-business))',
  'Consulting': 'hsl(var(--cat-business))',
  // IT Services (tech purples/blues)
  'IT Services': 'hsl(var(--cat-it))',
  'Web Design': 'hsl(var(--cat-it))',
  'Software Development': 'hsl(var(--cat-it))',
  'SEO Service': 'hsl(var(--cat-it))',
  // Legal (authoritative, trustworthy)
  'Legal Services': 'hsl(var(--cat-legal))',
  // Lessons (educational greens)
  'Lessons': 'hsl(var(--cat-lessons))',
  'Language Lessons': 'hsl(var(--cat-lessons))',
  'Academic Lessons': 'hsl(var(--cat-lessons))',
};

const DEFAULT_PIN_COLOR = 'hsl(var(--primary))';

const getCategoryColor = (categoryName: string | null): string => {
  if (!categoryName) return DEFAULT_PIN_COLOR;
  // Prefer theme-token based category style (keeps map consistent with design system)
  const themed = getCategoryStyle(categoryName);
  if (themed?.color) return themed.color;
  // Direct match
  if (CATEGORY_COLORS[categoryName]) return CATEGORY_COLORS[categoryName];
  // Partial match (for subcategories)
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(categoryName.toLowerCase())) {
      return color;
    }
  }
  return DEFAULT_PIN_COLOR;
};

export interface JobsMapHandle {
  flyToJob: (lat: number, lng: number) => void;
}

const JobsMapComponent = forwardRef<JobsMapHandle, JobsMapProps>(function JobsMap({ selectedCategoryId, categories, autoLocateNonce }, ref) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { token: mapboxToken, error: tokenError, isLoading: tokenLoading } = useMapboxToken();
  const [jobs, setJobs] = useState<JobWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilterState | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { isProvider, loading: roleLoading } = useUserRole();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const { showPopup, closePopup } = useReactMapPopup();

  // Fetch provider subscription status
  useEffect(() => {
    if (!user || !isProvider) {
      setSubscriptionStatus(null);
      return;
    }
    
    const fetchSubscription = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .maybeSingle();
      
      setSubscriptionStatus(data?.subscription_status || 'free');
    };
    
    fetchSubscription();
  }, [user, isProvider]);

  // Expose flyToJob method via ref
  useImperativeHandle(ref, () => ({
    flyToJob: (lat: number, lng: number) => {
      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: 14,
          duration: 1500,
        });
      }
    },
  }));

  // Fetch jobs with coordinates using RPC function for proper access
  useEffect(() => {
    const fetchJobsWithCoords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_public_job_listings_with_coords');

        if (error) throw error;

        const rawJobs: JobWithLocation[] = (data || [])
          .filter((job: any) => job.latitude && job.longitude)
          .map((job: any) => ({
            id: job.id,
            title: job.title,
            description: job.description,
            location: job.location,
            budget_min: job.budget_min,
            budget_max: job.budget_max,
            created_at: job.created_at,
            category_id: job.category_id || null,
            category_name: job.category_name || null,
            latitude: Number(job.latitude),
            longitude: Number(job.longitude),
          }));

        // If multiple jobs share identical coordinates, slightly offset them so each
        // job has its own visible marker (deterministic, small radius).
        const countsByCoord = new Map<string, number>();
        const jobsWithOffsets: JobWithLocation[] = rawJobs.map((job) => {
          const key = `${job.latitude.toFixed(5)}:${job.longitude.toFixed(5)}`;
          const idx = countsByCoord.get(key) ?? 0;
          countsByCoord.set(key, idx + 1);

          if (idx === 0) return job;

          // Spiral-ish deterministic offset: ~10–50m depending on overlap count
          const ring = Math.floor((idx - 1) / 8) + 1;
          const posInRing = (idx - 1) % 8;
          const angle = (posInRing / 8) * Math.PI * 2;
          const base = 0.00012; // ~13m latitude
          const r = base * ring;
          const latOffset = Math.sin(angle) * r;
          const lngOffset = Math.cos(angle) * r;

          return {
            ...job,
            latitude: job.latitude + latOffset,
            longitude: job.longitude + lngOffset,
          };
        });

        setJobs(jobsWithOffsets);
      } catch (err) {
        console.error('Error fetching jobs with coordinates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobsWithCoords();
  }, []);

  // Filter jobs by search query, category, and distance
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.category_name?.toLowerCase().includes(query)
      );
    }

    // Filter by selected category id (supports main category -> all subcategories)
    if (selectedCategoryId) {
      const selected = categories?.find((c) => c.id === selectedCategoryId);
      const isMainCategory = selected ? !selected.parent_id : false;
      const subCategoryIds = isMainCategory
        ? (categories || []).filter((c) => c.parent_id === selectedCategoryId).map((c) => c.id)
        : [];

      filtered = filtered.filter((job) => {
        if (!job.category_id) return false;
        if (!isMainCategory) return job.category_id === selectedCategoryId;
        return job.category_id === selectedCategoryId || subCategoryIds.includes(job.category_id);
      });
    }

    // Filter by distance if distance filter is active
    if (distanceFilter) {
      filtered = filtered
        .map(job => ({
          ...job,
          distance: calculateDistance(
            distanceFilter.latitude,
            distanceFilter.longitude,
            job.latitude,
            job.longitude
          ),
        }))
        .filter(job => job.distance! <= distanceFilter.radius)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return filtered;
  }, [jobs, searchQuery, selectedCategoryId, categories, distanceFilter]);

  // Auto-locate when user switches to Map view (called from page toggle)
  useEffect(() => {
    if (!autoLocateNonce) return;
    if (!navigator.geolocation) return;
    if (!map.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDistanceFilter({ latitude, longitude, radius: 25, locationName: 'Your location' });
        map.current?.flyTo({ center: [longitude, latitude], zoom: 11, duration: 1200 });
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 8000 }
    );
  }, [autoLocateNonce]);

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget flexible';
    if (min && max) return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
    if (min) return `From £${min.toLocaleString()}`;
    return `Up to £${max?.toLocaleString()}`;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || tokenLoading) return;

    mapboxgl.accessToken = mapboxToken;

    const defaultCenter: [number, number] = [-1.5, 53.5];
    const defaultZoom = 5;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter,
      zoom: defaultZoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // When this map is mounted from a conditional view (list -> map toggle),
    // Mapbox can initialize before layout is fully settled. A resize after load
    // ensures the canvas dimensions are correct so markers render reliably.
    const doResize = () => map.current?.resize();
    map.current.once('load', doResize);
    requestAnimationFrame(doResize);
    const t = window.setTimeout(doResize, 150);
    window.addEventListener('resize', doResize);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', doResize);
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, tokenLoading]);

  // Update map data when filtered jobs change
  useEffect(() => {
    if (!map.current || isLoading) return;

    const updateMapData = () => {
      if (!map.current || !map.current.isStyleLoaded()) return;

      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: filteredJobs.map(job => ({
          type: 'Feature',
          properties: {
            id: job.id,
            title: job.title,
            description: job.description.slice(0, 100) + (job.description.length > 100 ? '...' : ''),
            location: job.location,
            budget: formatBudget(job.budget_min, job.budget_max),
            category: job.category_name,
             categoryColor: getCategoryColor(job.category_name),
             categoryIcon: getCategoryStyle(job.category_name).icon,
            created_at: job.created_at,
            distance: job.distance,
          },
          geometry: {
            type: 'Point',
            coordinates: [job.longitude, job.latitude],
          },
        })),
      };

      const source = map.current.getSource('jobs') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geojsonData);
      } else {
        // Add source and layers for job markers
        map.current.addSource('jobs', {
          type: 'geojson',
          data: geojsonData,
        });

        // Individual job markers - circle colored by category
        map.current.addLayer({
          id: 'unclustered-job',
          type: 'circle',
          source: 'jobs',
          paint: {
            'circle-color': ['get', 'categoryColor'],
            'circle-radius': 12,
            'circle-stroke-width': 2,
            'circle-stroke-color': 'hsl(var(--background))',
          },
        });

        // Category icon at the center of each marker
        map.current.addLayer({
          id: 'job-category-icon',
          type: 'symbol',
          source: 'jobs',
          layout: {
            'text-field': ['get', 'categoryIcon'],
            'text-size': 14,
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

        // Postcode label for each job - color matches pin
        map.current.addLayer({
          id: 'job-postcode-label',
          type: 'symbol',
          source: 'jobs',
          layout: {
            'text-field': ['get', 'location'],
            'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.8],
            'text-anchor': 'top',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
            'text-transform': 'uppercase',
          },
          paint: {
            'text-color': ['get', 'categoryColor'],
            'text-halo-color': 'hsl(var(--background))',
            'text-halo-width': 2,
          },
        });

        // Highlighted selected job marker (renders on top)
        map.current.addLayer({
          id: 'selected-job',
          type: 'circle',
          source: 'jobs',
          filter: ['==', ['get', 'id'], ''],
          paint: {
            'circle-color': 'hsl(var(--primary))',
            'circle-radius': 16,
            'circle-stroke-width': 3,
            'circle-stroke-color': 'hsl(var(--background))',
          },
        });

        // Pulsing ring around selected marker
        map.current.addLayer({
          id: 'selected-job-ring',
          type: 'circle',
          source: 'jobs',
          filter: ['==', ['get', 'id'], ''],
          paint: {
            'circle-color': 'transparent',
            'circle-radius': 26,
            'circle-stroke-width': 3,
            'circle-stroke-color': 'hsl(var(--primary))',
            'circle-stroke-opacity': 0.6,
          },
        });

        // Click handler for job markers
        map.current.on('click', 'unclustered-job', (e) => {
          if (!e.features?.length || !map.current) return;
          const properties = e.features[0].properties;
          const geometry = e.features[0].geometry as GeoJSON.Point;

          setSelectedJobId(properties?.id);

          // Render React popup
          showPopup(
            map.current,
            geometry.coordinates as [number, number],
            <JobMapPopup
              id={properties?.id}
              title={properties?.title || 'Job'}
              description={properties?.description || ''}
              location={properties?.location}
              budget={properties?.budget || 'Budget flexible'}
              category={properties?.category}
              categoryColor={properties?.categoryColor || 'hsl(var(--primary))'}
              createdAt={properties?.created_at}
              distance={properties?.distance}
              isProvider={isProvider}
              subscriptionStatus={subscriptionStatus}
            />
          );
        });

        // Cursor change on hover
        map.current.on('mouseenter', 'unclustered-job', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current.on('mouseleave', 'unclustered-job', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
      }

      // Update selected job highlight filter
      if (map.current.getLayer('selected-job')) {
        map.current.setFilter('selected-job', selectedJobId 
          ? ['==', ['get', 'id'], selectedJobId]
          : ['==', ['get', 'id'], '']
        );
      }
      if (map.current.getLayer('selected-job-ring')) {
        map.current.setFilter('selected-job-ring', selectedJobId 
          ? ['==', ['get', 'id'], selectedJobId]
          : ['==', ['get', 'id'], '']
        );
      }

      // Fit bounds to show all jobs
      if (filteredJobs.length > 0 && !selectedJobId) {
        const bounds = new mapboxgl.LngLatBounds();
        filteredJobs.forEach(j => bounds.extend([j.longitude, j.latitude]));
        map.current.fitBounds(bounds, { padding: 60, maxZoom: 12 });
      }
    };

    // Wait for map style to load before adding data (and avoid accumulating handlers)
    if (map.current.isStyleLoaded()) {
      updateMapData();
      return;
    }

    const handleLoad = () => updateMapData();
    map.current.once('load', handleLoad);
    return () => {
      map.current?.off('load', handleLoad);
    };
  }, [filteredJobs, selectedJobId, isLoading, isProvider, roleLoading, subscriptionStatus]);

  if (isLoading || tokenLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-muted rounded-lg">
        <MapPin className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">{tokenError}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-muted rounded-lg">
        <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No jobs with locations</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          No open jobs have location coordinates yet. Try the list view to see all jobs.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[600px] rounded-lg border border-border overflow-hidden" />

      {/* Search and filter controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 flex-wrap pointer-events-none">
        {/* Postcode search on left */}
        <div className="pointer-events-auto">
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
        </div>
        
        {/* Existing search and distance filter on right */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
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
          <div className="bg-background/90 backdrop-blur-sm rounded-md shadow-sm">
            <DistanceFilter onFilterChange={setDistanceFilter} />
          </div>
        </div>
      </div>
    </div>
  );
});

export const JobsMap = JobsMapComponent;
export default JobsMapComponent;
