import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Clock, 
  PoundSterling,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  X,
  Eye
} from 'lucide-react';
import { MaskedLocation } from '@/components/MaskedLocation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SectionHeader } from '@/components/ui/section-header';

type JobPost = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
  category: { name: string; icon: string | null } | null;
  poster: { full_name: string | null; avatar_url: string | null } | null;
};

export function SocialJobPosts() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      // Use the secure RPC function to fetch public job listings
      const { data: jobsData, error } = await supabase
        .rpc('get_public_job_listings', { 
          p_category_id: null,
          p_limit: 6,
          p_offset: 0
        });

      if (error) throw error;
      if (!jobsData || jobsData.length === 0) {
        setJobs([]);
        return;
      }

      // Map the RPC response to JobPost format
      const formattedJobs: JobPost[] = jobsData.map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location_area,
        budget_min: job.budget_min,
        budget_max: job.budget_max,
        created_at: job.created_at,
        category: job.category_name ? { name: job.category_name, icon: job.category_icon } : null,
        poster: null, // RPC doesn't expose poster info for privacy
      }));

      setJobs(formattedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget flexible';
    if (min && max) return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
    if (min) return `From £${min.toLocaleString()}`;
    return `Up to £${max?.toLocaleString()}`;
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const shareToSocial = (platform: string, job: JobPost) => {
    const jobUrl = `${window.location.origin}/jobs/${job.id}`;
    const text = `Looking for help: ${job.title}${job.location ? ` in ${job.location}` : ''}. Check it out!`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(jobUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(jobUrl);
        toast.success('Link copied to clipboard!');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionHeader
            className="mb-12"
            eyebrow="Jobs"
            title="Latest Job Posts"
            subtitle="See what homeowners are looking for"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="h-20 bg-muted rounded mb-4" />
                <div className="h-8 bg-muted rounded w-full" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <section aria-label="Latest job posts" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <SectionHeader
          className="mb-12"
          eyebrow="Jobs"
          title="Latest Job Posts"
          subtitle="See what homeowners are looking for — quote on jobs and grow your business"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Header - Category and time */}
              <div className="p-4 pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  {job.category && (
                    <Badge variant="secondary" className="text-xs">
                      {job.category.name}
                    </Badge>
                  )}
                   <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                  {job.description}
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                  {job.location && (
                    <MaskedLocation
                      fullLocation={job.location}
                      maskedLocation={job.location}
                      allowReveal={false}
                      className="text-sm"
                    />
                  )}
                  <div className="flex items-center gap-1">
                    <PoundSterling className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>{formatBudget(job.budget_min, job.budget_max)}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-4 pb-4 pt-0 flex items-center gap-2">
                <Button 
                  asChild
                  variant="outline"
                  className="flex-1 gap-2"
                  size="sm"
                >
                  <Link to={`/jobs/${job.id}`}>
                    <Eye className="h-4 w-4" />
                    View Details
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => shareToSocial('facebook', job)}
                      className="gap-3 cursor-pointer"
                    >
                      <Facebook className="h-4 w-4 text-[#1877F2]" />
                      Share on Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => shareToSocial('twitter', job)}
                      className="gap-3 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      Share on X
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => shareToSocial('linkedin', job)}
                      className="gap-3 cursor-pointer"
                    >
                      <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                      Share on LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => shareToSocial('copy', job)}
                      className="gap-3 cursor-pointer"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Copy Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/jobs">
              View All Jobs
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

