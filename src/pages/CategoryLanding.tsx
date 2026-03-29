import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCategoryBySlug } from '@/data/categoryLandingData';
import { SEOHead } from '@/components/SEOHead';
import { PageHero } from '@/components/PageHero';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Briefcase, Users, BookOpen, ChevronRight, Star,
  HelpCircle, MapPin, Clock, MessageSquare, ArrowRight,
} from 'lucide-react';
import NotFound from './NotFound';
import BuildOpsTrades from '@/components/BuildOpsTrades';
import DesignBuildDirectory from '@/components/DesignBuildDirectory';
import SmartSecurityDirectory from '@/components/SmartSecurityDirectory';
import CapitalDirectory from '@/components/CapitalDirectory';
import AICoreDirectory from '@/components/AICoreDirectory';
import LegalShieldDirectory from '@/components/LegalShieldDirectory';
import ConnectionsDirectory from '@/components/ConnectionsDirectory';
import PropertyDealsDirectory from '@/components/PropertyDealsDirectory';
import SalesAgentsDirectory from '@/components/SalesAgentsDirectory';
import LivingSolutionsDirectory from '@/components/LivingSolutionsDirectory';
import MaterialsDirectory from '@/components/MaterialsDirectory';

/* ------------------------------------------------------------------ */
/* Hero image imports – we import dynamically via the resolved path   */
/* stored in categoryLandingData. Vite requires static imports for    */
/* assets, so we map slug → imported module.                          */
/* ------------------------------------------------------------------ */
import heroHome from '@/assets/hero-home-services.jpg';
import heroCommercial from '@/assets/hero-commercial.jpg';
import heroBusiness from '@/assets/hero-business.jpg';
import heroIT from '@/assets/hero-it-services.jpg';
import heroLegal from '@/assets/hero-legal.jpg';
import heroContractor from '@/assets/hero-contractor.jpg';
import heroAskExpert from '@/assets/hero-ask-expert.jpg';
import ctaBg from '@/assets/cta-bg.jpg';

const heroMap: Record<string, string> = {
  // Current service categories
  'design-and-build': heroCommercial,
  'smart-security': heroIT,
  'build-ops': heroContractor,
  'capital': heroBusiness,
  'ai-core': heroIT,
  'legal-shield': heroLegal,
  'connections': heroBusiness,
  'property-deals': heroHome,
  'sales-agents': heroHome,
  'living-solutions': heroHome,
  'materials': heroCommercial,
};

export default function CategoryLanding() {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug(slug || '');

  /* ---- Fetch latest jobs in this category ---- */
  const { data: jobs } = useQuery({
    queryKey: ['category-jobs', slug],
    enabled: !!category,
    queryFn: async () => {
      // Find matching category ids
      const { data: cats } = await supabase
        .from('service_categories')
        .select('id')
        .ilike('name', `%${category!.name.split('&')[0].trim().split(' ')[0]}%`);

      if (!cats?.length) return [];

      const ids = cats.map((c) => c.id);
      const { data } = await supabase
        .from('job_listings')
        .select('id, title, location, created_at, status, category_id')
        .in('category_id', ids)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(4);
      return data || [];
    },
  });

  /* ---- Fetch providers offering services in this category ---- */
  const { data: providers } = useQuery({
    queryKey: ['category-providers', slug],
    enabled: !!category,
    queryFn: async () => {
      const { data: cats } = await supabase
        .from('service_categories')
        .select('id')
        .ilike('name', `%${category!.name.split('&')[0].trim().split(' ')[0]}%`);

      if (!cats?.length) return [];
      const ids = cats.map((c) => c.id);

      const { data: services } = await supabase
        .from('provider_services')
        .select('provider_id')
        .in('category_id', ids)
        .limit(20);

      if (!services?.length) return [];
      const providerIds = [...new Set(services.map((s) => s.provider_id))].slice(0, 4);

      const { data: profiles } = await supabase
        .rpc('get_public_provider_profiles', { provider_ids: providerIds });
      return profiles || [];
    },
  });

  /* ---- Fetch latest blog posts related to category ---- */
  const { data: blogPosts } = useQuery({
    queryKey: ['category-blogs', slug],
    enabled: !!category,
    queryFn: async () => {
      const keyword = category!.name.split('&')[0].trim().split(' ')[0].toLowerCase();
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image_url, published_at')
        .eq('status', 'published')
        .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)
        .order('published_at', { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  if (!category) return <NotFound />;

  const heroImg = heroMap[category.slug] || heroHome;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.tagline,
      url: `https://kluje.com/services/${category.slug}`,
    isPartOf: { '@type': 'WebSite', name: 'Kluje', url: 'https://kluje.com' },
  };

  return (
    <>
      <SEOHead
        title={`${category.name} Services in the US | Kluje`}
        description={category.article[0].substring(0, 155)}
        keywords={category.subcategories.slice(0, 8)}
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* Hero */}
      <PageHero
        backgroundImage={heroImg}
        title={category.name}
        description={category.tagline}
      >
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          <Link to="/post-job">
            <Button variant="hero" size="lg">Post a Job</Button>
          </Link>
          <Link to="/browse-providers">
            <Button variant="hero-outline" size="lg">
              Browse Providers
            </Button>
          </Link>
        </div>
      </PageHero>

      <main className="bg-background">
        {/* Stats bar */}
        <section className="border-b bg-muted/40">
          <div className="container mx-auto px-4 py-6 flex flex-wrap justify-center gap-8 md:gap-16">
            {category.stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Article */}
        <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
            About {category.name} in the US
          </h2>
          {category.article.map((p, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed mb-4">{p}</p>
          ))}
        </section>

        {/* Category-specific interactive directories */}
        {slug === 'build-ops' && (
          <>
            <Separator />
            <BuildOpsTrades />
          </>
        )}
        {slug === 'design-and-build' && (
          <>
            <Separator />
            <DesignBuildDirectory />
          </>
        )}
        {slug === 'smart-security' && (
          <>
            <Separator />
            <SmartSecurityDirectory />
          </>
        )}
        {slug === 'capital' && (
          <>
            <Separator />
            <CapitalDirectory />
          </>
        )}
        {slug === 'ai-core' && (
          <>
            <Separator />
            <AICoreDirectory />
          </>
        )}
        {slug === 'legal-shield' && (
          <>
            <Separator />
            <LegalShieldDirectory />
          </>
        )}
        {slug === 'connections' && (
          <>
            <Separator />
            <ConnectionsDirectory />
          </>
        )}
        {slug === 'property-deals' && (
          <>
            <Separator />
            <PropertyDealsDirectory />
          </>
        )}
        {slug === 'sales-agents' && (
          <>
            <Separator />
            <SalesAgentsDirectory />
          </>
        )}
        {slug === 'living-solutions' && (
          <>
            <Separator />
            <LivingSolutionsDirectory />
          </>
        )}
        {slug === 'materials' && (
          <>
            <Separator />
            <MaterialsDirectory />
          </>
        )}

        <Separator />

        {/* Sub-categories */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
            Services We Cover
          </h2>
          <div className="flex flex-wrap gap-2">
            {category.subcategories.map((sc) => (
              <Badge key={sc} variant="secondary" className="text-sm py-1.5 px-3">
                {sc}
              </Badge>
            ))}
          </div>
        </section>

        <Separator />

        {/* Latest Jobs */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" /> Latest Jobs
            </h2>
            <Link to="/jobs" className="text-primary hover:underline text-sm flex items-center gap-1">
              View all jobs <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {jobs && jobs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {jobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-2">{job.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-1">
                      {job.location && (
                        <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</p>
                      )}
                      <p className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(job.created_at).toLocaleDateString('en-US')}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No open jobs in this category yet. <Link to="/post-job" className="text-primary hover:underline">Post one now</Link>.</p>
          )}
        </section>

        {/* CTA */}
        <section
          className="relative py-16 md:py-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${ctaBg})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative container mx-auto px-4 text-center max-w-2xl">
            <h2
              className="text-2xl md:text-3xl font-bold text-white mb-2 uppercase tracking-wide"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            >
              Ready to get started?
            </h2>
            <p className="text-white/80 mb-8">
              Get up to 3 quotes from verified {category.name.toLowerCase()} professionals
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/post-job">
                <Button variant="hero" size="lg">Post a Job Free</Button>
              </Link>
              <Link to="/auth?role=provider">
                <Button variant="hero-outline" size="lg">Join as a Provider</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Service Providers */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> Top Providers
            </h2>
            <Link to="/browse-providers" className="text-primary hover:underline text-sm flex items-center gap-1">
              Browse all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {providers && providers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {providers.map((p) => (
                <Link key={p.id} to={`/service-provider/${p.id}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.full_name || 'Provider'} className="h-full w-full object-cover" />
                        ) : (
                          <Users className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-semibold text-foreground">{p.full_name || 'Service Provider'}</p>
                      <div className="flex items-center gap-1">
                        {p.is_verified && <Badge variant="default" className="text-xs">Verified</Badge>}
                        {p.is_featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No providers listed yet. <Link to="/auth?role=provider" className="text-primary hover:underline">Join as a provider</Link>.</p>
          )}
        </section>

        <Separator />

        {/* FAQs */}
        <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" /> Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {category.faqs.map((faq, i) => (
              <div key={i}>
                <h3 className="font-semibold text-foreground mb-1">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ask an Expert */}
        <section
          aria-label="Ask an expert"
          className="relative py-16 md:py-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroAskExpert})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-full mb-5">
                <HelpCircle className="w-7 h-7 text-primary" />
              </div>
              <h2
                className="text-2xl md:text-3xl font-bold text-white mb-3"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
              >
                Got a {category.name} Question?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Get free advice from experienced {category.name.toLowerCase()} professionals.
                Post your question and our community of verified experts will help.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-center">
                  <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-white text-sm mb-1">Ask Anything</h3>
                  <p className="text-xs text-white/70">Post your {category.name.toLowerCase()} question</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-center">
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-white text-sm mb-1">Expert Answers</h3>
                  <p className="text-xs text-white/70">Qualified professionals respond</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-center">
                  <Star className="w-6 h-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-white text-sm mb-1">100% Free</h3>
                  <p className="text-xs text-white/70">No cost to ask or read answers</p>
                </div>
              </div>

              <Button asChild variant="hero" size="lg" className="gap-2">
                <Link to="/ask-expert">
                  Ask an Expert
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Latest Articles */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" /> Latest Articles
            </h2>
            <Link to="/blog" className="text-primary hover:underline text-sm flex items-center gap-1">
              View blog <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {blogPosts && blogPosts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    {post.featured_image_url && (
                      <img src={post.featured_image_url} alt={post.title} className="w-full h-40 object-cover rounded-t-lg" />
                    )}
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-2">{post.title}</CardTitle>
                    </CardHeader>
                    {post.excerpt && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
          <p className="text-muted-foreground">No articles for this category yet. Check back soon or <Link to="/blog" className="text-primary hover:underline">browse all articles</Link>.</p>
        )}
        </section>

        {/* Internal Links */}
        {category.internalLinks && category.internalLinks.length > 0 && (
          <>
            <Separator />
            <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground flex items-center gap-2">
                <ArrowRight className="h-6 w-6 text-primary" /> Explore More on Kluje
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.internalLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm font-medium text-foreground hover:text-primary"
                  >
                    <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

      </main>

      <Footer />
    </>
  );
}
