import { useState, useRef, useCallback } from 'react';
import { Wand2, Loader2, Search, Sparkles, PenLine, Upload, X, ImageIcon, Eye, EyeOff, Columns2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BlogToolbar } from './BlogToolbar';
import { MarkdownPreview } from './MarkdownPreview';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BlogEditorProps {
  title: string;
  setTitle: (value: string) => void;
  excerpt: string;
  setExcerpt: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  featuredImageUrl: string;
  setFeaturedImageUrl: (value: string) => void;
  metaTitle: string;
  setMetaTitle: (value: string) => void;
  metaDescription: string;
  setMetaDescription: (value: string) => void;
  metaKeywords: string[];
  setMetaKeywords: (value: string[]) => void;
  userId: string;
}

export function BlogEditor({
  title,
  setTitle,
  excerpt,
  setExcerpt,
  content,
  setContent,
  featuredImageUrl,
  setFeaturedImageUrl,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  metaKeywords,
  setMetaKeywords,
  userId,
}: BlogEditorProps) {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [generateTopic, setGenerateTopic] = useState('');
  const [generateKeywords, setGenerateKeywords] = useState('');
  const [editInstruction, setEditInstruction] = useState('');
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [featuredImageUploading, setFeaturedImageUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'editor' | 'preview' | 'split'>('split');
  // Undo/Redo history
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const pushHistory = useCallback((newContent: string) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      // Keep max 50 history entries
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    pushHistory(newContent);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleFeaturedImageUpload = async (file: File) => {
    if (!userId) {
      toast({ title: 'Please log in to upload images', variant: 'destructive' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setFeaturedImageUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `featured-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setFeaturedImageUrl(publicUrl);
      toast({ title: 'Featured image uploaded!' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Failed to upload image', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setFeaturedImageUploading(false);
    }
  };

  const onFeaturedImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFeaturedImageUpload(file);
    }
    if (featuredImageInputRef.current) {
      featuredImageInputRef.current.value = '';
    }
  };

  const callBlogAI = async (action: string, payload: any) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blog-ai-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.session.access_token}`,
      },
      body: JSON.stringify({ action, ...payload }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI request failed');
    }

    return response.json();
  };

  const handleGenerateArticle = async () => {
    if (!generateTopic.trim()) {
      toast({ title: 'Please enter a topic', variant: 'destructive' });
      return;
    }

    setAiLoading('generate');
    try {
      const keywords = generateKeywords.split(',').map(k => k.trim()).filter(Boolean);
      const result = await callBlogAI('generate', { 
        topic: generateTopic,
        keywords: keywords.length > 0 ? keywords : undefined 
      });
      
      if (result.content) {
        // Extract title from first line if it starts with #
        const lines = result.content.split('\n');
        let generatedTitle = generateTopic;
        let generatedContent = result.content;
        
        if (lines[0].startsWith('# ')) {
          generatedTitle = lines[0].slice(2);
          generatedContent = lines.slice(1).join('\n').trim();
        }
        
        setTitle(generatedTitle);
        setContent(generatedContent);
        setGenerateDialogOpen(false);
        toast({ title: 'Article generated successfully!' });
      }
    } catch (error) {
      toast({ 
        title: 'Failed to generate article',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setAiLoading(null);
    }
  };

  const handleImproveContent = async () => {
    if (!content.trim()) {
      toast({ title: 'No content to improve', variant: 'destructive' });
      return;
    }

    setAiLoading('improve');
    try {
      const result = await callBlogAI('improve', { content });
      
      if (result.content) {
        setContent(result.content);
        toast({ title: 'Content improved!' });
      }
    } catch (error) {
      toast({ 
        title: 'Failed to improve content',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setAiLoading(null);
    }
  };

  const handleOptimizeSEO = async () => {
    if (!content.trim() || !title.trim()) {
      toast({ title: 'Add title and content first', variant: 'destructive' });
      return;
    }

    setAiLoading('seo');
    try {
      const result = await callBlogAI('seo', { title, content });
      
      if (result.data) {
        const seo = result.data;
        if (seo.meta_title) setMetaTitle(seo.meta_title);
        if (seo.meta_description) setMetaDescription(seo.meta_description);
        if (seo.meta_keywords) setMetaKeywords(seo.meta_keywords);
        if (seo.improved_title && seo.improved_title !== title) {
          setTitle(seo.improved_title);
        }
        if (seo.improved_excerpt) setExcerpt(seo.improved_excerpt);
        
        const suggestions = seo.suggestions?.join('\n• ') || '';
        toast({ 
          title: 'SEO optimized!',
          description: suggestions ? `Suggestions:\n• ${suggestions}` : undefined,
        });
      }
    } catch (error) {
      toast({ 
        title: 'Failed to optimize SEO',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setAiLoading(null);
    }
  };

  const handleEditWithAI = async () => {
    if (!content.trim() || !editInstruction.trim()) {
      toast({ title: 'Add content and instructions', variant: 'destructive' });
      return;
    }

    setAiLoading('edit');
    try {
      const result = await callBlogAI('edit', { 
        content, 
        topic: editInstruction 
      });
      
      if (result.content) {
        setContent(result.content);
        setEditDialogOpen(false);
        setEditInstruction('');
        toast({ title: 'Content edited!' });
      }
    } catch (error) {
      toast({ 
        title: 'Failed to edit content',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Actions */}
      <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Generate Article
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Article with AI</DialogTitle>
              <DialogDescription>
                Enter a topic and optional keywords to generate a complete blog article.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., How to choose the right plumber for your home"
                  value={generateTopic}
                  onChange={(e) => setGenerateTopic(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated, optional)</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., plumber, home repairs, UK services"
                  value={generateKeywords}
                  onChange={(e) => setGenerateKeywords(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateArticle} disabled={aiLoading === 'generate'}>
                {aiLoading === 'generate' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={handleImproveContent}
          disabled={aiLoading === 'improve' || !content.trim()}
        >
          {aiLoading === 'improve' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Improve Writing
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={handleOptimizeSEO}
          disabled={aiLoading === 'seo' || !content.trim() || !title.trim()}
        >
          {aiLoading === 'seo' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Optimize SEO
        </Button>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2" disabled={!content.trim()}>
              <PenLine className="h-4 w-4" />
              Edit with AI
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Content with AI</DialogTitle>
              <DialogDescription>
                Describe how you want to edit or change your content.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="instruction">Instructions</Label>
                <Textarea
                  id="instruction"
                  placeholder="e.g., Make it more formal, add more examples, shorten the introduction..."
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditWithAI} disabled={aiLoading === 'edit'}>
                {aiLoading === 'edit' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Editing...
                  </>
                ) : (
                  <>
                    <PenLine className="h-4 w-4 mr-2" />
                    Apply Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Enter article title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          placeholder="Brief summary of the article (optional)"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
        />
      </div>

      {/* Content with Toolbar and Preview */}
      <div className="space-y-0">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="content">Content *</Label>
          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/50">
            <Button
              variant={previewMode === 'editor' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2 gap-1.5"
              onClick={() => setPreviewMode('editor')}
            >
              <EyeOff className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </Button>
            <Button
              variant={previewMode === 'split' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2 gap-1.5"
              onClick={() => setPreviewMode('split')}
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Split</span>
            </Button>
            <Button
              variant={previewMode === 'preview' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2 gap-1.5"
              onClick={() => setPreviewMode('preview')}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </div>
        </div>
        
        {previewMode !== 'preview' && (
          <BlogToolbar
            textareaRef={textareaRef}
            content={content}
            setContent={handleContentChange}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            userId={userId}
          />
        )}
        
        <div className={`grid gap-4 ${previewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Editor Pane */}
          {previewMode !== 'preview' && (
            <div className="min-h-[500px]">
              <Textarea
                ref={textareaRef}
                id="content"
                placeholder="Write your article content here. Use the toolbar above to format your text, or type markdown directly."
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className={`font-mono text-sm h-full min-h-[500px] resize-none ${previewMode === 'split' ? 'rounded-t-none border-t-0' : 'rounded-t-none border-t-0'}`}
              />
            </div>
          )}
          
          {/* Preview Pane */}
          {(previewMode === 'preview' || previewMode === 'split') && (
            <div className={`border rounded-lg bg-background ${previewMode === 'preview' ? '' : 'lg:rounded-t-none lg:border-t-0'}`}>
              <div className="sticky top-0 bg-muted/80 backdrop-blur-sm border-b px-4 py-2 rounded-t-lg flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Preview</span>
              </div>
              <ScrollArea className="h-[500px]">
                <div className="p-4">
                  {content ? (
                    <MarkdownPreview content={content} />
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      Start writing to see the preview...
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Supports Markdown: ## headings, **bold**, *italic*, - lists, [links](url), and more
        </p>
      </div>

      {/* Featured Image */}
      <div className="space-y-3">
        <Label>Featured Image</Label>
        <input
          ref={featuredImageInputRef}
          type="file"
          accept="image/*"
          onChange={onFeaturedImageFileChange}
          className="hidden"
        />
        
        {featuredImageUrl ? (
          <div className="relative rounded-lg border overflow-hidden">
            <img 
              src={featuredImageUrl} 
              alt="Featured" 
              className="w-full h-48 object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 gap-1"
                onClick={() => featuredImageInputRef.current?.click()}
                disabled={featuredImageUploading}
              >
                <Upload className="h-3 w-3" />
                Replace
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0"
                onClick={() => setFeaturedImageUrl('')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="pt-4">
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => featuredImageInputRef.current?.click()}
              >
                {featuredImageUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload featured image</p>
                    <p className="text-xs text-muted-foreground">Max 5MB • JPG, PNG, GIF, WebP</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="url" className="pt-4">
              <Input
                placeholder="https://example.com/image.jpg"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* SEO Section */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold">SEO Settings</h3>
        
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            placeholder="SEO title (max 60 characters)"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">{metaTitle.length}/60 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            placeholder="SEO description (max 160 characters)"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            maxLength={160}
            rows={2}
          />
          <p className="text-xs text-muted-foreground">{metaDescription.length}/160 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaKeywords">Keywords (comma-separated)</Label>
          <Input
            id="metaKeywords"
            placeholder="keyword1, keyword2, keyword3"
            value={metaKeywords.join(', ')}
            onChange={(e) => setMetaKeywords(e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
          />
        </div>
      </div>
    </div>
  );
}
