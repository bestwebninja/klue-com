import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MapPin, User, X, List, Map, Star, CheckCircle, Crown, MessageSquare, ArrowUpDown, ChevronDown } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProvidersMap } from '@/components/ProvidersMap';
import { DistanceFilter } from '@/components/DistanceFilter';
import { RatingFilter } from '@/components/RatingFilter';
import { HierarchicalCategoryFilter } from '@/components/HierarchicalCategoryFilter';
import { calculateDistance } from '@/lib/distance';
import { useAuth } from '@/hooks/useAuth';
import { LoginPromptDialog } from '@/components/LoginPromptDialog';
import type { Database } from '@/integrations/supabase/types';
import heroProviders from '@/assets/hero-providers.jpg';
import { SEOHead } from '@/components/SEOHead';

type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];

// Public profile type with only non-sensitive fields
interface PublicProfile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_featured: boolean;
  is_verified: boolean;
  created_at: string;
}

interface ProviderWithDetails extends PublicProfile {
  services: { category_id: string | null; category_name: string; custom_name: string | null; parent_id: string | null }[];
  locations: { city: string | null; postcode: string | null; latitude: number | null; longitude: number | null }[];
  distance?: number;
  averageRating?: number;
  reviewCount?: number;
}
// Helper to get display name for a service (strips main category prefix from legacy data)
const getServiceDisplayName = (service: { custom_name: string | null; category_name: string }) => {
  const serviceName = service.custom_name || service.category_name;
  // Remove "MainCategory - " prefix if present from legacy data
  return serviceName.includes(' - ') 
    ? serviceName.split(' - ').slice(1).join(' - ')
    : serviceName;
};

const BrowseProviders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<ProviderWithDetails[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<'rating' | 'distance' | 'newest' | 'alphabetical'>('rating');
  const [visibleCount, setVisibleCount] = useState(12);
  const ITEMS_PER_PAGE = 12;
  const [distanceFilter, setDistanceFilter] = useState<{
    latitude: number;
    longitude: number;
    radius: number;
    locationName: string;
  } | null>(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginRedirectUrl, setLoginRedirectUrl] = useState('');

  const autoLocateForMapView = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDistanceFilter({
          latitude,
          longitude,
          radius: 25,
          locationName: 'Your location',
        });
        setSortOption('distance');
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 8000 }
    );
  };

  useEffect(() => {
    fetchCategories();
    fetchProviders();
  }, [user]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');
    
    if (data) setCategories(data);
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      // Fetch all profiles that have at least one service - include category_id for filtering
      const { data: servicesData } = await supabase
        .from('provider_services')
        .select('provider_id, custom_name, category_id, service_categories(id, name, parent_id)');

      if (!servicesData) {
        setProviders([]);
        return;
      }

      // Get unique provider IDs
      const providerIds = [...new Set(servicesData.map(s => s.provider_id))];

      if (providerIds.length === 0) {
        setProviders([]);
        return;
      }

      // Use the secure RPC function to fetch public provider profile data
      const { data: profilesData } = await supabase
        .rpc('get_public_provider_profiles', { provider_ids: providerIds });

      // Fetch locations for these providers using the public function (no full address exposed)
      const { data: locationsData } = await supabase
        .rpc('get_public_provider_locations', { provider_ids: providerIds });

      // Fetch reviews to calculate average ratings
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('provider_id, rating')
        .in('provider_id', providerIds);

      // Calculate average ratings per provider
      const ratingsMap: Record<string, { sum: number; count: number }> = {};
      (reviewsData || []).forEach(review => {
        const existing = ratingsMap[review.provider_id] || { sum: 0, count: 0 };
        ratingsMap[review.provider_id] = {
          sum: existing.sum + review.rating,
          count: existing.count + 1
        };
      });

      // Combine data
      const providersWithDetails: ProviderWithDetails[] = (profilesData || []).map(profile => {
        const providerServices = servicesData
          .filter(s => s.provider_id === profile.id)
          .map(s => {
            const serviceCategory = s.service_categories as any;
            return {
              category_id: s.category_id,
              category_name: serviceCategory?.name || '',
              custom_name: s.custom_name,
              parent_id: serviceCategory?.parent_id || null
            };
          });

        const providerLocations = (locationsData || [])
          .filter((l: any) => l.provider_id === profile.id)
          .map((l: any) => ({ 
            city: l.city, 
            postcode: l.postcode,
            latitude: l.latitude ? Number(l.latitude) : null,
            longitude: l.longitude ? Number(l.longitude) : null
          }));

        const ratingInfo = ratingsMap[profile.id];
        const averageRating = ratingInfo ? ratingInfo.sum / ratingInfo.count : undefined;
        const reviewCount = ratingInfo?.count || 0;

        return {
          ...profile,
          services: providerServices,
          locations: providerLocations,
          averageRating,
          reviewCount
        };
      });


      setProviders(providersWithDetails);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers
    .map(provider => {
      // Calculate distance if distance filter is active
      if (distanceFilter) {
        const locationWithCoords = provider.locations.find(l => l.latitude && l.longitude);
        if (locationWithCoords && locationWithCoords.latitude && locationWithCoords.longitude) {
          const distance = calculateDistance(
            distanceFilter.latitude,
            distanceFilter.longitude,
            locationWithCoords.latitude,
            locationWithCoords.longitude
          );
          return { ...provider, distance };
        }
        return { ...provider, distance: undefined };
      }
      return provider;
    })
    .filter(provider => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        provider.full_name?.toLowerCase().includes(searchLower) ||
        provider.bio?.toLowerCase().includes(searchLower) ||
        provider.services.some(s => 
          s.category_name.toLowerCase().includes(searchLower) ||
          s.custom_name?.toLowerCase().includes(searchLower)
        );

      // Category filter - filter by subcategory ID or all subcategories under a main category
      let matchesCategory = true;
      if (selectedCategoryId) {
        const selectedCat = categories.find(c => c.id === selectedCategoryId);
        if (selectedCat) {
          // If it's a main category (no parent), include all providers with any subcategory under it
          if (!selectedCat.parent_id) {
            const subCategoryIds = categories
              .filter(c => c.parent_id === selectedCategoryId)
              .map(c => c.id);
            matchesCategory = provider.services.some(s => 
              s.category_id === selectedCategoryId || 
              s.parent_id === selectedCategoryId ||
              (s.category_id && subCategoryIds.includes(s.category_id))
            );
          } else {
            // It's a subcategory, match by category_id
            matchesCategory = provider.services.some(s => s.category_id === selectedCategoryId);
          }
        }
      }

      // Location text filter
      const locationLower = locationFilter.toLowerCase();
      const matchesLocation = !locationFilter ||
        provider.locations.some(l => 
          l.city?.toLowerCase().includes(locationLower) ||
          l.postcode?.toLowerCase().includes(locationLower)
        );

      // Distance filter
      const matchesDistance = !distanceFilter || 
        (provider.distance !== undefined && provider.distance <= distanceFilter.radius);

      // Rating filter
      const matchesRating = ratingFilter === null || 
        (provider.averageRating !== undefined && provider.averageRating >= ratingFilter);

      return matchesSearch && matchesCategory && matchesLocation && matchesDistance && matchesRating;
    })
    .sort((a, b) => {
      // Apply selected sort option
      switch (sortOption) {
        case 'distance':
          // Sort by distance (only if distance filter is active and distances are calculated)
          if (distanceFilter) {
            const distA = a.distance ?? Infinity;
            const distB = b.distance ?? Infinity;
            return distA - distB;
          }
          // Fallback to rating if no distance filter
          return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        case 'rating':
          return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'alphabetical':
          const nameA = a.full_name?.toLowerCase() || '';
          const nameB = b.full_name?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(null);
    setSelectedCategoryName(null);
    setLocationFilter('');
    setDistanceFilter(null);
    setRatingFilter(null);
    setSortOption('rating');
    setVisibleCount(12);
  };

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCategoryId, locationFilter, distanceFilter, ratingFilter, sortOption]);

  // Paginated providers
  const paginatedProviders = filteredProviders.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProviders.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const hasActiveFilters = searchQuery || selectedCategoryId !== null || locationFilter || distanceFilter || ratingFilter !== null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Browse Local Service Providers | Kluje"
        description="Search rated and verified service providers near you. Filter by trade, location and reviews to find the right professional for your project."
        pageType="browse-providers"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Service Providers in the US",
          "description": "Browse rated and verified service providers near you. Filter by trade, location and reviews to find the right professional for your project.",
          "url": "https://klue-us.lovable.app/browse-providers",
          "numberOfItems": filteredProviders.length,
          "itemListElement": filteredProviders.slice(0, 10).map((provider, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://klue-us.lovable.app/service-provider/${provider.id}`,
            "name": provider.full_name || "Service Provider",
          })),
        }}
      />
      <Navbar />
      
      <main>
        <PageHero
          backgroundImage={heroProviders}
          title="Find Service Providers"
          description="Browse trusted professionals for your home improvement projects"
        />

        {/* Login Prompt Banner for Anonymous Users */}
        {!user && (
          <section className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Sign in to see full provider details
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Get access to contact information, reviews, and more
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth?signup=true">
                    <Button size="sm">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}


        {/* Filters Section */}
        <section className="py-4 sm:py-6 lg:py-8 bg-secondary border-b border-border">
          <div className="container mx-auto px-4">
            {/* Mobile: Stacked filters */}
            <div className="flex flex-col gap-3 lg:hidden">
              {/* Search - full width on mobile */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              
              {/* Category + Location in row */}
              <div className="grid grid-cols-2 gap-3">
                <HierarchicalCategoryFilter
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryChange={(categoryId, categoryName) => {
                    setSelectedCategoryId(categoryId);
                    setSelectedCategoryName(categoryName);
                  }}
                />
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
              </div>
              
              {/* Distance + Rating + Sort in row */}
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-[120px]">
                  <DistanceFilter onFilterChange={setDistanceFilter} />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <RatingFilter value={ratingFilter} onChange={setRatingFilter} />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <Select value={sortOption} onValueChange={(value: 'rating' | 'distance' | 'newest' | 'alphabetical') => setSortOption(value)}>
                    <SelectTrigger className="bg-background">
                      <ArrowUpDown className="w-4 h-4 mr-2 shrink-0" />
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="distance" disabled={!distanceFilter}>Nearest</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="alphabetical">A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Clear + View Toggle row */}
              <div className="flex items-center justify-between gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0 text-xs">
                    <X className="w-3 h-3 mr-1" />
                    Clear filters
                  </Button>
                )}
                <div className="flex border border-border rounded-md overflow-hidden ml-auto">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none h-8 px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setViewMode('map');
                      if (!distanceFilter) autoLocateForMapView();
                    }}
                    className="rounded-none h-8 px-3"
                  >
                    <Map className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop: Original horizontal layout */}
            <div className="hidden lg:flex flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>

              {/* Hierarchical Category Filter */}
              <HierarchicalCategoryFilter
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={(categoryId, categoryName) => {
                  setSelectedCategoryId(categoryId);
                  setSelectedCategoryName(categoryName);
                }}
              />

              {/* Location Filter */}
              <div className="relative w-[200px]">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>

              {/* Distance Filter */}
              <DistanceFilter onFilterChange={setDistanceFilter} />

              {/* Rating Filter */}
              <RatingFilter value={ratingFilter} onChange={setRatingFilter} />

              {/* Sort Options */}
              <Select value={sortOption} onValueChange={(value: 'rating' | 'distance' | 'newest' | 'alphabetical') => setSortOption(value)}>
                <SelectTrigger className="w-[180px] bg-background">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg z-50">
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="distance" disabled={!distanceFilter}>
                    Nearest {!distanceFilter && '(set location)'}
                  </SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="shrink-0">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}

              {/* View Toggle */}
              <div className="flex border border-border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode('map');
                    if (!distanceFilter) autoLocateForMapView();
                  }}
                  className="rounded-none"
                >
                  <Map className="w-4 h-4 mr-1" />
                  Map
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Providers Section */}
        {!loading && !hasActiveFilters && providers.filter(p => p.is_featured).length > 0 && (
          <section className="py-8 bg-secondary/30 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Featured Providers</h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Top Rated
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {providers
                  .filter(p => p.is_featured)
                  .slice(0, 4)
                  .map((provider) => (
                    <Link key={provider.id} to={`/service-provider/${provider.id}`}>
                      <Card className="group relative h-full overflow-hidden cursor-pointer border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card/80 backdrop-blur-sm hover:scale-[1.01]">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            {/* Avatar with featured ring */}
                            <div className="relative">
                              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-primary ring-offset-2">
                                {provider.avatar_url ? (
                                  <img 
                                    src={provider.avatar_url} 
                                    alt={provider.full_name || 'Provider'} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-7 h-7 text-muted-foreground" />
                                )}
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <Star className="w-3 h-3 text-white fill-white" />
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-semibold text-foreground truncate">
                                  {provider.full_name || 'Service Provider'}
                                </h3>
                                {provider.is_verified && (
                                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                )}
                              </div>
                              
                              {/* Rating */}
                              {provider.averageRating !== undefined && (
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < Math.round(provider.averageRating!)
                                            ? "fill-primary text-primary"
                                            : "text-muted-foreground"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    ({provider.reviewCount})
                                  </span>
                                </div>
                              )}
                              
                              {provider.locations.length > 0 && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3" />
                                  {provider.locations[0].city || provider.locations[0].postcode}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Services */}
                          {provider.services.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {provider.services.slice(0, 3).map((service, idx) => (
                                <span
                                  key={idx}
                                      className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                                >
                                  {getServiceDisplayName(service)}
                                </span>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Results Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Results Count */}
            <p className="text-muted-foreground mb-6">
              {loading ? 'Loading...' : `${filteredProviders.length} provider${filteredProviders.length !== 1 ? 's' : ''} found`}
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Finding providers..." />
              </div>
            ) : viewMode === 'map' ? (
              <ProvidersMap providers={filteredProviders} />
            ) : filteredProviders.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No providers found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProviders.map((provider) => (
                  <Card 
                    key={provider.id} 
                    className={`group relative h-full overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${provider.is_featured ? 'ring-1 ring-primary/20' : ''}`}
                  >
                    <CardContent className="p-6">
                      <Link to={`/service-provider/${provider.id}`} className="block">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="relative">
                            <div className={`w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border ${provider.is_featured ? 'border-primary' : 'border-border'}`}>
                              {provider.avatar_url ? (
                                <img 
                                  src={provider.avatar_url} 
                                  alt={provider.full_name || 'Provider'} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-8 h-8 text-muted-foreground" />
                              )}
                            </div>
                            {provider.is_featured && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <Star className="w-3 h-3 text-white fill-white" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-semibold text-foreground truncate">
                                {provider.full_name || 'Service Provider'}
                              </h3>
                              {provider.is_verified && (
                                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                            
                            {/* Rating */}
                            {provider.averageRating !== undefined && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < Math.round(provider.averageRating!)
                                          ? "fill-primary text-primary"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  ({provider.reviewCount})
                                </span>
                              </div>
                            )}

                            {/* Badges */}
                            <div className="flex items-center gap-1.5 mt-1">
                              {provider.is_featured && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs px-1.5 py-0">
                                  Featured
                                </Badge>
                              )}
                              {provider.is_verified && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs px-1.5 py-0">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            
                            {provider.locations.length > 0 && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {provider.locations[0].city || provider.locations[0].postcode}
                                {provider.distance !== undefined && (
                                  <span className="ml-1 text-xs">
                                    ({provider.distance.toFixed(1)} mi)
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bio */}
                        {provider.bio && (
                          <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                            {provider.bio}
                          </p>
                        )}

                        {/* Services */}
                        {provider.services.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {provider.services.slice(0, 4).map((service, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                              >
                                {getServiceDisplayName(service)}
                              </span>
                            ))}
                            {provider.services.length > 4 && (
                              <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                                +{provider.services.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </Link>

                      {/* Request Quote Button */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (user) {
                              navigate(`/service-provider/${provider.id}?requestQuote=true`);
                            } else {
                              // Show login prompt modal
                              setLoginRedirectUrl(`/service-provider/${provider.id}?requestQuote=true`);
                              setLoginPromptOpen(true);
                            }
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Request Quote
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={loadMore}
                      className="gap-2"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Load More ({filteredProviders.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}

                {/* Showing count */}
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Showing {paginatedProviders.length} of {filteredProviders.length} providers
                </p>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Login Prompt Dialog */}
      <LoginPromptDialog
        open={loginPromptOpen}
        onOpenChange={setLoginPromptOpen}
        redirectUrl={loginRedirectUrl}
        title="Sign in to request a quote"
        description="Create a free account or sign in to connect with this service provider."
      />
    </div>
  );
};

export default BrowseProviders;
