 import { useState, useEffect } from 'react';
 import { SEOHead } from '@/components/SEOHead';
 import { useParams, Link, useNavigate } from 'react-router-dom';
 import { format } from 'date-fns';
 import { Calendar, ArrowLeft, Share2, Twitter, Facebook, Linkedin, Link2, Check, Clock, BookOpen } from 'lucide-react';
 import { supabase } from '@/integrations/supabase/client';
 import { Navbar } from '@/components/Navbar';
 import { Footer } from '@/components/Footer';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Card, CardContent } from '@/components/ui/card';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { BlogContentRenderer } from '@/components/blog/BlogContentRenderer';
 import { generateAlsoReadSuggestions } from '@/lib/autoLinking';
 
 interface BlogPostType {
   id: string;
   title: string;
   slug: string;
   excerpt: string | null;
   content: string;
   featured_image_url: string | null;
   meta_title: string | null;
   meta_description: string | null;
   meta_keywords: string[] | null;
    published_at: string;
    updated_at: string;
    author_id: string;
 }
 
 interface Author {
   id: string;
   full_name: string | null;
   avatar_url: string | null;
   bio: string | null;
 }
 
 interface RelatedPost {
   id: string;
   title: string;
   slug: string;
   excerpt: string | null;
   featured_image_url: string | null;
   published_at: string;
   meta_keywords?: string[] | null;
 }
 
 const BlogPost = () => {
   const { slug } = useParams<{ slug: string }>();
   const navigate = useNavigate();
   const [post, setPost] = useState<BlogPostType | null>(null);
   const [author, setAuthor] = useState<Author | null>(null);
   const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
   const [alsoReadPosts, setAlsoReadPosts] = useState<{ title: string; slug: string; excerpt: string | null }[]>([]);
   const [loading, setLoading] = useState(true);
   const [copied, setCopied] = useState(false);
 
   useEffect(() => {
     if (slug) {
       fetchPost();
     }
   }, [slug]);
 
   const fetchPost = async () => {
     try {
       const { data, error } = await supabase
         .from('blog_posts' as any)
         .select('*')
         .eq('slug', slug)
         .eq('status', 'published')
         .single();
 
       if (error || !data) {
         navigate('/blog');
         return;
       }
 
       const postData = data as unknown as BlogPostType;
       setPost(postData);
 
       // Fetch author
       const { data: authorData } = await supabase
         .from('profiles')
         .select('id, full_name, avatar_url, bio')
         .eq('id', postData.author_id)
         .single();
 
       if (authorData) {
         setAuthor(authorData);
       }
 
       // Fetch related posts (other published articles, excluding current)
       const { data: relatedData } = await supabase
         .from('blog_posts' as any)
         .select('id, title, slug, excerpt, featured_image_url, published_at, meta_keywords')
         .eq('status', 'published')
         .neq('id', postData.id)
         .order('published_at', { ascending: false })
         .limit(6);
 
       if (relatedData) {
         setRelatedPosts(relatedData as unknown as RelatedPost[]);
       }
 
       // Generate "Also Read" suggestions based on content analysis
       const alsoRead = await generateAlsoReadSuggestions(
         postData.id,
         postData.content,
         postData.meta_keywords
       );
       setAlsoReadPosts(alsoRead.map(p => ({ title: p.title, slug: p.slug, excerpt: p.excerpt })));
     } catch (error) {
       console.error('Error fetching post:', error);
       navigate('/blog');
     } finally {
       setLoading(false);
     }
   };
 
   const handleShare = (platform: string) => {
     const url = window.location.href;
     const title = post?.title || '';
 
     switch (platform) {
       case 'twitter':
         window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
         break;
       case 'facebook':
         window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
         break;
       case 'linkedin':
         window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
         break;
       case 'copy':
         navigator.clipboard.writeText(url);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
         break;
     }
   };
 
   const getInitials = (name: string | null) => {
     if (!name) return 'A';
     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
   };
 
   if (loading) {
     return (
       <div className="min-h-screen flex flex-col bg-background">
         <Navbar />
         <main className="flex-1 container mx-auto px-4 py-24">
           <Skeleton className="h-8 w-32 mb-8" />
           <Skeleton className="h-12 w-3/4 mb-4" />
           <Skeleton className="h-6 w-1/2 mb-8" />
           <Skeleton className="h-96 w-full mb-8" />
           <Skeleton className="h-4 w-full mb-2" />
           <Skeleton className="h-4 w-full mb-2" />
           <Skeleton className="h-4 w-2/3" />
         </main>
         <Footer />
       </div>
     );
   }
 
   if (!post) return null;
 
   return (
      <div className="min-h-screen flex flex-col bg-background">
        <SEOHead
          title={post.meta_title || post.title}
          description={post.meta_description || post.excerpt || undefined}
          keywords={post.meta_keywords || undefined}
          pageType="blog-post"
          pageContent={post.content}
          ogImage={post.featured_image_url || undefined}
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://kluje.com/blog/${post.slug}`
            },
            "headline": post.title,
            "description": post.excerpt || '',
            "image": post.featured_image_url || '',
            "datePublished": post.published_at,
            "dateModified": post.updated_at || post.published_at,
            "wordCount": post.content?.split(/\s+/).length || 0,
            "articleSection": post.meta_keywords?.[0] || "Home Improvement",
            "inLanguage": "en-US",
            "author": {
              "@type": "Person",
              "name": author?.full_name || "Kluje Team"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Kluje",
              "url": "https://kluje.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://kluje.com/favicon.png"
              }
            }
          }}
        />
        <Navbar />
       
       <main className="flex-1 pt-24">
         <article className="container mx-auto px-4 max-w-4xl">
           {/* Back Link */}
           <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
             <ArrowLeft className="h-4 w-4" />
             Back to Blog
           </Link>
 
           {/* Header */}
           <header className="mb-8">
             <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
               {post.title}
             </h1>
             
             <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
               <div className="flex items-center gap-2">
                 <Avatar className="h-10 w-10">
                   <AvatarImage src={author?.avatar_url || undefined} />
                   <AvatarFallback>{getInitials(author?.full_name)}</AvatarFallback>
                 </Avatar>
                 <span className="font-medium">{author?.full_name || 'Anonymous'}</span>
               </div>
               <span className="flex items-center gap-1">
                 <Calendar className="h-4 w-4" />
                 {format(new Date(post.published_at), 'MMMM d, yyyy')}
               </span>
               
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="sm" className="gap-2">
                     <Share2 className="h-4 w-4" />
                     Share
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent>
                   <DropdownMenuItem onClick={() => handleShare('twitter')}>
                     <Twitter className="h-4 w-4 mr-2" />
                     Twitter
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => handleShare('facebook')}>
                     <Facebook className="h-4 w-4 mr-2" />
                     Facebook
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                     <Linkedin className="h-4 w-4 mr-2" />
                     LinkedIn
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
 
             {post.meta_keywords && post.meta_keywords.length > 0 && (
               <div className="flex flex-wrap gap-2">
                 {post.meta_keywords.map((keyword, i) => (
                   <Badge key={i} variant="secondary">{keyword}</Badge>
                 ))}
               </div>
             )}
           </header>
 
           {/* Featured Image */}
           {post.featured_image_url && (
             <div className="mb-10 rounded-xl overflow-hidden">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                  loading="lazy"
                  decoding="async"
                />
             </div>
           )}
 
           {/* Excerpt */}
           {post.excerpt && (
             <div className="text-xl text-muted-foreground mb-8 pb-8 border-b">
               {post.excerpt}
             </div>
           )}
 
           {/* Content with Auto-Linking */}
           <BlogContentRenderer
             content={post.content}
             relatedPosts={relatedPosts.slice(0, 3)}
             alsoReadPosts={alsoReadPosts}
           />
 
           {/* Share Section */}
           <div className="mt-12 pt-8 border-t">
             <h3 className="text-lg font-semibold mb-4">Share this article</h3>
             <div className="flex flex-wrap gap-3">
               <Button
                 variant="outline"
                 size="lg"
                 onClick={() => handleShare('twitter')}
                 className="gap-2"
               >
                 <Twitter className="h-5 w-5" />
                 Twitter
               </Button>
               <Button
                 variant="outline"
                 size="lg"
                 onClick={() => handleShare('facebook')}
                 className="gap-2"
               >
                 <Facebook className="h-5 w-5" />
                 Facebook
               </Button>
               <Button
                 variant="outline"
                 size="lg"
                 onClick={() => handleShare('linkedin')}
                 className="gap-2"
               >
                 <Linkedin className="h-5 w-5" />
                 LinkedIn
               </Button>
               <Button
                 variant="outline"
                 size="lg"
                 onClick={() => handleShare('copy')}
                 className="gap-2"
               >
                 {copied ? <Check className="h-5 w-5 text-primary" /> : <Link2 className="h-5 w-5" />}
                 {copied ? 'Copied!' : 'Copy Link'}
               </Button>
             </div>
           </div>
 
           {/* Author Bio */}
           {author?.bio && (
             <div className="mt-12 p-6 bg-muted rounded-xl">
               <div className="flex items-start gap-4">
                 <Avatar className="h-16 w-16">
                   <AvatarImage src={author.avatar_url || undefined} />
                   <AvatarFallback className="text-xl">{getInitials(author.full_name)}</AvatarFallback>
                 </Avatar>
                 <div>
                   <h3 className="font-semibold text-lg mb-2">About {author.full_name}</h3>
                   <p className="text-muted-foreground">{author.bio}</p>
                 </div>
               </div>
             </div>
           )}
 
           {/* Related Articles */}
           {relatedPosts.length > 0 && (
             <div className="mt-12 pt-8 border-t">
               <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                 <BookOpen className="h-6 w-6 text-primary" />
                 Related Articles
               </h3>
               <div className="grid gap-6 md:grid-cols-3">
                 {relatedPosts.slice(0, 3).map((relatedPost) => (
                   <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                     <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                       {relatedPost.featured_image_url && (
                         <div className="aspect-video overflow-hidden">
                            <img
                              src={relatedPost.featured_image_url}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              decoding="async"
                            />
                         </div>
                       )}
                       <CardContent className="p-4">
                         <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
                           {relatedPost.title}
                         </h4>
                         {relatedPost.excerpt && (
                           <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                             {relatedPost.excerpt}
                           </p>
                         )}
                         <div className="flex items-center gap-1 text-xs text-muted-foreground">
                           <Clock className="h-3 w-3" />
                           {format(new Date(relatedPost.published_at), 'MMM d, yyyy')}
                         </div>
                       </CardContent>
                     </Card>
                   </Link>
                 ))}
               </div>
             </div>
           )}
         </article>
       </main>
 
       <Footer />
     </div>
   );
 };
 
 export default BlogPost;