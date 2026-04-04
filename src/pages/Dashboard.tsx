import { useEffect, useState, useRef, useCallback } from 'react';
import { SEOHead } from '@/components/SEOHead';
import ProviderSetupWizard from '@/components/dashboard/ProviderSetupWizard';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, MapPin, FileText, User, HelpCircle, Shield, MessageSquare, Star, ClipboardList, Home, Image, BookOpen, HardHat, Users, Mail, Settings2, LayoutDashboard } from 'lucide-react';
import { lazy, Suspense } from 'react';
const AdminUsersInline = lazy(() => import('@/components/admin/AdminUsers'));
const AdminRolesInline = lazy(() => import('@/components/admin/AdminRoles'));
const AdminSiteSettingsInline = lazy(() => import('@/components/admin/AdminSiteSettings'));
const AdminNewsletterInline = lazy(() => import('@/components/admin/AdminNewsletter'));
import { RoleBasedDashboardHome } from '@/components/dashboard/RoleBasedDashboardHome';
const GCCommandDashboard = lazy(() => import('@/components/dashboard/contractors/GCCommandDashboard'));
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
import type { TradeKey as CommandCenterTradeKey } from '@/features/command-center/templates/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const resolveCommandCenterTrade = (profile: Profile | null): CommandCenterTradeKey => {
  const normalizedServices = (profile?.services_offered ?? []).map((service) => service.toLowerCase());
  const serviceText = normalizedServices.join(' ');

  if (serviceText.includes('hvac') || serviceText.includes('heating') || serviceText.includes('airconditioning') || serviceText.includes('air conditioning')) {
    return 'hvac';
  }
  if (serviceText.includes('plumb')) return 'plumbing';
  if (serviceText.includes('electr')) return 'electrical';
  if (serviceText.includes('roof')) return 'roofing';
  if (serviceText.includes('window') || serviceText.includes('door')) return 'windows_doors';
  if (serviceText.includes('landscap') || serviceText.includes('garden') || serviceText.includes('paving')) return 'landscaping';
  if (
    serviceText.includes('paint') ||
    serviceText.includes('floor') ||
    serviceText.includes('tile') ||
    serviceText.includes('tiling') ||
    serviceText.includes('carpent') ||
    serviceText.includes('plaster') ||
    serviceText.includes('render') ||
    serviceText.includes('finish')
  ) {
    return 'finishing';
  }

  return 'remodeling';
};

const getCommandCenterPath = (userId: string, profile: Profile | null) => {
  const trade = resolveCommandCenterTrade(profile);
  return `/command-center/${userId}/trade/${trade}`;
};

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
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { isProvider, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'home');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [setupChecked, setSetupChecked] = useState(false);
  // Resizable content — px width of sidebar
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);
  // Scroll arrows
  const contentRef = useRef<HTMLElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
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
    }
  }, [user]);

  // Only check setup wizard once roles are loaded
  useEffect(() => {
    if (user && !roleLoading) {
      if (isProvider) {
        checkSetupNeeded();
      } else {
        // Non-providers (admins, homeowners) never see the setup wizard
        setSetupChecked(true);
        setShowSetupWizard(false);
      }
    }
  }, [user, isProvider, roleLoading]);

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
    // Scroll to top and re-evaluate arrows when switching tabs
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      setTimeout(updateScrollState, 100);
    }
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

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startW.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = ev.clientX - startX.current;
      setSidebarWidth(Math.min(320, Math.max(160, startW.current + delta)));
    };
    const onUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [sidebarWidth]);

  const updateScrollState = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 10);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  }, []);

  const scrollBy = useCallback((dir: 'up' | 'down') => {
    contentRef.current?.scrollBy({ top: dir === 'up' ? -320 : 320, behavior: 'smooth' });
  }, []);

  if (loading || roleLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const isSubscribed = profile?.subscription_status === 'active';

  const navItems = [
    providerNavItems[0],
    { value: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { value: 'gc-command', label: 'Contractors', icon: HardHat },
    ...providerNavItems.slice(1),
    ...(isAdmin ? [
      { value: 'admin-users',      label: 'Users',         icon: Users     },
      { value: 'admin-roles',      label: 'Roles',         icon: Shield    },
      { value: 'admin-newsletter', label: 'Newsletter',    icon: Mail      },
      { value: 'admin-settings',   label: 'Site Settings', icon: Settings2 },
    ] : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <RoleBasedDashboardHome profile={profile} />;
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
      case 'gc-command':
        return (
          <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading…</div>}>
            <GCCommandDashboard />
          </Suspense>
        );
      case 'command-center':
        return <Navigate to={getCommandCenterPath(user.id, profile)} replace />;
      case 'admin-users':
        return (
          <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading…</div>}>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">User Management</h2>
              <AdminUsersInline />
            </div>
          </Suspense>
        );
      case 'admin-roles':
        return (
          <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading…</div>}>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Role Management</h2>
              <AdminRolesInline />
            </div>
          </Suspense>
        );
      case 'admin-newsletter':
        return (
          <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading…</div>}>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
              <AdminNewsletterInline />
            </div>
          </Suspense>
        );
      case 'admin-settings':
        return (
          <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading…</div>}>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Site Settings</h2>
              <AdminSiteSettingsInline />
            </div>
          </Suspense>
        );
      default:
        return <RoleBasedDashboardHome profile={profile} />;
    }
  };

  const sidebarCssWidth = `${sidebarWidth}px`;

  return (
    <SidebarProvider
      defaultOpen={true}
      style={{ '--sidebar-width': sidebarCssWidth, '--sidebar-width-icon': '3rem' } as React.CSSProperties}
    >
      <SEOHead title="Service Provider Dashboard | Kluje" description="Manage your leads, quotes, profile, portfolio, and subscription. Everything you need to run your service provider business on Kluje." noIndex={true} />
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden sm:block">
          <DashboardSidebar
            items={navItems}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isSubscribed={isSubscribed}
            isAdmin={isAdmin}
            userId={user.id}
            userName={profile?.full_name || undefined}
            unreadMessages={unreadMessages}
            onSignOut={handleSignOut}
          />
        </div>

        {/* Drag handle between sidebar and content */}
        <div
          className="hidden sm:flex items-center justify-center w-1.5 shrink-0 cursor-col-resize hover:bg-orange-400/40 active:bg-orange-400/60 transition-colors bg-border/30 z-20"
          onMouseDown={onMouseDown}
          title="Drag to resize sidebar"
        />

        {/* Main Content Area */}
        <SidebarInset className="flex-1 min-w-0 relative">
          <DashboardHeader
            userName={profile?.full_name || undefined}
            userEmail={user.email}
            isSubscribed={isSubscribed}
            isAdmin={isAdmin}
            onSignOut={handleSignOut}
            showContractorIdentity={activeTab === 'gc-command'}
          />

          {/* Scrollable content with up/down arrow buttons */}
          <main
            ref={contentRef}
            onScroll={updateScrollState}
            className={`h-[calc(100vh-4rem)] scroll-smooth ${
              activeTab === 'gc-command'
                ? 'overflow-hidden p-0'
                : 'overflow-y-auto p-4 sm:p-6 lg:p-8'
            }`}
          >
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

          {/* Scroll arrows — fixed to right edge of content panel */}
          <div className="hidden sm:flex flex-col gap-1.5 fixed right-4 bottom-8 z-30">
            <button
              onClick={() => scrollBy('up')}
              disabled={!canScrollUp}
              className="w-9 h-9 rounded-full bg-orange-500 text-white shadow-lg flex items-center justify-center hover:bg-orange-600 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
              title="Scroll up"
              aria-label="Scroll up"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button
              onClick={() => scrollBy('down')}
              disabled={!canScrollDown}
              className="w-9 h-9 rounded-full bg-orange-500 text-white shadow-lg flex items-center justify-center hover:bg-orange-600 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
              title="Scroll down"
              aria-label="Scroll down"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </SidebarInset>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav 
          items={navItems.slice(0, 5)} 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          badges={{ messages: unreadMessages }}
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
