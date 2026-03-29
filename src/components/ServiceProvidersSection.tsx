import { useQuery } from "@tanstack/react-query";
import { User, Star, BadgeCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";

interface ProviderWithServices {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_featured: boolean;
  is_verified: boolean;
  created_at: string;
  services: string[];
  average_rating: number | null;
  review_count: number;
}

export function ServiceProvidersSection() {
  const { data: providers, isLoading } = useQuery({
    queryKey: ["homepage-latest-providers"],
    queryFn: async () => {
      // Get all provider services to find providers
      const { data: services, error: servicesError } = await supabase.from("provider_services").select(`
          provider_id,
          custom_name,
          service_categories:category_id(name)
        `);

      if (servicesError) throw servicesError;
      if (!services || services.length === 0) return [];

      // Get unique provider IDs
      const providerIds = [...new Set(services.map((s) => s.provider_id))];

      // Use the secure RPC function to fetch public provider profile data
      const { data: profiles, error: profilesError } = await supabase.rpc("get_public_provider_profiles", {
        provider_ids: providerIds,
      });

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) return [];

      // Sort by created_at descending (latest first)
      const sortedProfiles = [...profiles].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      // Get reviews for these providers
      const { data: reviews } = await supabase
        .from("reviews")
        .select("provider_id, rating")
        .in("provider_id", providerIds);

      // Calculate average ratings per provider
      const ratingsByProvider = new Map<string, { total: number; count: number }>();
      reviews?.forEach((review) => {
        if (!ratingsByProvider.has(review.provider_id)) {
          ratingsByProvider.set(review.provider_id, { total: 0, count: 0 });
        }
        const stats = ratingsByProvider.get(review.provider_id)!;
        stats.total += review.rating;
        stats.count += 1;
      });

      // Group services by provider - use subcategory names only
      const servicesByProvider = new Map<string, string[]>();
      services?.forEach((service) => {
        const providerId = service.provider_id;
        if (!servicesByProvider.has(providerId)) {
          servicesByProvider.set(providerId, []);
        }
        const rawServiceName = service.custom_name || (service.service_categories as any)?.name;
        // Strip "MainCategory - " prefix if present from legacy data
        const serviceName = rawServiceName?.includes(' - ')
          ? rawServiceName.split(' - ').slice(1).join(' - ')
          : rawServiceName;
        if (serviceName) {
          servicesByProvider.get(providerId)!.push(serviceName);
        }
      });

      // Build provider list with services - take latest 3
      const result: ProviderWithServices[] = sortedProfiles
        .filter((p) => p.full_name && servicesByProvider.get(p.id)?.length) // Only show providers with names and services
        .slice(0, 3) // Latest 3 providers
        .map((profile) => {
          const ratingStats = ratingsByProvider.get(profile.id);
          return {
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            is_featured: profile.is_featured ?? false,
            is_verified: profile.is_verified ?? false,
            created_at: profile.created_at,
            services: servicesByProvider.get(profile.id) || [],
            average_rating: ratingStats ? ratingStats.total / ratingStats.count : null,
            review_count: ratingStats?.count || 0,
          };
        });

      return result;
    },
  });

  // Don't render section if no providers
  if (!isLoading && (!providers || providers.length === 0)) {
    return null;
  }

  return (
    <section aria-label="Featured service providers" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <SectionHeader
          className="mb-10"
          eyebrow="Service providers"
          title="High quality providers at your service"
          subtitle="Recently joined professionals ready to help with your projects"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading
            ? // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </Card>
              ))
            : providers?.map((provider) => (
                <Card
                  key={provider.id}
                  className={`group relative h-full overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
                    provider.is_featured ? "ring-1 ring-primary/20" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden ${
                            provider.is_featured ? "ring-2 ring-primary ring-offset-2" : "bg-muted"
                          }`}
                        >
                          {provider.avatar_url ? (
                            <img
                              src={provider.avatar_url}
                              alt={provider.full_name || "Provider"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              {provider.full_name ? (
                                <span className="text-xl font-bold text-muted-foreground">
                                  {provider.full_name.charAt(0).toUpperCase()}
                                </span>
                              ) : (
                                <User className="w-8 h-8 text-muted-foreground" />
                              )}
                            </div>
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
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">
                            <Link to={`/service-provider/${provider.id}`} className="hover:text-primary transition-colors hover:underline">
                              {provider.full_name || "Service Provider"}
                            </Link>
                          </h3>
                          {provider.is_verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" aria-label="Verified provider" />}
                        </div>

                        {/* Rating */}
                        {provider.average_rating != null && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-primary fill-primary" aria-hidden="true" />
                            <span className="text-sm font-medium text-foreground">
                              {provider.average_rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({provider.review_count} {provider.review_count === 1 ? "review" : "reviews"})
                            </span>
                          </div>
                        )}

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 mt-1">
                          {provider.is_featured && (
                            <Badge className="bg-primary/10 text-primary text-xs px-1.5 py-0">
                              Featured
                            </Badge>
                          )}
                          {provider.is_verified && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {provider.bio && (
                      <p className="text-muted-foreground mt-4 line-clamp-2">{provider.bio}</p>
                    )}

                    {/* Services */}
                    {provider.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {provider.services.slice(0, 3).map((service, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                            {service}
                          </span>
                        ))}
                        {provider.services.length > 3 && (
                          <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                            +{provider.services.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 pt-8 border-t border-border">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            With Kluje you can request a quote from a specific service provider{" "}
            <span className="text-primary font-semibold">or</span> post a job for everyone to see!
          </p>
          <Link to="/browse">
            <Button size="lg" className="gap-2">
              Discover All Service Providers
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

