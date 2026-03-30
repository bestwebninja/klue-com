import { useState, useEffect } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import heroBlog from '@/assets/hero-blog.jpg';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string;
  author_id: string;
  author_name?: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('id, title, slug, excerpt, featured_image_url, published_at, author_id')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      // Fetch author names
      if (data && data.length > 0) {
        const authorIds = [...new Set(data.map((p: any) => p.author_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', authorIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
        
        const postsWithAuthors = data.map((post: any) => ({
          ...post,
          author_name: profileMap.get(post.author_id) || 'Anonymous'
        }));
        
        setPosts(postsWithAuthors);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        pageType="blog"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Tips & Guides for Home Improvement | Kluje",
          "description": "Read expert articles on hiring tradespeople, home renovation tips, event planning, and business services from experienced US professionals.",
          "url": "https://klue-us.lovable.app/blog",
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": posts.length,
            "itemListElement": posts.slice(0, 10).map((post, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "url": `https://klue-us.lovable.app/blog/${post.slug}`,
              "name": post.title,
            })),
          },
        }}
      />
      <Navbar />
      
      <PageHero
        backgroundImage={heroBlog}
        imageAlt="Kluje blog — expert home improvement tips and guides for US homeowners and contractors"
        title="Kluje Blog"
        description="Tips, guides, and insights for homeowners and service providers"
      />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        {/* Search */}
        <div className="max-w-md mx-auto mb-8 sm:mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              {searchQuery ? 'No articles found matching your search.' : 'No blog posts published yet.'}
            </p>
            <p className="text-sm text-muted-foreground">
              While you're here, why not <Link to="/post-job" className="text-primary font-medium hover:underline">post a job for free</Link> or{" "}
              <Link to="/ask-expert" className="text-primary font-medium hover:underline">ask an expert a question</Link>?
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <Link to={`/blog/${post.slug}`}>
                  {post.featured_image_url ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-muted flex items-center justify-center">
                      <span className="text-4xl text-muted-foreground/50">📝</span>
                    </div>
                  )}
                </Link>
                
                <CardHeader>
                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>
                </CardHeader>
                
                <CardContent>
                  {post.excerpt && (
                    <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  )}
                </CardContent>
                
                <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(post.published_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <Button variant="ghost" size="sm" className="gap-1 -mr-2">
                      Read
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Cross-linking section */}
        <div className="mt-12 text-center border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Looking for a service provider? <Link to="/browse-providers" className="text-primary font-medium hover:underline">Browse verified professionals near you</Link> or{" "}
            <Link to="/how-it-works" className="text-primary font-medium hover:underline">learn how Kluje connects homeowners with tradespeople</Link>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
