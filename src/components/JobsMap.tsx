import { useEffect, useState, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DistanceFilter } from '@/components/DistanceFilter';
import { PostcodeSearch } from '@/components/PostcodeSearch';
import { calculateDistance } from '@/lib/distance';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { getCategoryStyle } from '@/lib/mapCategoryStyle';
import { JobMapPopup } from '@/components/map';

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

const CATEGORY_COLORS: Record<string, string> = {
  'Home DIY and Renovation': 'hsl(var(--cat-home))',
  'Handyman': 'hsl(var(--cat-home))',
  'Electrician': 'hsl(var(--cat-home))',
  'Plumber': 'hsl(var(--cat-home))',
  'Carpenter': 'hsl(var(--cat-home))',
  'Painter': 'hsl(var(--cat-home))',
  'Renovation': 'hsl(var(--cat-home))',
  'Builder': 'hsl(var(--cat-home))',
  'Commercial Renovations and Services': 'hsl(var(--cat-commercial))',
  'Shopfitting': 'hsl(var(--cat-commercial))',
  'Maintenance Service': 'hsl(var(--cat-commercial))',
  'Cleaning Service': 'hsl(var(--cat-commercial))',
  'Events and Catering': 'hsl(var(--cat-events))',
  'Catering': 'hsl(var(--cat-events))',
  'Photography': 'hsl(var(--cat-events))',
  'DJ': 'hsl(var(--cat-events))',
  'Wedding Planning': 'hsl(var(--cat-events))',
  'Health and Fitness': 'hsl(var(--cat-health))',
  'Personal Trainer': 'hsl(var(--cat-health))',
  'Massage Therapy': 'hsl(var(--cat-health))',
  'Agriculture, Moving and Transport': 'hsl(var(--cat-transport))',
  'Commercial Movers': 'hsl(var(--cat-transport))',
  'Courier Services': 'hsl(var(--cat-transport))',
  'Pets Services': 'hsl(var(--cat-pets))',
  'Dog Training': 'hsl(var(--cat-pets))',
  'Pet Sitting': 'hsl(var(--cat-pets))',
  'Business Services': 'hsl(var(--cat-business))',
  'Accounting': 'hsl(var(--cat-business))',
  'Consulting': 'hsl(var(--cat-business))',
  'IT Services': 'hsl(var(--cat-it))',
  'Web Design': 'hsl(var(--cat-it))',
  'Software Development': 'hsl(var(--cat-it))',
  'SEO Service': 'hsl(var(--cat-it))',
  'Legal Services': 'hsl(var(--cat-legal))',
  'Lessons': 'hsl(var(--cat-lessons))',
  'Language Lessons': 'hsl(var(--cat-lessons))',
  'Academic Lessons': 'hsl(var(--cat-lessons))',
};

const DEFAULT_PIN_COLOR = 'hsl(var(--primary))';

const getCategoryColor = (categoryName: string | null): string => {
  if (!categoryName) return DEFAULT_PIN_COLOR;
  const themed = getCategoryStyle(categoryName);
  if (themed?.color) return themed.color;
  if (CATEGORY_COLORS[categoryName]) return CATEGORY_COLORS[categoryName];
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

// Helper to fly to a specific location
function FlyToLocation({ target }: { target: { lat: number; lng: number; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

// Helper to fit bounds
function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    }
  }, [bounds, map]);
  return null;
}

// Expose map instance via ref
function MapRefSetter({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

const JobsMapComponent = forwardRef<JobsMapHandle, JobsMapProps>(function JobsMap({ selectedCategoryId, categories, autoLocateNonce }, ref) {
  const mapRef = useRef<L.Map | null>(null);
  const [jobs, setJobs] = useState<JobWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilterState | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  
  const { user } = useAuth();
  const { isProvider, loading: roleLoading } = useUserRole();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

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
      setFlyTarget({ lat, lng, zoom: 14 });
    },
  }));

  // Fetch jobs with coordinates
  useEffect(() => {
    const fetchJobsWithCoords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_public_job_listings_with_coords');
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

        // Offset overlapping markers
        const countsByCoord = new Map<string, number>();
        const jobsWithOffsets: JobWithLocation[] = rawJobs.map((job) => {
          const key = `${job.latitude.toFixed(5)}:${job.longitude.toFixed(5)}`;
          const idx = countsByCoord.get(key) ?? 0;
          countsByCoord.set(key, idx + 1);
          if (idx === 0) return job;
          const ring = Math.floor((idx - 1) / 8) + 1;
          const posInRing = (idx - 1) % 8;
          const angle = (posInRing / 8) * Math.PI * 2;
          const base = 0.00012;
          const r = base * ring;
          return {
            ...job,
            latitude: job.latitude + Math.sin(angle) * r,
            longitude: job.longitude + Math.cos(angle) * r,
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

  // Filter jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.category_name?.toLowerCase().includes(query)
      );
    }

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

    if (distanceFilter) {
      filtered = filtered
        .map(job => ({
          ...job,
          distance: calculateDistance(distanceFilter.latitude, distanceFilter.longitude, job.latitude, job.longitude),
        }))
        .filter(job => job.distance! <= distanceFilter.radius)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return filtered;
  }, [jobs, searchQuery, selectedCategoryId, categories, distanceFilter]);

  // Auto-locate
  useEffect(() => {
    if (!autoLocateNonce) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDistanceFilter({ latitude, longitude, radius: 25, locationName: 'Your location' });
        setFlyTarget({ lat: latitude, lng: longitude, zoom: 11 });
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 8000 }
    );
  }, [autoLocateNonce]);

  // Fit bounds when filtered jobs change
  const bounds = useMemo(() => {
    if (filteredJobs.length === 0 || selectedJobId) return null;
    const latLngs = filteredJobs.map(j => [j.latitude, j.longitude] as [number, number]);
    return L.latLngBounds(latLngs);
  }, [filteredJobs, selectedJobId]);

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget flexible';
    if (min && max) return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
    if (min) return `From £${min.toLocaleString()}`;
    return `Up to £${max?.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
      <div className="w-full h-[600px] rounded-lg border border-border overflow-hidden">
        <MapContainer
          center={[53.5, -1.5]}
          zoom={5}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapRefSetter mapRef={mapRef} />
          <FlyToLocation target={flyTarget} />
          <FitBounds bounds={bounds} />

          {filteredJobs.map((job) => {
            const color = getCategoryColor(job.category_name);
            const isSelected = selectedJobId === job.id;
            return (
              <CircleMarker
                key={job.id}
                center={[job.latitude, job.longitude]}
                radius={isSelected ? 14 : 10}
                pathOptions={{
                  fillColor: color,
                  color: isSelected ? 'hsl(var(--primary))' : '#fff',
                  weight: isSelected ? 3 : 2,
                  fillOpacity: 0.9,
                }}
                eventHandlers={{
                  click: () => setSelectedJobId(job.id),
                }}
              >
                <Popup>
                  <JobMapPopup
                    id={job.id}
                    title={job.title}
                    description={job.description.slice(0, 100) + (job.description.length > 100 ? '...' : '')}
                    location={job.location}
                    budget={formatBudget(job.budget_min, job.budget_max)}
                    category={job.category_name}
                    categoryColor={color}
                    createdAt={job.created_at}
                    distance={job.distance}
                    isProvider={isProvider}
                    subscriptionStatus={subscriptionStatus}
                  />
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Search and filter controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 flex-wrap pointer-events-none z-[1000]">
        <div className="pointer-events-auto">
          <PostcodeSearch
            onLocationFound={(lat, lng) => {
              setFlyTarget({ lat, lng, zoom: 13 });
            }}
            placeholder="Zoom to postcode..."
          />
        </div>
        
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
