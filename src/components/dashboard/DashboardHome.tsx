import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, Settings, MapPin, ClipboardList, MessageSquare, Star, 
  HelpCircle, FileText, Image, Shield, BookOpen, TrendingUp,
  CheckCircle, Clock, ExternalLink, ArrowRight, Briefcase, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateDistance } from '@/lib/distance';
import type { Database } from '@/integrations/supabase/types';

type JobLead = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
  category_name: string | null;
  distance?: number;
};

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardHomeProps {
  userId: string;
  profile: Profile | null;
  onNavigate: (tab: string) => void;
}

interface DashboardStats {
  totalQuotes: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  unreadMessages: number;
  totalReviews: number;
  averageRating: number;
  portfolioCount: number;
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  blogPostCount: number;
}

const DashboardHome = ({ userId, profile, onNavigate }: DashboardHomeProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 0,
    pendingQuotes: 0,
    acceptedQuotes: 0,
    unreadMessages: 0,
    totalReviews: 0,
    averageRating: 0,
    portfolioCount: 0,
    verificationStatus: 'none',
    blogPostCount: 0
  });
  const [jobLeads, setJobLeads] = useState<JobLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchJobLeads();
  }, [userId]);

  const fetchStats = async () => {
    try {
      // Fetch stats - use any for new tables until types regenerate
      const [quotesRes, messagesRes, reviewsRes] = await Promise.all([
        supabase.from('quote_requests').select('status').eq('provider_id', userId),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('recipient_id', userId).is('read_at', null),
        supabase.from('reviews').select('rating').eq('provider_id', userId)
      ]);

      // Fetch from new tables separately with any type
      let portfolioCount = 0;
      let verificationStatus: 'none' | 'pending' | 'approved' | 'rejected' = 'none';
      let blogPostCount = 0;

      try {
        const { count } = await (supabase as any).from('portfolio_images').select('id', { count: 'exact', head: true }).eq('provider_id', userId);
        portfolioCount = count || 0;
      } catch (e) { /* table may not exist yet */ }

      try {
        const { data } = await (supabase as any).from('verification_requests').select('status').eq('provider_id', userId).maybeSingle();
        if (data?.status) verificationStatus = data.status;
      } catch (e) { /* table may not exist yet */ }

      try {
        const { count } = await (supabase as any).from('provider_blog_posts').select('id', { count: 'exact', head: true }).eq('provider_id', userId);
        blogPostCount = count || 0;
      } catch (e) { /* table may not exist yet */ }

      const quotes = quotesRes.data || [];
      const reviews = reviewsRes.data || [];
      
      setStats({
        totalQuotes: quotes.length,
        pendingQuotes: quotes.filter(q => q.status === 'pending').length,
        acceptedQuotes: quotes.filter(q => q.status === 'accepted' || q.status === 'completed').length,
        unreadMessages: messagesRes.count || 0,
        totalReviews: reviews.length,
        averageRating: reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0,
        portfolioCount,
        verificationStatus,
        blogPostCount
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobLeads = async () => {
    try {
      // Fetch provider's service categories
      const { data: services } = await supabase
        .from('provider_services')
        .select('category_id')
        .eq('provider_id', userId);

      const providerCategories = services?.map(s => s.category_id).filter(Boolean) || [];

      // Fetch provider's primary location
      let providerLat: number | null = null;
      let providerLng: number | null = null;

      const { data: location } = await supabase
        .from('provider_locations')
        .select('latitude, longitude')
        .eq('provider_id', userId)
        .eq('is_primary', true)
        .maybeSingle();

      if (location?.latitude && location?.longitude) {
        providerLat = Number(location.latitude);
        providerLng = Number(location.longitude);
      }

      // Fetch existing quote requests to exclude
      const { data: existingQuotes } = await supabase
        .from('quote_requests')
        .select('job_listing_id')
        .eq('provider_id', userId);

      const quotedJobIds = existingQuotes?.map(q => q.job_listing_id).filter(Boolean) || [];

      // Fetch open jobs matching provider categories
      let query = supabase
        .from('job_listings')
        .select('id, title, description, location, budget_min, budget_max, created_at, latitude, longitude, category_id, service_categories(name)')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (providerCategories.length > 0) {
        query = query.in('category_id', providerCategories);
      }

      const { data: jobs } = await query.limit(20);

      if (jobs) {
        // Filter out already quoted jobs and calculate distance
        const leads: JobLead[] = jobs
          .filter(job => !quotedJobIds.includes(job.id))
          .map(job => {
            let distance: number | undefined;
            if (providerLat && providerLng && job.latitude && job.longitude) {
              distance = calculateDistance(
                providerLat,
                providerLng,
                Number(job.latitude),
                Number(job.longitude)
              );
            }
            return {
              id: job.id,
              title: job.title,
              description: job.description,
              location: job.location,
              budget_min: job.budget_min ? Number(job.budget_min) : null,
              budget_max: job.budget_max ? Number(job.budget_max) : null,
              created_at: job.created_at,
              category_name: (job.service_categories as any)?.name || null,
              distance
            };
          })
          .sort((a, b) => {
            // Sort by distance if available, otherwise by date
            if (a.distance !== undefined && b.distance !== undefined) {
              return a.distance - b.distance;
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
          .slice(0, 5); // Show top 5 leads

        setJobLeads(leads);
      }
    } catch (error) {
      console.error('Error fetching job leads:', error);
    }
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget TBD';
    if (min && max) return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
    if (min) return `From £${min.toLocaleString()}`;
    return `Up to £${max?.toLocaleString()}`;
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return posted.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const quickActions = [
    {
      title: 'My Quotes',
      description: `${stats.pendingQuotes} pending, ${stats.acceptedQuotes} accepted`,
      icon: ClipboardList,
      tab: 'quotes',
      badge: stats.pendingQuotes > 0 ? stats.pendingQuotes : undefined,
      color: 'text-primary'
    },
    {
      title: 'Messages',
      description: `${stats.unreadMessages} unread messages`,
      icon: MessageSquare,
      tab: 'messages',
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : undefined,
      color: 'text-primary'
    },
    {
      title: 'Reviews',
      description: stats.totalReviews > 0 
        ? `${stats.averageRating.toFixed(1)} avg (${stats.totalReviews} reviews)` 
        : 'No reviews yet',
      icon: Star,
      tab: 'reviews',
      color: 'text-primary'
    },
    {
      title: 'Expert Q&A',
      description: 'Answer questions to boost visibility',
      icon: HelpCircle,
      tab: 'expert',
      color: 'text-primary'
    }
  ];

  const profileSetupCards = [
    {
      title: 'Profile',
      description: 'Update your business details',
      icon: User,
      tab: 'profile',
      complete: Boolean(profile?.full_name && profile?.bio)
    },
    {
      title: 'Services',
      description: 'List the services you offer',
      icon: Settings,
      tab: 'services'
    },
    {
      title: 'Locations',
      description: 'Set your service areas',
      icon: MapPin,
      tab: 'locations'
    },
    {
      title: 'Portfolio',
      description: `${stats.portfolioCount} images uploaded`,
      icon: Image,
      tab: 'portfolio'
    },
    {
      title: 'Verification',
      description: stats.verificationStatus === 'approved' 
        ? 'Verified ✓' 
        : stats.verificationStatus === 'pending' 
          ? 'Pending review' 
          : 'Get verified',
      icon: Shield,
      tab: 'verification',
      status: stats.verificationStatus
    },
    {
      title: 'Blog Posts',
      description: `${stats.blogPostCount} posts`,
      icon: BookOpen,
      tab: 'blog'
    }
  ];

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-secondary text-secondary-foreground border-border">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-1">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Provider'}!
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {profile?.subscription_status === 'active' 
                  ? 'Your Pro subscription is active' 
                  : 'Upgrade to Pro to unlock all features'}
              </p>
            </div>
            <Link to={`/service-provider/${userId}`} target="_blank">
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                <ExternalLink className="w-4 h-4" />
                <span className="sm:inline">View Public Profile</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold">{stats.totalQuotes}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Quotes</p>
              </div>
              <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold">{stats.acceptedQuotes}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Jobs Won</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Avg Rating</p>
              </div>
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold">{stats.totalReviews}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Reviews</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Leads Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              New Job Leads
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Jobs matching your services</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('jobs')} className="w-full sm:w-auto">
            View All Jobs
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {jobLeads.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-2">No job leads available</p>
              <p className="text-sm text-muted-foreground">
                Add services to your profile to see matching jobs
              </p>
              <Button variant="link" onClick={() => onNavigate('services')} className="mt-2">
                Add Services
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobLeads.map((job) => (
              <Card 
                key={job.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => onNavigate('jobs')}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {job.category_name && (
                          <Badge variant="secondary" className="text-xs">
                            {job.category_name}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(job.created_at)}
                        </span>
                        {job.distance !== undefined && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.distance.toFixed(1)} mi
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-foreground truncate">{job.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {job.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        {job.location && (
                          <span className="text-muted-foreground truncate max-w-[150px]">
                            {job.location.split(',')[0]}
                          </span>
                        )}
                        <span className="font-medium text-foreground">
                          {formatBudget(job.budget_min, job.budget_max)}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" className="shrink-0">
                      <Send className="w-4 h-4 mr-1" />
                      Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.tab} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => onNavigate(action.tab)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <Icon className={`w-6 h-6 ${action.color}`} />
                    {action.badge && (
                      <Badge variant="destructive" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium mb-1">{action.title}</h4>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Profile Setup */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Setup</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {profileSetupCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card 
                key={card.tab} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => onNavigate(card.tab)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                    {card.status && getVerificationBadge(card.status)}
                  </div>
                  <h4 className="font-medium mb-1">{card.title}</h4>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-3" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Subscription Card */}
      <Card className="border-primary/30">
        <CardContent className="py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
              <div className="min-w-0">
                <h4 className="font-semibold text-sm sm:text-base">
                  {profile?.subscription_status === 'active' ? 'Pro Plan' : 'Free Plan'}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {profile?.subscription_status === 'active' 
                    ? 'Full access to all features' 
                    : 'Upgrade to request quotes and grow your business'}
                </p>
              </div>
            </div>
            <Button onClick={() => onNavigate('subscription')} className="w-full sm:w-auto">
              {profile?.subscription_status === 'active' ? 'Manage' : 'Upgrade'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;