import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Check, X, Edit, Trash2, Eye, FileText, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  author_id: string;
  author_name?: string;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function AdminBlogPosts() {
  const { toast } = useToast();
  const { logAction } = useAuditLog();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [adminId, setAdminId] = useState<string>('');

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
    // Get current admin user ID
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setAdminId(data.user.id);
    });
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .order('created_at', { ascending: false });

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
          author_name: profileMap.get(post.author_id) || 'Unknown'
        }));
        
        setPosts(postsWithAuthors);
      } else {
        setPosts([]);
      }
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

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Title and content are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
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
        published_at: status === 'published' ? new Date().toISOString() : null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts' as any)
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        
        await logAction({ action: 'update_blog_post', entityType: 'blog_post', entityId: editingPost.id, details: { title, status } });
        toast({ title: 'Post updated!' });
      } else {
        const { error } = await supabase
          .from('blog_posts' as any)
          .insert({ ...postData, author_id: userId });

        if (error) throw error;
        toast({ title: status === 'published' ? 'Post published!' : 'Draft saved!' });
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

  const handleStatusChange = async (post: BlogPost, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('blog_posts' as any)
        .update(updateData)
        .eq('id', post.id);

      if (error) throw error;

      await logAction({ action: 'update_blog_post_status', entityType: 'blog_post', entityId: post.id, details: { old_status: post.status, new_status: newStatus } });

      toast({ 
        title: newStatus === 'published' 
          ? 'Post published!' 
          : newStatus === 'rejected' 
            ? 'Post rejected' 
            : 'Status updated'
      });
      
      fetchPosts();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Failed to update status', variant: 'destructive' });
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
      
      await logAction({ action: 'delete_blog_post', entityType: 'blog_post', entityId: deletingPost.id, details: { title: deletingPost.title } });
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
        return <Badge className="bg-accent text-accent-foreground">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingPosts = posts.filter(p => p.status === 'pending');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
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
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Pending Review
              {pendingPosts.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingPosts.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <Button onClick={openNewDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Blog Posts</CardTitle>
              <CardDescription>Manage all blog posts on the platform</CardDescription>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No blog posts found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
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
                          By {post.author_name} • {format(new Date(post.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.status === 'published' && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>Review and approve submitted blog posts</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPosts.length === 0 ? (
                <div className="text-center py-12">
                  <Check className="h-12 w-12 mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground">No posts pending review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            By {post.author_name} • Submitted {format(new Date(post.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => handleStatusChange(post, 'published')}
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                            onClick={() => handleStatusChange(post, 'rejected')}
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                      {post.excerpt && (
                        <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(post)}>
                        View & Edit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            <DialogDescription>
              {editingPost 
                ? 'Edit this blog post with AI assistance.'
                : 'Create a new blog post with AI-powered writing tools.'}
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
            userId={adminId}
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
              onClick={() => handleSave('published')}
              disabled={saving}
            >
              Publish Now
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
