import { useState, useEffect, useRef } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfileComplete } from '@/hooks/useProfileComplete';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Briefcase, 
  Clock, 
  MapPin, 
  Loader2, 
  User,
  MessageSquare,
  XCircle,
  RefreshCw,
  Mail,
  Phone,
  Send,
  Settings,
  Eye,
  EyeOff,
  Bell,
  LogOut,
  Star,
  CheckCircle,
  CheckCircle2,
  Pencil,
  BookOpen
} from 'lucide-react';
import { LocationPicker } from '@/components/LocationPicker';
import { NotificationBell } from '@/components/NotificationBell';
import { MessageBadge } from '@/components/MessageBadge';
import DashboardMessages from '@/components/dashboard/DashboardMessages';
import { ReviewDialog } from '@/components/ReviewDialog';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';
import DashboardRatingRequests from '@/components/dashboard/DashboardRatingRequests';
import { DashboardBlogPosts } from '@/components/dashboard/DashboardBlogPosts';
import type { Database } from '@/integrations/supabase/types';

const userNavItems = [
  { value: 'ratings', label: 'Reviews', icon: Star },
  { value: 'blog', label: 'Blog', icon: BookOpen },
  { value: 'messages', label: 'Messages', icon: MessageSquare },
];

type JobListing = Database['public']['Tables']['job_listings']['Row'];
type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface QuoteWithProvider {
  id: string;
  provider_id: string;
  job_listing_id: string | null;
  message: string | null;
  status: string;
  created_at: string;
  profiles: Profile | null;
}

interface Message {
  id: string;
  quote_request_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

const UserDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isProvider, loading: roleLoading } = useUserRole();
  const { isComplete: profileComplete, loading: profileLoading } = useProfileComplete();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out successfully' });
    navigate('/');
  };
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [myJobs, setMyJobs] = useState<JobListing[]>([]);
  const [quotes, setQuotes] = useState<Record<string, QuoteWithProvider[]>>({});
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');
  const [unreadMessages, setUnreadMessages] = useState(0);

  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    main_category_id: '',
    category_id: '',
    location: '',
    budget_min: '',
    budget_max: '',
  });

  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [isEditJobOpen, setIsEditJobOpen] = useState(false);
  const [editJobForm, setEditJobForm] = useState({
    title: '',
    description: '',
    main_category_id: '',
    category_id: '',
    location: '',
    budget_min: '',
    budget_max: '',
  });

  // Derived category lists
  const mainCategories = categories.filter(c => !c.parent_id);
  const subCategories = categories.filter(c => c.parent_id === jobForm.main_category_id);
  const editSubCategories = categories.filter(c => c.parent_id === editJobForm.main_category_id);

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
  });

  // Redirect providers to their dashboard
  useEffect(() => {
    if (!roleLoading && isProvider) {
      navigate('/dashboard');
    }
  }, [isProvider, roleLoading, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (!authLoading && !profileLoading && user && profileComplete === false) {
      navigate('/complete-profile');
    }
  }, [user, authLoading, navigate, profileComplete, profileLoading]);

  useEffect(() => {
    if (user) {
      fetchAll();
      fetchUnreadCount();
    }
  }, [user]);

  // Subscribe for unread count updates
  useEffect(() => {
    if (!user) return;

    const badgeChannel = supabase
      .channel('user-message-badges')
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
      supabase.removeChannel(badgeChannel);
    };
  }, [user]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            const quoteId = newMessage.quote_request_id;
            const existing = prev[quoteId] || [];
            // Avoid duplicates
            if (existing.some(m => m.id === newMessage.id)) return prev;
            return {
              ...prev,
              [quoteId]: [...existing, newMessage],
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchCategories(),
      fetchProfile(),
      fetchMyJobs(),
    ]);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
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

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (data) {
      setProfile(data);
      setProfileForm({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
      });
    }
  };

  const fetchMyJobs = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('job_listings')
      .select('*')
      .eq('posted_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return;
    }
    
    setMyJobs(data || []);
    if (data && data.length > 0) {
      await fetchQuotesForJobs(data.map(j => j.id));
    }
  };

  const fetchQuotesForJobs = async (jobIds: string[]) => {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .in('job_listing_id', jobIds)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch profiles for providers
      const providerIds = [...new Set(data.map(q => q.provider_id))];
      let profilesMap: Record<string, Profile> = {};
      
      if (providerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', providerIds);
        
        if (profilesData) {
          profilesMap = Object.fromEntries(profilesData.map(p => [p.id, p]));
        }
      }
      
      const grouped: Record<string, QuoteWithProvider[]> = {};
      const quoteIds: string[] = [];
      
      data.forEach((quote) => {
        const jobId = quote.job_listing_id as string;
        if (!grouped[jobId]) grouped[jobId] = [];
        grouped[jobId].push({
          ...quote,
          profiles: profilesMap[quote.provider_id] || null,
        } as QuoteWithProvider);
        quoteIds.push(quote.id);
      });
      
      setQuotes(grouped);
      
      if (quoteIds.length > 0) {
        await fetchMessagesForQuotes(quoteIds);
      }
    }
  };

  const fetchMessagesForQuotes = async (quoteIds: string[]) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .in('quote_request_id', quoteIds)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const grouped: Record<string, Message[]> = {};
      const unreadMessageIds: string[] = [];
      
      data.forEach((msg) => {
        if (!grouped[msg.quote_request_id]) grouped[msg.quote_request_id] = [];
        grouped[msg.quote_request_id].push(msg as Message);
        
        // Collect unread messages where user is recipient
        if (!msg.read_at && msg.recipient_id === user?.id) {
          unreadMessageIds.push(msg.id);
        }
      });
      
      setMessages(grouped);
      
      // Mark unread messages as read
      if (unreadMessageIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadMessageIds);
      }
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title and description.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let latitude: number | null = null;
      let longitude: number | null = null;
      
      if (jobForm.location.trim()) {
        try {
          const { data: geocodeData } = await supabase.functions.invoke('geocode-location', {
            body: { location: jobForm.location.trim() }
          });
          if (geocodeData?.success) {
            latitude = geocodeData.latitude;
            longitude = geocodeData.longitude;
          }
        } catch (geoError) {
          console.error('Geocoding failed:', geoError);
        }
      }

      const { data: newJob, error } = await supabase.from('job_listings').insert({
        title: jobForm.title.trim(),
        description: jobForm.description.trim(),
        category_id: jobForm.category_id || null,
        location: jobForm.location.trim() || null,
        latitude,
        longitude,
        budget_min: jobForm.budget_min ? Number(jobForm.budget_min) : null,
        budget_max: jobForm.budget_max ? Number(jobForm.budget_max) : null,
        posted_by: user.id,
      }).select('id').single();

      if (error) throw error;

      // Send thank-you email notification
      if (newJob?.id) {
        supabase.functions.invoke('send-job-posted-notification', {
          body: { jobId: newJob.id, userId: user.id }
        }).catch(err => console.error('Failed to send job posted notification:', err));
      }

      toast({ title: 'Job posted successfully!' });
      setJobForm({ title: '', description: '', main_category_id: '', category_id: '', location: '', budget_min: '', budget_max: '' });
      setIsPostJobOpen(false);
      fetchMyJobs();
    } catch (error: any) {
      toast({ title: 'Error posting job', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRepostJob = async (job: JobListing) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('job_listings').insert({
        title: job.title,
        description: job.description,
        category_id: job.category_id,
        location: job.location,
        latitude: job.latitude,
        longitude: job.longitude,
        budget_min: job.budget_min,
        budget_max: job.budget_max,
        posted_by: user.id,
      });

      if (error) throw error;
      toast({ title: 'Job reposted successfully!' });
      fetchMyJobs();
    } catch (error: any) {
      toast({ title: 'Error reposting job', description: error.message, variant: 'destructive' });
    }
  };

  const openEditJob = (job: JobListing) => {
    // Find parent category for the job's category
    const category = categories.find(c => c.id === job.category_id);
    const mainCategoryId = category?.parent_id || '';
    
    setEditingJob(job);
    setEditJobForm({
      title: job.title,
      description: job.description,
      main_category_id: mainCategoryId,
      category_id: job.category_id || '',
      location: job.location || '',
      budget_min: job.budget_min?.toString() || '',
      budget_max: job.budget_max?.toString() || '',
    });
    setIsEditJobOpen(true);
  };

  const handleEditJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingJob) return;

    if (!editJobForm.title.trim() || !editJobForm.description.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title and description.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let latitude = editingJob.latitude;
      let longitude = editingJob.longitude;
      
      // Only re-geocode if location changed
      if (editJobForm.location.trim() && editJobForm.location !== editingJob.location) {
        try {
          const { data: geocodeData } = await supabase.functions.invoke('geocode-location', {
            body: { location: editJobForm.location.trim() }
          });
          if (geocodeData?.success) {
            latitude = geocodeData.latitude;
            longitude = geocodeData.longitude;
          }
        } catch (geoError) {
          console.error('Geocoding failed:', geoError);
        }
      }

      const { error } = await supabase
        .from('job_listings')
        .update({
          title: editJobForm.title.trim(),
          description: editJobForm.description.trim(),
          category_id: editJobForm.category_id || null,
          location: editJobForm.location.trim() || null,
          latitude,
          longitude,
          budget_min: editJobForm.budget_min ? Number(editJobForm.budget_min) : null,
          budget_max: editJobForm.budget_max ? Number(editJobForm.budget_max) : null,
        })
        .eq('id', editingJob.id);

      if (error) throw error;

      toast({ title: 'Job updated successfully!' });
      setIsEditJobOpen(false);
      setEditingJob(null);
      fetchMyJobs();
    } catch (error: any) {
      toast({ title: 'Error updating job', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    const { error } = await supabase
      .from('job_listings')
      .update({ status: 'cancelled' })
      .eq('id', jobId);

    if (error) {
      toast({ title: 'Error cancelling job', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Job cancelled' });
      fetchMyJobs();
    }
  };

  const handleReopenJob = async (jobId: string) => {
    const { error } = await supabase
      .from('job_listings')
      .update({ status: 'open' })
      .eq('id', jobId);

    if (error) {
      toast({ title: 'Error reopening job', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Job reopened' });
      fetchMyJobs();
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name.trim() || null,
          email: profileForm.email.trim() || null,
          phone: profileForm.phone.trim() || null,
          bio: profileForm.bio.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast({ title: 'Profile updated!' });
      setIsProfileOpen(false);
      fetchProfile();
    } catch (error: any) {
      toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    return category?.name;
  };

  const openJobs = myJobs.filter(j => j.status === 'open');
  const closedJobs = myJobs.filter(j => j.status !== 'open');

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="My Jobs & Quotes Dashboard | Kluje" description="Track your posted jobs, review incoming quotes from service providers, and manage your project conversations from one dashboard." noIndex={true} />
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header - Mobile optimized */}
          <div className="flex flex-col gap-4 mb-6 sm:mb-8">
            {/* Title and main actions row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold text-foreground truncate">My Dashboard</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Manage jobs & communicate with providers</p>
              </div>
              
              {/* Desktop actions */}
              <div className="hidden sm:flex items-center gap-2">
                <NotificationBell />
                <MessageBadge />
                <Link to="/settings/notifications">
                  <Button variant="ghost" size="icon" title="Notification Settings">
                    <Bell className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Mobile action buttons row */}
            <div className="flex sm:hidden items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <NotificationBell />
                <MessageBadge />
                <Link to="/settings/notifications">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Bell className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-9 w-9">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Action buttons row */}
            <div className="flex flex-wrap items-center gap-2">
              <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Contact Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Your Contact Details</DialogTitle>
                    <DialogDescription>
                      These details are only visible to service providers who request a quote on your jobs.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="Your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">About You</Label>
                      <Textarea
                        id="bio"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                        placeholder="Brief description about yourself"
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isPostJobOpen} onOpenChange={setIsPostJobOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="text-xs sm:text-sm">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Post New Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Post a New Job</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePostJob} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="main_category">Main Category *</Label>
                      <select
                        id="main_category"
                        value={jobForm.main_category_id}
                        onChange={(e) => setJobForm(p => ({ ...p, main_category_id: e.target.value, category_id: '' }))}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Select a main category</option>
                        {mainCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    {jobForm.main_category_id && subCategories.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="sub_category">Service Type *</Label>
                        <select
                          id="sub_category"
                          value={jobForm.category_id}
                          onChange={(e) => setJobForm(p => ({ ...p, category_id: e.target.value }))}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Select a service type</option>
                          {subCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={jobForm.title}
                        onChange={(e) => setJobForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g., Kitchen Renovation"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={jobForm.description}
                        onChange={(e) => setJobForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Describe the work you need done..."
                        rows={4}
                        maxLength={1000}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <LocationPicker
                        placeholder="Search for job location..."
                        onLocationSelect={(location) => {
                          setJobForm(p => ({ 
                            ...p, 
                            location: location.city ? `${location.city}, ${location.postcode}` : location.address 
                          }));
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget_min">Min Budget ($)</Label>
                        <Input
                          id="budget_min"
                          type="number"
                          value={jobForm.budget_min}
                          onChange={(e) => setJobForm(p => ({ ...p, budget_min: e.target.value }))}
                          placeholder="0"
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget_max">Max Budget ($)</Label>
                        <Input
                          id="budget_max"
                          type="number"
                          value={jobForm.budget_max}
                          onChange={(e) => setJobForm(p => ({ ...p, budget_max: e.target.value }))}
                          placeholder="0"
                          min={0}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Post Job
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Edit Job Dialog */}
              <Dialog open={isEditJobOpen} onOpenChange={(open) => {
                setIsEditJobOpen(open);
                if (!open) setEditingJob(null);
              }}>
                <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Job</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditJob} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_main_category">Main Category *</Label>
                      <select
                        id="edit_main_category"
                        value={editJobForm.main_category_id}
                        onChange={(e) => setEditJobForm(p => ({ ...p, main_category_id: e.target.value, category_id: '' }))}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Select a main category</option>
                        {mainCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    {editJobForm.main_category_id && editSubCategories.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="edit_sub_category">Service Type *</Label>
                        <select
                          id="edit_sub_category"
                          value={editJobForm.category_id}
                          onChange={(e) => setEditJobForm(p => ({ ...p, category_id: e.target.value }))}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Select a service type</option>
                          {editSubCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="edit_title">Job Title *</Label>
                      <Input
                        id="edit_title"
                        value={editJobForm.title}
                        onChange={(e) => setEditJobForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g., Kitchen Renovation"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_description">Description *</Label>
                      <Textarea
                        id="edit_description"
                        value={editJobForm.description}
                        onChange={(e) => setEditJobForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Describe the work you need done..."
                        rows={4}
                        maxLength={1000}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <LocationPicker
                        placeholder={editJobForm.location || "Search for job location..."}
                        onLocationSelect={(location) => {
                          setEditJobForm(p => ({ 
                            ...p, 
                            location: location.city ? `${location.city}, ${location.postcode}` : location.address 
                          }));
                        }}
                      />
                      {editJobForm.location && (
                        <p className="text-xs text-muted-foreground">Current: {editJobForm.location}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit_budget_min">Min Budget ($)</Label>
                        <Input
                          id="edit_budget_min"
                          type="number"
                          value={editJobForm.budget_min}
                          onChange={(e) => setEditJobForm(p => ({ ...p, budget_min: e.target.value }))}
                          placeholder="0"
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_budget_max">Max Budget ($)</Label>
                        <Input
                          id="edit_budget_max"
                          type="number"
                          value={editJobForm.budget_max}
                          onChange={(e) => setEditJobForm(p => ({ ...p, budget_max: e.target.value }))}
                          placeholder="0"
                          min={0}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Changes
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Privacy Notice - Mobile optimized */}
          <Card className="mb-4 sm:mb-6 bg-muted/50 border-muted">
            <CardContent className="py-3 sm:py-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-foreground">Your privacy is protected</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Contact details only visible to providers who quote on your jobs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Desktop tabs - hidden on mobile */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="hidden sm:block overflow-x-auto -mx-4 px-4 pb-2">
              <TabsList className="inline-flex w-auto mb-4 sm:mb-6">
                <TabsTrigger value="jobs" className="gap-1 sm:gap-2 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                  My Jobs ({myJobs.length})
                </TabsTrigger>
                <TabsTrigger value="ratings" className="gap-1 sm:gap-2 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                  Rating Requests
                </TabsTrigger>
                <TabsTrigger value="messages" className="gap-1 sm:gap-2 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  Messages
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="jobs">
              {myJobs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">No jobs posted yet</h2>
                    <p className="text-muted-foreground mb-6">
                      Post your first job to start receiving quotes from professionals.
                    </p>
                    <Button onClick={() => setIsPostJobOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Tabs defaultValue="open">
                  <TabsList>
                    <TabsTrigger value="open">Open ({openJobs.length})</TabsTrigger>
                    <TabsTrigger value="closed">Closed/Cancelled ({closedJobs.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="open" className="space-y-4 mt-4">
                    {openJobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        quotes={quotes[job.id] || []}
                        messages={messages}
                        categoryName={getCategoryName(job.category_id)}
                        formatDate={formatDate}
                        formatBudget={formatBudget}
                        onCancel={() => handleCancelJob(job.id)}
                        onRepost={() => handleRepostJob(job)}
                        onEdit={() => openEditJob(job)}
                        onQuoteUpdate={fetchAll}
                        userId={user.id}
                      />
                    ))}
                    {openJobs.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No open jobs</p>
                    )}
                  </TabsContent>

                  <TabsContent value="closed" className="space-y-4 mt-4">
                    {closedJobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        quotes={quotes[job.id] || []}
                        messages={messages}
                        categoryName={getCategoryName(job.category_id)}
                        formatDate={formatDate}
                        formatBudget={formatBudget}
                        onReopen={() => handleReopenJob(job.id)}
                        onRepost={() => handleRepostJob(job)}
                        onQuoteUpdate={fetchAll}
                        isClosed
                        userId={user.id}
                      />
                    ))}
                    {closedJobs.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No closed or cancelled jobs</p>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </TabsContent>

            <TabsContent value="ratings">
              <DashboardRatingRequests />
            </TabsContent>

            <TabsContent value="blog">
              <DashboardBlogPosts userId={user.id} />
            </TabsContent>

            <TabsContent value="messages">
              <DashboardMessages />
            </TabsContent>
          </Tabs>

          {/* Mobile bottom padding for nav */}
          <div className="h-20 sm:hidden" />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        items={userNavItems} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        badges={{ messages: unreadMessages }}
      />

      <Footer />
    </div>
  );
};

interface JobCardProps {
  job: JobListing;
  quotes: QuoteWithProvider[];
  messages: Record<string, Message[]>;
  categoryName: string | null;
  formatDate: (date: string) => string;
  formatBudget: (min: number | null, max: number | null) => string;
  onCancel?: () => void;
  onReopen?: () => void;
  onRepost: () => void;
  onEdit?: () => void;
  onQuoteUpdate: () => void;
  isClosed?: boolean;
  userId: string;
}

const JobCard = ({ 
  job, quotes, messages, categoryName, formatDate, formatBudget, 
  onCancel, onReopen, onRepost, onEdit, onQuoteUpdate, isClosed, userId 
}: JobCardProps) => {
  const [showQuotes, setShowQuotes] = useState(false);

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
              {categoryName && (
                <Badge variant="secondary" className="text-xs">{categoryName}</Badge>
              )}
              <Badge variant={isClosed ? 'outline' : 'default'} className="text-xs">
                {job.status === 'cancelled' ? 'Cancelled' : isClosed ? 'Closed' : 'Open'}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${quotes.length >= 3 ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700' : ''}`}
              >
                {quotes.length}/3 quotes
              </Badge>
            </div>
            <CardTitle className="text-base sm:text-xl line-clamp-2">{job.title}</CardTitle>
            <CardDescription className="mt-1 sm:mt-2 text-sm line-clamp-3">{job.description}</CardDescription>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {!isClosed && onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onRepost} className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Repost</span>
            </Button>
            {isClosed ? (
              <Button variant="outline" size="sm" onClick={onReopen} className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                Reopen
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this job?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark the job as cancelled. Service providers will no longer be able to send quotes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Keep Open</AlertDialogCancel>
                    <AlertDialogAction onClick={onCancel} className="w-full sm:w-auto">Cancel Job</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            {formatDate(job.created_at)}
          </span>
          {job.location && (
            <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </span>
          )}
          <span className="font-medium text-foreground">
            {formatBudget(Number(job.budget_min), Number(job.budget_max))}
          </span>
        </div>

        {/* Quotes Section */}
        <div className="border-t border-border pt-3 sm:pt-4">
          <button
            onClick={() => setShowQuotes(!showQuotes)}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            {quotes.length} Quote{quotes.length !== 1 ? 's' : ''} Received
          </button>

          {showQuotes && quotes.length > 0 && (
            <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              {quotes.map((quote) => (
                <QuoteCard 
                  key={quote.id} 
                  quote={quote} 
                  messages={messages[quote.id] || []}
                  formatDate={formatDate}
                  userId={userId}
                  jobId={job.id}
                  onQuoteUpdate={onQuoteUpdate}
                />
              ))}
            </div>
          )}

          {showQuotes && quotes.length === 0 && (
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
              No quotes received yet. Providers will contact you soon!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface QuoteCardProps {
  quote: QuoteWithProvider;
  messages: Message[];
  formatDate: (date: string) => string;
  userId: string;
  jobId: string;
  onQuoteUpdate: () => void;
}

const QuoteCard = ({ quote, messages, formatDate, userId, jobId, onQuoteUpdate }: QuoteCardProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState(quote.status);
  const [showMessages, setShowMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [isTyping, setIsTyping] = useState(false);

  // Sync local status with quote.status
  useEffect(() => {
    setLocalStatus(quote.status);
  }, [quote.status]);

  const handleAcceptQuote = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: 'accepted' })
        .eq('id', quote.id);
      
      if (error) throw error;
      
      setLocalStatus('accepted');
      toast({ title: 'Quote accepted!', description: 'You can now message this provider to arrange the work.' });
      onQuoteUpdate();

      // Send email notification to provider (fire and forget)
      supabase.functions.invoke('send-quote-accepted-notification', {
        body: {
          quoteId: quote.id,
          providerId: quote.provider_id,
          jobId: jobId,
          jobPosterId: userId,
        },
      }).catch(err => console.error('Failed to send quote accepted notification:', err));

    } catch (error: any) {
      toast({ title: 'Error accepting quote', description: error.message, variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkCompleted = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: 'completed' })
        .eq('id', quote.id);
      
      if (error) throw error;
      
      setLocalStatus('completed');
      toast({ title: 'Job marked as completed!', description: 'You can now leave a review for this provider.' });
      onQuoteUpdate();
    } catch (error: any) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const canReview = localStatus === 'accepted' || localStatus === 'completed';
  const [providerIsTyping, setProviderIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Real-time subscription for this quote's messages
  useEffect(() => {
    if (!showMessages) return;

    const channel = supabase
      .channel(`quote-messages-${quote.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `quote_request_id=eq.${quote.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setLocalMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showMessages, quote.id]);

  // Set up realtime presence for typing indicators
  useEffect(() => {
    if (!showMessages) return;

    const channelName = `typing-${quote.id}`;
    const channel = supabase.channel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const otherTyping = Object.values(state).flat().some(
          (presence: any) => presence.user_id !== userId && presence.is_typing
        );
        setProviderIsTyping(otherTyping);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, is_typing: false });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showMessages, quote.id, userId]);

  const handleTyping = async (value: string) => {
    setNewMessage(value);
    
    const channelName = `typing-${quote.id}`;
    const channel = supabase.channel(channelName);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Track typing state
    if (value.trim()) {
      await channel.track({ user_id: userId, is_typing: true });
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(async () => {
        await channel.track({ user_id: userId, is_typing: false });
      }, 2000);
    } else {
      await channel.track({ user_id: userId, is_typing: false });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !quote.profiles) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          quote_request_id: quote.id,
          sender_id: userId,
          recipient_id: quote.provider_id,
          content: newMessage.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setLocalMessages(prev => [...prev, data as Message]);
      setNewMessage('');
      toast({ title: 'Message sent!' });

      // Send email notification (fire and forget)
      supabase.functions.invoke('send-message-notification', {
        body: {
          messageId: data.id,
          quoteRequestId: quote.id,
          senderId: userId,
          recipientId: quote.provider_id,
          content: newMessage.trim(),
        },
      }).catch(err => console.error('Failed to send notification:', err));

    } catch (error: any) {
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {quote.profiles?.avatar_url ? (
            <img 
              src={quote.profiles.avatar_url} 
              alt={quote.profiles.full_name || 'Provider'} 
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
            <div className="flex items-center gap-2">
              <Link 
                to={`/service-provider/${quote.provider_id}`}
                className="font-medium text-sm sm:text-base text-foreground hover:text-primary truncate"
              >
                {quote.profiles?.full_name || 'Service Provider'}
              </Link>
              {/* Status Badge */}
              {localStatus === 'accepted' && (
                <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Accepted
                </Badge>
              )}
              {localStatus === 'completed' && (
                <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Completed
                </Badge>
              )}
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {formatDate(quote.created_at)}
            </span>
          </div>
          
          {/* Provider's Quote Message */}
          {quote.message && (
            <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-[10px] sm:text-xs font-medium text-primary mb-1 flex items-center gap-1">
                <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Provider's Message
              </p>
              <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap">{quote.message}</p>
            </div>
          )}
          
          {/* Contact Info (visible because they requested a quote) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
            {quote.profiles?.email && (
              <a 
                href={`mailto:${quote.profiles.email}`}
                className="text-[10px] sm:text-xs text-primary flex items-center gap-1 hover:underline truncate"
              >
                <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                <span className="truncate">{quote.profiles.email}</span>
              </a>
            )}
            {quote.profiles?.phone && (
              <a 
                href={`tel:${quote.profiles.phone}`}
                className="text-[10px] sm:text-xs text-primary flex items-center gap-1 hover:underline"
              >
                <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                {quote.profiles.phone}
              </a>
            )}
          </div>

          {/* Accept/Complete Actions */}
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
            {localStatus === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAcceptQuote}
                disabled={isUpdating}
                className="h-7 text-xs gap-1"
              >
                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                Accept Quote
              </Button>
            )}
            {localStatus === 'accepted' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkCompleted}
                disabled={isUpdating}
                className="h-7 text-xs gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400 dark:border-green-800"
              >
                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                Mark as Completed
              </Button>
            )}
            
            {/* Review Button - only show if quote is accepted or completed */}
            {canReview && (
              <ReviewDialog
                providerId={quote.provider_id}
                providerName={quote.profiles?.full_name || 'Service Provider'}
                jobId={jobId}
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/20"
                  >
                    <Star className="w-3 h-3" />
                    Leave Review
                  </Button>
                }
              />
            )}
          </div>

          {/* Messages */}
          <div className="mt-2 sm:mt-3">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="text-[10px] sm:text-xs text-primary hover:underline flex items-center gap-1"
            >
              <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {localMessages.length > 0 ? `${localMessages.length} message${localMessages.length !== 1 ? 's' : ''}` : 'Send a message'}
            </button>

            {showMessages && (
              <div className="mt-2 sm:mt-3 space-y-2">
                {localMessages.map(msg => {
                  const isMe = msg.sender_id === userId;
                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">
                        {isMe ? 'You' : quote.profiles?.full_name || 'Provider'}
                      </span>
                      <div 
                        className={`text-xs sm:text-sm p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[80%] ${
                          isMe 
                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                            : 'bg-muted text-foreground rounded-bl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {providerIsTyping && (
                  <div className="flex items-start">
                    <span className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">
                      {quote.profiles?.full_name || 'Provider'}
                    </span>
                  </div>
                )}
                {providerIsTyping && (
                  <div className="flex items-start">
                    <div className="bg-muted text-muted-foreground rounded-lg rounded-bl-none px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="text-xs sm:text-sm h-8 sm:h-9"
                  />
                  <Button size="sm" onClick={handleSendMessage} disabled={sending || !newMessage.trim()} className="h-8 sm:h-9 px-2 sm:px-3">
                    {sending ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
