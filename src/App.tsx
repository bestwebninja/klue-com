import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { MessageNotificationListener } from "@/components/MessageNotificationListener";
import { CookieConsent } from "@/components/CookieConsent";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Index from "./pages/Index";

// Lazy-loaded routes – only the homepage is eagerly bundled
const ServiceProviderProfile = lazy(() => import("./pages/ServiceProviderProfile"));
const BrowseProviders = lazy(() => import("./pages/BrowseProviders"));
const BrowseJobs = lazy(() => import("./pages/BrowseJobs"));
const CategoryLanding = lazy(() => import("./pages/CategoryLanding"));
const PostJob = lazy(() => import("./pages/PostJob"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AskExpert = lazy(() => import("./pages/AskExpert"));
const QuestionDetail = lazy(() => import("./pages/QuestionDetail"));
const MessagesInbox = lazy(() => import("./pages/MessagesInbox"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Contact = lazy(() => import("./pages/Contact"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const Newsletter = lazy(() => import("./pages/Newsletter"));
const AdminSetup = lazy(() => import("./pages/AdminSetup"));
const Advertise = lazy(() => import("./pages/Advertise"));
const AdvertiserDashboard = lazy(() => import("./pages/AdvertiserDashboard"));
const PlatformManifesto = lazy(() => import("./pages/PlatformManifesto"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const MetricsPage = lazy(() => import("./pages/MetricsPage"));
const PrivacyRequestPage = lazy(() => import("./pages/PrivacyRequestPage"));
const PrivacyPreferencesPage = lazy(() => import("./pages/PrivacyPreferencesPage"));
const DoNotSellPage = lazy(() => import("./pages/DoNotSellPage"));
const CookieAdminPage = lazy(() => import("./pages/CookieAdminPage"));
const CookieAdminLoginPage = lazy(() => import("./pages/CookieAdminLoginPage"));
const ComplyOSAdminDashboard = lazy(() => import("./pages/ComplyOSAdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <NotificationPermissionBanner />
        <MessageNotificationListener />
        <BrowserRouter>
          <ScrollToTop />
          <CookieConsent />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/index.html" element={<Navigate to="/" replace />} />
              <Route path="/index.php" element={<Navigate to="/" replace />} />
              <Route path="/browse" element={<Navigate to="/browse-providers" replace />} />
              <Route path="/browse-providers" element={<BrowseProviders />} />
              <Route path="/jobs" element={<BrowseJobs />} />
              <Route path="/services/:slug" element={<CategoryLanding />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-dashboard" element={<UserDashboard />} />
              <Route path="/user-dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/ask-expert" element={<AskExpert />} />
              <Route path="/ask-expert/:id" element={<QuestionDetail />} />
              <Route path="/messages" element={<MessagesInbox />} />
              <Route path="/settings/notifications" element={<NotificationSettings />} />
              <Route path="/service-provider/:id" element={<ServiceProviderProfile />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="/newsletter" element={<Newsletter />} />
              <Route path="/admin-setup" element={<AdminSetup />} />
              <Route path="/admin" element={<AdvertiserDashboard />} />
              <Route path="/advertiser-dashboard" element={<AdvertiserDashboard />} />
              <Route path="/advertise" element={<Advertise />} />
              <Route path="/platform-manifesto" element={<PlatformManifesto />} />
              <Route path="/about" element={<AboutUs />} />
              {/* ComplyOS SaaS routes */}
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/metrics" element={<MetricsPage />} />
              <Route path="/privacy/request" element={<PrivacyRequestPage />} />
              <Route path="/privacy/preferences" element={<PrivacyPreferencesPage />} />
              <Route path="/privacy/do-not-sell" element={<DoNotSellPage />} />
              <Route path="/cookie-admin/login" element={<CookieAdminLoginPage />} />
              <Route path="/cookie-admin" element={<CookieAdminPage />} />
              <Route path="/admin-dashboard" element={<ComplyOSAdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
