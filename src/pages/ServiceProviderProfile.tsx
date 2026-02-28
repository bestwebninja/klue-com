import { useParams, Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LoginPromptDialog } from "@/components/LoginPromptDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ProfileHero } from "@/components/provider-profile/ProfileHero";
import { ProfileStatsBar } from "@/components/provider-profile/ProfileStatsBar";
import { ProfileStatsRow } from "@/components/provider-profile/ProfileStatsRow";
import { ProfileTabs, type ProfileTabId } from "@/components/provider-profile/ProfileTabs";
import { ProfileAboutSection } from "@/components/provider-profile/ProfileAboutSection";
import { ProfileSkillsSection } from "@/components/provider-profile/ProfileSkillsSection";
import { ProfileGallerySection } from "@/components/provider-profile/ProfileGallerySection";
import { ProfileAnswersSection } from "@/components/provider-profile/ProfileAnswersSection";
import { ProfileBlogsSection } from "@/components/provider-profile/ProfileBlogsSection";
import { ProfileReviewsSection } from "@/components/provider-profile/ProfileReviewsSection";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProviderService = Database['public']['Tables']['provider_services']['Row'] & {
  service_categories: { name: string; icon: string | null } | null;
};
type ProviderLocation = Database['public']['Tables']['provider_locations']['Row'];
type Review = {
  id: string;
  provider_id: string;
  reviewer_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
  provider_response: string | null;
  provider_response_at: string | null;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

type ExpertAnswer = {
  id: string;
  content: string;
  created_at: string;
  question: {
    id: string;
    title: string;
    content: string;
  } | null;
};

const ServiceProviderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [locations, setLocations] = useState<ProviderLocation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [expertAnswers, setExpertAnswers] = useState<ExpertAnswer[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [hasQuoteRelationship, setHasQuoteRelationship] = useState(false);
  const [contactDetails, setContactDetails] = useState<{ email: string | null; phone: string | null } | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<ProfileTabId>('about');
  
  // Login prompt state
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginPromptConfig, setLoginPromptConfig] = useState({ title: '', description: '' });

  // Review state
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProviderData();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkIfReviewed();
    }
  }, [user, id, reviews]);

  // Auto-switch to reviews tab if requestQuote=true
  useEffect(() => {
    if (searchParams.get('requestQuote') === 'true' && !loading) {
      setActiveTab('reviews');
    }
  }, [searchParams, loading]);

  const fetchProviderData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const isAuthenticated = !!user;
      const isOwnProfile = user?.id === id;
      
      // Check quote relationship for messaging/review features
      if (user && !isOwnProfile) {
        const { data: relationshipData } = await supabase
          .rpc('has_quote_relationship', { provider_uuid: id });
        const hasRelationship = relationshipData === true;
        setHasQuoteRelationship(hasRelationship);
        
        // Fetch contact details for ALL logged-in users
        const { data: contactData } = await supabase
          .rpc('get_provider_contact_details', { provider_uuid: id });
        if (contactData && contactData.length > 0) {
          setContactDetails({
            email: contactData[0].email,
            phone: contactData[0].phone,
          });
        }
      } else if (isOwnProfile) {
        setHasQuoteRelationship(true);
      }

      // Fetch profile
      let profileData: Profile | null = null;
      
      if (isOwnProfile) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (profileError) throw profileError;
        profileData = data;
      } else {
        const { data, error } = await supabase
          .rpc('get_public_provider_profiles', { provider_ids: [id] });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const publicData = data[0];
          profileData = {
            id: publicData.id,
            full_name: publicData.full_name,
            bio: publicData.bio,
            avatar_url: publicData.avatar_url,
            is_featured: publicData.is_featured,
            is_verified: publicData.is_verified,
            created_at: publicData.created_at,
            email: null,
            phone: null,
            is_suspended: false,
            suspended_at: null,
            suspension_reason: null,
            subscription_status: 'free',
            subscription_expires_at: null,
            updated_at: publicData.created_at,
            featured_at: null,
            phone_verified: false,
          };
        }
      }
      setProfile(profileData);

      // Fetch services with category names
      const { data: servicesData, error: servicesError } = await supabase
        .from('provider_services')
        .select('*, service_categories(name, icon)')
        .eq('provider_id', id);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch locations
      if (isAuthenticated) {
        const { data: locationsData, error: locationsError } = await supabase
          .from('provider_locations')
          .select('*')
          .eq('provider_id', id)
          .order('is_primary', { ascending: false });

        if (locationsError) throw locationsError;
        setLocations(locationsData || []);
      } else {
        const { data: locationsData } = await supabase
          .rpc('get_public_provider_locations', { provider_ids: [id] });
        
        const mappedLocations = (locationsData || []).map((l: any) => ({
          ...l,
          address: l.city || l.postcode || 'Location available'
        }));
        setLocations(mappedLocations);
      }

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      
      // Fetch reviewer profiles
      const reviewerIds = [...new Set((reviewsData || []).map(r => r.reviewer_id))];
      let reviewerProfilesMap: Record<string, any> = {};
      
      if (reviewerIds.length > 0) {
        const { data: reviewerProfilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', reviewerIds);
        
        if (reviewerProfilesData) {
          reviewerProfilesMap = Object.fromEntries(reviewerProfilesData.map(p => [p.id, p]));
        }
      }
      
      const reviewsWithProfiles = (reviewsData || []).map(review => ({
        ...review,
        profiles: reviewerProfilesMap[review.reviewer_id] || null,
      }));
      
      setReviews(reviewsWithProfiles as Review[]);

      // Calculate average rating
      if (reviewsData && reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }

      // Fetch expert answers
      const { data: answersData, error: answersError } = await supabase
        .from('expert_answers')
        .select('id, content, created_at, question_id')
        .eq('provider_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (answersError) throw answersError;

      const answersWithQuestions = await Promise.all(
        (answersData || []).map(async (a) => {
          const { data: questionData } = await supabase
            .from('expert_questions')
            .select('id, title, content')
            .eq('id', a.question_id)
            .maybeSingle();
          return {
            id: a.id,
            content: a.content,
            created_at: a.created_at,
            question: questionData
          };
        })
      );

      setExpertAnswers(answersWithQuestions as ExpertAnswer[]);
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfReviewed = () => {
    if (!user) return;
    const userReview = reviews.find(r => r.reviewer_id === user.id);
    setHasReviewed(!!userReview);
  };

  const handleSubmitReview = async (data: { rating: number; title: string; content: string }) => {
    if (!user) {
      toast({ title: 'Please sign in to leave a review', variant: 'destructive' });
      return;
    }

    if (user.id === id) {
      toast({ title: 'You cannot review yourself', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase.from('reviews').insert({
        provider_id: id!,
        reviewer_id: user.id,
        rating: data.rating,
        title: data.title.trim() || null,
        content: data.content.trim() || null,
      });

      if (error) throw error;

      // Get reviewer's name for notification
      const { data: reviewerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      // Send email notification
      supabase.functions.invoke('send-review-notification', {
        body: {
          providerId: id,
          reviewerName: reviewerProfile?.full_name || 'A customer',
          rating: data.rating,
          title: data.title.trim() || undefined,
          content: data.content.trim() || undefined,
        },
      }).catch(err => console.error('Failed to send review notification:', err));

      toast({ title: 'Review submitted successfully!' });
      fetchProviderData();
    } catch (error: any) {
      toast({ 
        title: 'Error submitting review', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${profile?.full_name || 'this service provider'} on Kluje!`;
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleLike = () => {
    if (!user) {
      setLoginPromptConfig({
        title: 'Sign in to like this provider',
        description: 'Create a free account or sign in to like and follow service providers.',
      });
      setLoginPromptOpen(true);
      return;
    }
    toast({ title: 'Like feature coming soon!' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading profile..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Provider Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The service provider you are looking for does not exist or has been removed.
            </p>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const primaryLocation = locations.find(loc => loc.is_primary) || locations[0];
  const primaryCategory = services.length > 0 ? services[0].service_categories?.name : null;
  const canReview = user && user.id !== id && !hasReviewed && hasQuoteRelationship;
  const showContactDetails = user?.id === id || (user && contactDetails !== null);

  // Tabs configuration
  const tabs = [
    { id: 'about' as ProfileTabId, label: 'About Us' },
    { id: 'skills' as ProfileTabId, label: 'Skill Area', count: services.length },
    { id: 'gallery' as ProfileTabId, label: 'Photo Gallery' },
    { id: 'answers' as ProfileTabId, label: 'Answers', count: expertAnswers.length },
    { id: 'blogs' as ProfileTabId, label: 'Blogs' },
    { id: 'reviews' as ProfileTabId, label: 'Rating & Review', count: reviews.length },
  ];

  // Gallery images - placeholder for now (would be fetched from DB in full implementation)
  const galleryImages: { id: string; url: string; caption?: string }[] = [];

  // Blog posts - placeholder for now
  const blogPosts: any[] = [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${profile.full_name || 'Service Provider'} – Verified Professional | Kluje`}
        description={profile.bio?.substring(0, 155) || `Hire ${profile.full_name || 'this service provider'} on Kluje. View reviews, portfolio and request a quote.`}
        keywords={services.map(s => s.service_categories?.name || s.custom_name || '').filter(Boolean)}
        pageType="provider-profile"
        pageContent={profile.bio || undefined}
        ogImage={profile.avatar_url || undefined}
        canonical={`https://klue-us.lovable.app/service-provider/${id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": profile.full_name || "Service Provider",
          "description": profile.bio || "",
          "image": profile.avatar_url || "",
          "url": `https://klue-us.lovable.app/service-provider/${id}`,
          ...(locations[0] && {
            "address": {
              "@type": "PostalAddress",
              "addressLocality": locations[0].city || "",
              "postalCode": locations[0].postcode || "",
              "addressCountry": "US"
            }
          }),
          ...(averageRating > 0 && {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": averageRating.toFixed(1),
              "reviewCount": reviews.length,
              "bestRating": "5",
              "worstRating": "1"
            }
          }),
          "makesOffer": services.map(s => ({
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": s.service_categories?.name || s.custom_name || ""
            }
          }))
        }}
      />
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <ProfileHero 
          profile={{
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            is_verified: profile.is_verified || false,
            is_featured: profile.is_featured || false,
            email: showContactDetails ? (contactDetails?.email || profile.email) : profile.email,
            phone: showContactDetails ? (contactDetails?.phone || profile.phone) : profile.phone,
          }}
          primaryLocation={primaryLocation}
          showContactDetails={showContactDetails}
          isAuthenticated={!!user}
          primaryCategory={primaryCategory}
        />

        {/* Stats Bar - Like/Ratings/Follow */}
        <ProfileStatsBar 
          averageRating={averageRating}
          reviewCount={reviews.length}
          onLike={handleLike}
          onShare={handleShare}
        />

        {/* Stats Row */}
        <ProfileStatsRow 
          likedCount={0}
          ratingsCount={reviews.length}
          skillAreasCount={services.length}
          blogCount={0}
          answeredCount={expertAnswers.length}
        />

        {/* Tabs Navigation */}
        <ProfileTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4">
            {activeTab === 'about' && (
              <ProfileAboutSection bio={profile.bio} />
            )}

            {activeTab === 'skills' && (
              <ProfileSkillsSection services={services} />
            )}

            {activeTab === 'gallery' && (
              <ProfileGallerySection images={galleryImages} />
            )}

            {activeTab === 'answers' && (
              <ProfileAnswersSection answers={expertAnswers} />
            )}

            {activeTab === 'blogs' && (
              <ProfileBlogsSection posts={blogPosts} />
            )}

            {activeTab === 'reviews' && (
              <ProfileReviewsSection 
                reviews={reviews}
                averageRating={averageRating}
                userId={user?.id}
                providerId={id!}
                providerName={profile.full_name || 'Provider'}
                providerAvatar={profile.avatar_url || undefined}
                canReview={canReview}
                hasReviewed={hasReviewed}
                onSubmitReview={handleSubmitReview}
              />
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Login Prompt Dialog */}
      <LoginPromptDialog
        open={loginPromptOpen}
        onOpenChange={setLoginPromptOpen}
        redirectUrl={location.pathname + location.search}
        title={loginPromptConfig.title}
        description={loginPromptConfig.description}
      />
    </div>
  );
};

export default ServiceProviderProfile;
