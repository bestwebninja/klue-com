import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Image, Upload, X, GripVertical } from 'lucide-react';

interface PortfolioImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
}

interface DashboardPortfolioProps {
  userId: string;
}

const DashboardPortfolio = ({ userId }: DashboardPortfolioProps) => {
  const { toast } = useToast();
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    previewUrl: ''
  });

  useEffect(() => {
    fetchImages();
  }, [userId]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      // Use any type until types regenerate
      const { data, error } = await (supabase as any)
        .from('portfolio_images')
        .select('*')
        .eq('provider_id', userId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages((data as PortfolioImage[]) || []);
    } catch (error: any) {
      console.error('Error fetching portfolio:', error);
      toast({ title: 'Error loading portfolio', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File must be under 5MB', variant: 'destructive' });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, file, previewUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file && !editingImage) {
      toast({ title: 'Please select an image', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      let imageUrl = editingImage?.image_url || '';

      // Upload new file if provided
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(fileName, formData.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      if (editingImage) {
        // Update existing
        const { error } = await (supabase as any)
          .from('portfolio_images')
          .update({
            title: formData.title.trim() || null,
            description: formData.description.trim() || null,
            image_url: imageUrl
          })
          .eq('id', editingImage.id);

        if (error) throw error;
        toast({ title: 'Image updated successfully' });
      } else {
        // Insert new
        const { error } = await (supabase as any)
          .from('portfolio_images')
          .insert({
            provider_id: userId,
            image_url: imageUrl,
            title: formData.title.trim() || null,
            description: formData.description.trim() || null,
            display_order: images.length
          });

        if (error) throw error;
        toast({ title: 'Image added to portfolio' });
      }

      setDialogOpen(false);
      resetForm();
      fetchImages();
    } catch (error: any) {
      console.error('Error saving image:', error);
      toast({ title: error.message || 'Error saving image', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: PortfolioImage) => {
    if (!confirm('Delete this image from your portfolio?')) return;

    try {
      const { error } = await (supabase as any)
        .from('portfolio_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      // Try to delete from storage too
      const urlParts = image.image_url.split('/');
      const path = `${userId}/${urlParts[urlParts.length - 1]}`;
      await supabase.storage.from('portfolio').remove([path]);

      toast({ title: 'Image deleted' });
      fetchImages();
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({ title: 'Error deleting image', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', file: null, previewUrl: '' });
    setEditingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openEditDialog = (image: PortfolioImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title || '',
      description: image.description || '',
      file: null,
      previewUrl: image.image_url
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Portfolio Gallery
            </CardTitle>
            <CardDescription>
              Showcase your best work to attract customers. Add photos of completed projects.
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingImage ? 'Edit Image' : 'Add Portfolio Image'}</DialogTitle>
                <DialogDescription>
                  {editingImage ? 'Update the image details' : 'Upload a photo of your work'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload/Preview */}
                <div className="space-y-2">
                  <Label>Image</Label>
                  {formData.previewUrl ? (
                    <div className="relative">
                      <img 
                        src={formData.previewUrl} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, file: null, previewUrl: editingImage?.image_url || '' }))}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload an image</p>
                      <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title (optional)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Kitchen Renovation"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the project..."
                    rows={3}
                    maxLength={300}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading || (!formData.file && !editingImage)}>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      editingImage ? 'Update' : 'Add Image'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No portfolio images yet</p>
              <p className="text-sm">Add photos of your completed projects to attract more customers</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <img 
                    src={image.image_url} 
                    alt={image.title || 'Portfolio'} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    {image.title && (
                      <p className="text-white font-medium text-sm truncate">{image.title}</p>
                    )}
                    {image.description && (
                      <p className="text-white/70 text-xs line-clamp-2">{image.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="flex-1"
                        onClick={() => openEditDialog(image)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(image)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPortfolio;