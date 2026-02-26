import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

interface ProfileGallerySectionProps {
  images: GalleryImage[];
}

export const ProfileGallerySection = ({ images }: ProfileGallerySectionProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No photos in gallery yet.</p>
      </div>
    );
  }

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Photo Gallery</h2>
      
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className="aspect-[4/3] rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity"
          >
            <img 
              src={image.url} 
              alt={image.caption || `Gallery image ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          {selectedIndex !== null && (
            <div className="relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
                onClick={() => setSelectedIndex(null)}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Counter */}
              <div className="absolute top-4 left-4 text-white text-sm">
                {selectedIndex + 1} / {images.length}
              </div>

              {/* Image */}
              <div className="flex items-center justify-center min-h-[60vh] p-8">
                <img 
                  src={images[selectedIndex].url} 
                  alt={images[selectedIndex].caption || `Gallery image ${selectedIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                    onClick={handleNext}
                  >
                    <ChevronRight className="w-8 h-8" />
                  </Button>
                </>
              )}

              {/* Caption */}
              {images[selectedIndex].caption && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center bg-black/50 px-4 py-2 rounded">
                  {images[selectedIndex].caption}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
