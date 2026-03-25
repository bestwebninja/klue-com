import { useEffect, useState, useCallback } from 'react';
import { SEOHead } from '@/components/SEOHead';
import ProviderSetupWizard from '@/components/dashboard/ProviderSetupWizard';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, MapPin, FileText, User, HelpCircle, Shield, MessageSquare, Star, ClipboardList, Home, Image, BookOpen, HardHat } from 'lucide-react';
import GCCommandDashboard from '@/components/dashboard/GCCommandDashboard';
import DashboardHome from '@/components/dashboard/DashboardHome';
import DashboardServices from '@/components/dashboard/DashboardServices';
import DashboardLocations from '@/components/dashboard/DashboardLocations';
import DashboardSubscription from '@/components/dashboard/DashboardSubscription';
import DashboardProfile from '@/components/dashboard/DashboardProfile';
import DashboardExpertAnswers from '@/components/dashboard/DashboardExpertAnswers';
import DashboardMessages from '@/components/dashboard/DashboardMessages';
import DashboardReviews from '@/components/dashboard/DashboardReviews';
import DashboardQuotes from '@/components/dashboard/DashboardQuotes';
import DashboardPortfolio from '@/components/dashboard/DashboardPortfolio';
import DashboardVerification from '@/components/dashboard/DashboardVerification';
import { DashboardBlogPosts } from '@/components/dashboard/DashboardBlogPosts';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useProfileComplete } from '@/hooks/useProfileComplete';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const providerNavItems = [
  { value: 'home', label: 'Home', icon: Home },
  { value: 'quotes', label: 'Quotes', icon: ClipboardList },
  { value: 'messages', label: 'Messages', icon: MessageSquare },
  { value: 'profile', label: 'Profile', icon: User },
  { value: 'services', label: 'Services', icon: Settings },
  { value: 'locations', label: 'Locations', icon: MapPin },
  { value: 'portfolio', label: 'Portfolio', icon: Image },
  { value: 'reviews', label: 'Reviews', icon: Star },
  { value: 'verification', label: 'Verification', icon: Shield },
  { value: 'blog', label: 'Blog', icon: BookOpen },
  { value: 'expert', label: 'Expert Q&A', icon: HelpCircle },
  { value: 'subscription', label: 'Subscription', icon: FileText },
];

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'home');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [setupChecked, setSetupChecked] = useState(false);
  const [hasRenovationServices, setHasRenovationServices] = useState(false);

  const { isComplete: profileComplete, loading: profileLoading } = useProfileComplete();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (!loading && !profileLoading && user && profileComplete === false) {
      navigate('/complete-profile');
    }
  }, [user, loading, navigate, profileComplete, profileLoading]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUnreadCount();
      checkSetupNeeded();
    }
  }, [user]);

  // Check if provider needs guided setup (no services yet)
  const checkSetupNeeded = async () => {
    if (!user) return;
    const isSetupParam = searchParams.get('setup') === 'true';
    const { data: services } = await supabase
      .from('provider_services')
      .select('id')
      .eq('provider_id', user.id)
      .limit(1);
    
    const needsSetup = !services || services.length === 0;
    setShowSetupWizard(needsSetup || isSetupParam);
    setSetupChecked(true);
  };

  // Sync URL params with tab
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Real-time subscription for message count updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('provider-message-badges')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .is('read_at', null);

    if (!error && count !== null) {
      setUnreadMessages(count);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out successfully' });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const isSubscribed = profile?.subscription_status === 'active';

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome userId={user.id} profile={profile} onNavigate={handleTabChange} />;
      case 'profile':
        return <DashboardProfile profile={profile} onProfileUpdate={fetchProfile} />;
      case 'services':
        return <DashboardServices userId={user.id} />;
      case 'locations':
        return <DashboardLocations userId={user.id} />;
      case 'portfolio':
        return <DashboardPortfolio userId={user.id} />;
      case 'verification':
        return <DashboardVerification userId={user.id} isVerified={profile?.is_verified || false} />;
      case 'blog':
        return <DashboardBlogPosts userId={user.id} />;
      case 'quotes':
        return <DashboardQuotes userId={user.id} />;
      case 'messages':
        return <DashboardMessages />;
      case 'reviews':
        return <DashboardReviews userId={user.id} />;
      case 'expert':
        return <DashboardExpertAnswers userId={user.id} />;
      case 'subscription':
        return <DashboardSubscription profile={profile} onSubscriptionUpdate={fetchProfile} />;
      default:
        return <DashboardHome userId={user.id} profile={profile} onNavigate={handleTabChange} />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <SEOHead title="Service Provider Dashboard | Kluje" description="Manage your leads, quotes, profile, portfolio, and subscription. Everything you need to run your service provider business on Kluje." noIndex={true} />
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden sm:block">
          <DashboardSidebar
            items={providerNavItems}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isSubscribed={isSubscribed}
            isAdmin={isAdmin}
            userName={profile?.full_name || undefined}
            unreadMessages={unreadMessages}
            onSignOut={handleSignOut}
          />
        </div>

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          <DashboardHeader
            userName={profile?.full_name || undefined}
            userEmail={user.email}
            isSubscribed={isSubscribed}
            isAdmin={isAdmin}
            onSignOut={handleSignOut}
          />

          <main className="p-4 sm:p-6 lg:p-8">
            {showSetupWizard && setupChecked ? (
              <ProviderSetupWizard
                userId={user.id}
                companyName={profile?.full_name || undefined}
                onComplete={() => {
                  setShowSetupWizard(false);
                  fetchProfile();
                  setSearchParams({ tab: 'home' });
                }}
                onDismiss={() => setShowSetupWizard(false)}
              />
            ) : (
              renderContent()
            )}
            
            {/* Mobile bottom padding for nav */}
            <div className="h-20 sm:hidden" />
          </main>
        </SidebarInset>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav 
          items={providerNavItems.slice(0, 5)} 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          badges={{ messages: unreadMessages }}
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;