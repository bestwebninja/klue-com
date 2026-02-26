import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye, Send, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BlogEditor } from '@/components/blog/BlogEditor';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

interface DashboardBlogPostsProps {
  userId: string;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export function DashboardBlogPosts({ userId }: DashboardBlogPostsProps) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as unknown as BlogPost[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({ title: 'Failed to load posts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setExcerpt('');
    setContent('');
    setFeaturedImageUrl('');
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords([]);
    setEditingPost(null);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setExcerpt(post.excerpt || '');
    setContent(post.content);
    setFeaturedImageUrl(post.featured_image_url || '');
    setMetaTitle(post.meta_title || '');
    setMetaDescription(post.meta_description || '');
    setMetaKeywords(post.meta_keywords || []);
    setDialogOpen(true);
  };

  const handleSave = async (status: 'draft' | 'pending') => {
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Title and content are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const slug = generateSlug(title) + '-' + Date.now().toString(36);
      
      const postData = {
        title: title.trim(),
        slug: editingPost?.slug || slug,
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        featured_image_url: featuredImageUrl.trim() || null,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        meta_keywords: metaKeywords.length > 0 ? metaKeywords : null,
        status,
        published_at: null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts' as any)
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        toast({ title: 'Post updated!' });
      } else {
        const { error } = await supabase
          .from('blog_posts' as any)
          .insert({ ...postData, author_id: userId });

        if (error) throw error;
        toast({ 
          title: status === 'pending' ? 'Post submitted for review!' : 'Draft saved!' 
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({ title: 'Failed to save post', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPost) return;

    try {
      const { error } = await supabase
        .from('blog_posts' as any)
        .delete()
        .eq('id', deletingPost.id);

      if (error) throw error;
      toast({ title: 'Post deleted' });
      setDeleteDialogOpen(false);
      setDeletingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: 'Failed to delete post', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-primary">Published</Badge>;
      case 'pending':
        return <Badge className="bg-accent text-accent-foreground">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Blog Posts</CardTitle>
            <CardDescription>Write and manage your blog articles</CardDescription>
          </div>
          <Button onClick={openNewDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You haven't written any posts yet.</p>
              <Button onClick={openNewDialog} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Write your first post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium truncate">{post.title}</h3>
                      {getStatusBadge(post.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {post.published_at
                        ? `Published ${format(new Date(post.published_at), 'MMM d, yyyy')}`
                        : `Created ${format(new Date(post.created_at), 'MMM d, yyyy')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.status === 'published' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {(post.status === 'draft' || post.status === 'rejected') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {post.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingPost(post);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Post' : 'New Blog Post'}</DialogTitle>
            <DialogDescription>
              {editingPost 
                ? 'Update your blog post and save or submit for review.'
                : 'Write your blog post using AI assistance or manually.'}
            </DialogDescription>
          </DialogHeader>

          <BlogEditor
            title={title}
            setTitle={setTitle}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            content={content}
            setContent={setContent}
            featuredImageUrl={featuredImageUrl}
            setFeaturedImageUrl={setFeaturedImageUrl}
            metaTitle={metaTitle}
            setMetaTitle={setMetaTitle}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            metaKeywords={metaKeywords}
            setMetaKeywords={setMetaKeywords}
            userId={userId}
          />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleSave('draft')}
              disabled={saving}
            >
              Save as Draft
            </Button>
            <Button 
              onClick={() => handleSave('pending')}
              disabled={saving}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPost?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
