import { useEffect } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Briefcase, FolderTree, Shield, ScrollText, BookOpen, ShieldCheck, Settings2, Mail, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminJobs from '@/components/admin/AdminJobs';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminRoles from '@/components/admin/AdminRoles';
import AdminAuditLogs from '@/components/admin/AdminAuditLogs';
import AdminBlogPosts from '@/components/admin/AdminBlogPosts';
import AdminVerifications from '@/components/admin/AdminVerifications';
import AdminSiteSettings from '@/components/admin/AdminSiteSettings';
import AdminNewsletter from '@/components/admin/AdminNewsletter';
import { JanitorialSubscriptionsAdmin } from '@/components/admin/JanitorialSubscriptionsAdmin';

const AdminDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, user, navigate, toast]);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out successfully' });
    navigate('/');
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="AD-Dashboard | Kluje" description="Manage users, jobs, blog posts, categories, and verification requests. Administration dashboard for the Kluje platform." noIndex={true} />
      {/* Header - Dark theme matching Kluje design */}
      <header className="bg-[hsl(220,13%,18%)]">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <a href="/" className="text-xl sm:text-2xl font-bold text-primary">Kluje</a>
              <span className="text-white/50 hidden sm:inline">|</span>
              <span className="text-white font-medium items-center gap-2 hidden sm:flex">
                <Shield className="w-5 h-5 text-red-400" />
                AD-Dashboard
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1 text-xs sm:text-sm text-red-400 bg-red-400/10 px-2 sm:px-3 py-1 rounded-full">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                Admin
              </span>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9">
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">AD-Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage users, jobs, categories, and system settings
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 pb-2">
            <TabsList className="inline-flex min-w-max lg:w-auto gap-1">`
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderTree className="w-4 h-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Blog</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="verifications" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Verifications</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <ScrollText className="w-4 h-4" />
              <span className="hidden sm:inline">Audit Logs</span>
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Newsletter</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Site Settings</span>
            </TabsTrigger>
            <TabsTrigger value="janitorial-subs" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Janitorial Subs</span>
            </TabsTrigger>
          </TabsList>
          </div>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="jobs">
            <AdminJobs />
          </TabsContent>

          <TabsContent value="categories">
            <AdminCategories />
          </TabsContent>

          <TabsContent value="blog">
            <AdminBlogPosts />
          </TabsContent>

          <TabsContent value="roles">
            <AdminRoles />
          </TabsContent>

          <TabsContent value="verifications">
            <AdminVerifications />
          </TabsContent>

          <TabsContent value="audit">
            <AdminAuditLogs />
          </TabsContent>

          <TabsContent value="newsletter">
            <AdminNewsletter />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSiteSettings />
          </TabsContent>
          <TabsContent value="janitorial-subs">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Janitorial Subscriptions</h2>
                <p className="text-sm text-muted-foreground">All CleanScope AI subscription purchase records. Kluje is the source of truth — Shopify handles hosted payment only.</p>
              </div>
              <JanitorialSubscriptionsAdmin />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
