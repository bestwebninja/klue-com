import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Briefcase, Search, Edit, Trash2, MapPin, CheckSquare, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type JobListing = Database['public']['Tables']['job_listings']['Row'] & {
  service_categories?: Database['public']['Tables']['service_categories']['Row'] | null;
  profiles?: Database['public']['Tables']['profiles']['Row'] | null;
};

type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];

const AdminJobs = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  useEffect(() => {
    fetchJobs();
    fetchCategories();
  }, []);

  useEffect(() => {
    let result = jobs;

    if (searchTerm) {
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((job) => job.status === statusFilter);
    }

    setFilteredJobs(result);
  }, [searchTerm, statusFilter, jobs]);

  const fetchJobs = async () => {
    // Fetch jobs with categories
    const { data: jobsData, error } = await supabase
      .from('job_listings')
      .select('*, service_categories(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      toast({ title: 'Error', description: 'Failed to fetch jobs', variant: 'destructive' });
    } else {
      // Fetch profiles separately for job posters
      const postedByIds = [...new Set((jobsData || []).map(j => j.posted_by).filter(Boolean))];
      let profilesMap: Record<string, any> = {};
      
      if (postedByIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', postedByIds as string[]);
        
        if (profilesData) {
          profilesMap = Object.fromEntries(profilesData.map(p => [p.id, p]));
        }
      }
      
      const jobsWithProfiles = (jobsData || []).map(job => ({
        ...job,
        profiles: job.posted_by ? profilesMap[job.posted_by] || null : null,
      }));
      
      setJobs(jobsWithProfiles as JobListing[]);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');

    if (!error) {
      setCategories(data || []);
    }
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    const { error } = await supabase
      .from('job_listings')
      .update({
        title: editingJob.title,
        description: editingJob.description,
        location: editingJob.location,
        status: editingJob.status,
        budget_min: editingJob.budget_min,
        budget_max: editingJob.budget_max,
        category_id: editingJob.category_id,
      })
      .eq('id', editingJob.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update job', variant: 'destructive' });
    } else {
      await logAction({
        action: 'update_job',
        entityType: 'job',
        entityId: editingJob.id,
        details: { title: editingJob.title, status: editingJob.status },
      });
      toast({ title: 'Success', description: 'Job updated successfully' });
      fetchJobs();
      setIsEditing(false);
      setEditingJob(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    const { error } = await supabase.from('job_listings').delete().eq('id', jobId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete job', variant: 'destructive' });
    } else {
      await logAction({
        action: 'delete_job',
        entityType: 'job',
        entityId: jobId,
      });
      toast({ title: 'Success', description: 'Job deleted successfully' });
      fetchJobs();
    }
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map((j) => j.id));
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedJobs.length === 0) return;

    setIsProcessing(true);

    try {
      if (bulkAction === 'delete') {
        if (!confirm(`Are you sure you want to delete ${selectedJobs.length} jobs?`)) {
          setIsProcessing(false);
          return;
        }
        const { error } = await supabase
          .from('job_listings')
          .delete()
          .in('id', selectedJobs);

        if (error) throw error;
        await logAction({
          action: 'bulk_delete_jobs',
          entityType: 'job',
          details: { job_ids: selectedJobs, count: selectedJobs.length },
        });
        toast({ title: 'Success', description: `Deleted ${selectedJobs.length} jobs` });
      } else if (['open', 'in_progress', 'completed', 'cancelled'].includes(bulkAction)) {
        const { error } = await supabase
          .from('job_listings')
          .update({ status: bulkAction })
          .in('id', selectedJobs);

        if (error) throw error;
        await logAction({
          action: `bulk_update_jobs_${bulkAction}`,
          entityType: 'job',
          details: { job_ids: selectedJobs, new_status: bulkAction, count: selectedJobs.length },
        });
        toast({ title: 'Success', description: `Updated ${selectedJobs.length} jobs to ${bulkAction}` });
      }

      fetchJobs();
      setSelectedJobs([]);
      setBulkAction('');
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({ title: 'Error', description: 'Failed to perform bulk action', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Job Listings Management
        </CardTitle>
        <CardDescription>View, edit, and manage all job listings</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Bulk Actions Bar */}
        {selectedJobs.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <span className="font-medium">{selectedJobs.length} selected</span>
            </div>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Set to Open</SelectItem>
                <SelectItem value="in_progress">Set to In Progress</SelectItem>
                <SelectItem value="completed">Set to Completed</SelectItem>
                <SelectItem value="cancelled">Set to Cancelled</SelectItem>
                <SelectItem value="delete" className="text-destructive">Delete Selected</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={handleBulkAction} 
              disabled={!bulkAction || isProcessing}
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
            >
              {isProcessing ? 'Processing...' : 'Apply'}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setSelectedJobs([]);
                setBulkAction('');
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Jobs Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} className={selectedJobs.includes(job.id) ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedJobs.includes(job.id)}
                      onCheckedChange={() => handleSelectJob(job.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {job.title}
                  </TableCell>
                  <TableCell>{job.service_categories?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location.substring(0, 20)}...
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>{formatDate(job.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={isEditing && editingJob?.id === job.id} onOpenChange={(open) => {
                      setIsEditing(open);
                      if (!open) setEditingJob(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingJob(job);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Job</DialogTitle>
                        </DialogHeader>
                        {editingJob && (
                          <div className="space-y-4">
                            <div>
                              <Label>Title</Label>
                              <Input
                                value={editingJob.title}
                                onChange={(e) =>
                                  setEditingJob({ ...editingJob, title: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={editingJob.description}
                                onChange={(e) =>
                                  setEditingJob({ ...editingJob, description: e.target.value })
                                }
                                rows={4}
                              />
                            </div>
                            <div>
                              <Label>Location</Label>
                              <Input
                                value={editingJob.location || ''}
                                onChange={(e) =>
                                  setEditingJob({ ...editingJob, location: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Category</Label>
                              <Select
                                value={editingJob.category_id || ''}
                                onValueChange={(v) =>
                                  setEditingJob({ ...editingJob, category_id: v })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <Select
                                value={editingJob.status}
                                onValueChange={(v) =>
                                  setEditingJob({ ...editingJob, status: v })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Min Budget ($)</Label>
                                <Input
                                  type="number"
                                  value={editingJob.budget_min || ''}
                                  onChange={(e) =>
                                    setEditingJob({
                                      ...editingJob,
                                      budget_min: e.target.value ? Number(e.target.value) : null,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Max Budget ($)</Label>
                                <Input
                                  type="number"
                                  value={editingJob.budget_max || ''}
                                  onChange={(e) =>
                                    setEditingJob({
                                      ...editingJob,
                                      budget_max: e.target.value ? Number(e.target.value) : null,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <Button onClick={handleUpdateJob} className="w-full">
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No jobs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Total jobs: {jobs.length} | Showing: {filteredJobs.length}
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminJobs;
