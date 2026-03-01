import { Link } from 'react-router-dom';
import { FileText, Tag, User, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  tags?: string[];
  author: string;
  date: string;
}

interface ProfileBlogsSectionProps {
  posts: BlogPost[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const ProfileBlogsSection = ({ 
  posts, 
  currentPage = 1,
  totalPages = 1,
  onPageChange 
}: ProfileBlogsSectionProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No blog posts yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Blogs</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {posts.map((post) => (
          <Link key={post.id} to={`/blog/${post.id}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
            {/* Image */}
            <div className="aspect-[16/10] bg-muted">
              {post.imageUrl ? (
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <CardContent className="p-4">
              {/* Title */}
              <h3 className="font-semibold text-foreground line-clamp-2 mb-2 hover:text-primary transition-colors">
                {post.title}
              </h3>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Tag className="w-3 h-3" />
                  <span>{post.tags.join(', ')}</span>
                </div>
              )}

              {/* Author & Date */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(post.date)}
                </span>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-sm text-muted-foreground">
            Page: {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded border border-border flex items-center justify-center disabled:opacity-50"
            >
              &lt;
            </button>
            <button 
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded border border-border flex items-center justify-center disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
