import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
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
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/my-dashboard" element={<Navigate to="/dashboard" replace />} />
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
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
