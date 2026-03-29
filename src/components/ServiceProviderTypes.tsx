import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Search, X, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { getIconComponent } from "@/lib/iconSuggestions";
import categories from "@/data/categoryLandingData";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  icon: string | null;
}

export function ServiceProviderTypes() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Record<string, Category[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("name");

      if (error) throw error;

      const main = data?.filter((c) => !c.parent_id) || [];
      const subs: Record<string, Category[]> = {};

      data?.forEach((cat) => {
        if (cat.parent_id) {
          if (!subs[cat.parent_id]) {
            subs[cat.parent_id] = [];
          }
          subs[cat.parent_id].push(cat);
        }
      });

      setMainCategories(main);
      setSubcategories(subs);
      
      // Auto-expand first category if exists
      if (main.length > 0) {
        setExpandedCategory(main[0].id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return { categories: mainCategories, expandedIds: expandedCategory ? [expandedCategory] : [] };
    }

    const query = searchQuery.toLowerCase();
    const matchingMainIds = new Set<string>();
    const expandedIds: string[] = [];

    // Check subcategories first
    mainCategories.forEach((main) => {
      const subs = subcategories[main.id] || [];
      const hasMatchingSub = subs.some((sub) => sub.name.toLowerCase().includes(query));
      const mainMatches = main.name.toLowerCase().includes(query);
      
      if (hasMatchingSub || mainMatches) {
        matchingMainIds.add(main.id);
        if (hasMatchingSub) {
          expandedIds.push(main.id);
        }
      }
    });

    return {
      categories: mainCategories.filter((c) => matchingMainIds.has(c.id)),
      expandedIds,
    };
  }, [searchQuery, mainCategories, subcategories, expandedCategory]);

  const filteredSubcategories = useMemo(() => {
    if (!searchQuery.trim()) return subcategories;
    
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, Category[]> = {};
    
    Object.entries(subcategories).forEach(([parentId, subs]) => {
      const matchingSubs = subs.filter((sub) => sub.name.toLowerCase().includes(query));
      // If main category matches, show all subs; otherwise show only matching subs
      const mainCat = mainCategories.find((c) => c.id === parentId);
      if (mainCat?.name.toLowerCase().includes(query)) {
        filtered[parentId] = subs;
      } else if (matchingSubs.length > 0) {
        filtered[parentId] = matchingSubs;
      }
    });
    
    return filtered;
  }, [searchQuery, subcategories, mainCategories]);

  const isExpanded = (categoryId: string) => {
    if (searchQuery.trim()) {
      return filteredData.expandedIds.includes(categoryId);
    }
    return expandedCategory === categoryId;
  };

  const activeCategoryId = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredData.categories[0]?.id ?? null;
    }

    return expandedCategory;
  }, [searchQuery, filteredData.categories, expandedCategory]);

  if (loading) {
    return (
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-9 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-72 mx-auto" />
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Service provider categories" className="py-12 md:py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <SectionHeader
          className="mb-8 md:mb-12"
          eyebrow="Categories"
          title="What Type of Service Provider Do You Need?"
          subtitle="Service providers are available for all home needs"
        />

        <div className="max-w-4xl mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
              aria-label="Search service categories"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {filteredData.categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No services found matching "{searchQuery}"
            </div>
          ) : (
            <div className="grid gap-4 md:gap-6 md:grid-cols-[240px_1fr]">
              {/* Left rail - horizontal scroll on mobile, vertical on desktop */}
              <div className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin">
                {filteredData.categories.map((category) => {
                  const selected = activeCategoryId === category.id;
                  const IconComponent = getIconComponent(category.icon);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        if (!searchQuery.trim()) setExpandedCategory(category.id);
                      }}
                      className={
                        "flex items-center gap-2 md:gap-3 rounded-lg border bg-card px-3 md:px-4 py-3 md:py-4 text-left shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0 md:shrink md:w-full min-w-[140px] md:min-w-0" +
                        (selected ? " border-primary" : " border-border")
                      }
                    >
                      <div
                        className={
                          "grid h-8 w-8 md:h-10 md:w-10 place-items-center rounded-md border transition-colors shrink-0" +
                          (selected
                            ? " bg-primary text-primary-foreground border-primary"
                            : " bg-background text-foreground border-border")
                        }
                      >
                        <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs md:text-sm font-semibold tracking-wide uppercase text-foreground truncate">
                          {category.name}
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground">
                          {filteredSubcategories[category.id]?.length ?? 0} services
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right content: service list (multi-column) */}
              <div className="rounded-lg border border-border bg-card p-4 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm md:text-base font-semibold text-foreground">
                    {activeCategoryId
                      ? filteredData.categories.find((c) => c.id === activeCategoryId)?.name
                      : "Services"}
                  </h3>
                  {!searchQuery.trim() && activeCategoryId && (
                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Browse</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {activeCategoryId && filteredSubcategories[activeCategoryId]?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1">
                      {filteredSubcategories[activeCategoryId].map((service) => (
                        <Link
                          key={service.id}
                          to={`/browse-providers?category=${service.id}`}
                          className="rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          {service.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Select a category to view services.</div>
                  )}
                </div>

                {/* Link to category landing page */}
                {activeCategoryId && (() => {
                  const activeName = filteredData.categories.find((c) => c.id === activeCategoryId)?.name;
                  const landingSlug = categories.find((lp) =>
                    activeName?.toLowerCase().includes(lp.name.split(" ")[0].toLowerCase()) ||
                    lp.name.toLowerCase().includes(activeName?.split(" ")[0]?.toLowerCase() ?? "")
                  )?.slug;
                  return landingSlug ? (
                    <Link
                      to={`/services/${landingSlug}`}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      Learn more about {activeName} services
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null;
                })()}

                <p className="mt-6 text-center text-muted-foreground">
                  With Kluje, simply post your job for <span className="text-primary font-semibold">FREE</span> on our quick form
                  and we will match your request to relevant contractors.{" "}
                  <Link to="/browse-providers" className="text-primary font-medium hover:underline">
                    Browse all verified service providers
                  </Link>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
