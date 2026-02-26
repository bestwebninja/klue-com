import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { CheckCircle, XCircle, Eye, Loader2, FileText, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type VerificationRequest = Database['public']['Tables']['verification_requests']['Row'];

interface VerificationWithProfile extends VerificationRequest {
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

const AdminVerifications = () => {
  const [requests, setRequests] = useState<VerificationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationWithProfile | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    let query = (supabase as any)
      .from('verification_requests')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching verification requests:', error);
      setLoading(false);
      return;
    }

    // Fetch profiles for each request
    if (data && data.length > 0) {
      const providerIds = data.map((r: VerificationRequest) => r.provider_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', providerIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const enriched = data.map((r: VerificationRequest) => ({
        ...r,
        profile: profileMap.get(r.provider_id) || undefined,
      }));

      setRequests(enriched);
    } else {
      setRequests([]);
    }

    setLoading(false);
  };

  const handleReview = (request: VerificationWithProfile) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setReviewDialogOpen(true);
  };

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Update the verification request
      const { error: updateError } = await (supabase as any)
        .from('verification_requests')
        .update({
          status,
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id || null,
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      // If approved, update the provider's profile
      if (status === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', selectedRequest.provider_id);

        if (profileError) throw profileError;
      }

      // Send email notification
      try {
        await supabase.functions.invoke('send-verification-status-notification', {
          body: {
            providerId: selectedRequest.provider_id,
            status,
            businessName: selectedRequest.business_name,
            adminNotes: adminNotes || undefined,
          },
        });
      } catch (emailError) {
        console.error('Failed to send verification notification email:', emailError);
        // Don't fail the whole operation if email fails
      }

      // Log audit action
      await logAction({
        action: `verification_${status}`,
        entityType: 'verification_request',
        entityId: selectedRequest.id,
        details: {
          provider_id: selectedRequest.provider_id,
          business_name: selectedRequest.business_name,
          admin_notes: adminNotes || null,
        },
      });

      toast({
        title: `Verification ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `${selectedRequest.business_name} has been ${status}. An email notification has been sent.`,
      });

      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (error: any) {
      console.error('Error processing verification:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process verification request.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Verification Requests
              {filterStatus === 'pending' && pendingCount > 0 && (
                <Badge variant="secondary">{pendingCount} pending</Badge>
              )}
            </CardTitle>
            <CardDescription>Review and manage provider verification requests</CardDescription>
          </div>
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected', 'all'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No {filterStatus !== 'all' ? filterStatus : ''} verification requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Provider</TableHead>
                  <TableHead className="hidden md:table-cell">Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const config = statusConfig[request.status] || statusConfig.pending;
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.business_name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {request.profile?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {request.years_experience ? `${request.years_experience} years` : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {new Date(request.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReview(request)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Verification Request</DialogTitle>
              <DialogDescription>
                Review the provider's details and approve or reject their verification.
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Business Name</p>
                      <p className="font-medium">{selectedRequest.business_name}</p>
                    </div>
                    <Badge variant={statusConfig[selectedRequest.status]?.variant || 'secondary'}>
                      {statusConfig[selectedRequest.status]?.label || selectedRequest.status}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Provider</p>
                    <p className="font-medium">{selectedRequest.profile?.full_name || 'Unknown'}</p>
                    {selectedRequest.profile?.email && (
                      <p className="text-sm text-muted-foreground">{selectedRequest.profile.email}</p>
                    )}
                  </div>

                  {selectedRequest.business_registration_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Registration Number</p>
                      <p className="font-medium">{selectedRequest.business_registration_number}</p>
                    </div>
                  )}

                  {selectedRequest.years_experience !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground">Years of Experience</p>
                      <p className="font-medium">{selectedRequest.years_experience} years</p>
                    </div>
                  )}

                  {selectedRequest.qualifications && (
                    <div>
                      <p className="text-sm text-muted-foreground">Qualifications</p>
                      <p className="font-medium">{selectedRequest.qualifications}</p>
                    </div>
                  )}

                  {/* Document links */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">Uploaded Documents</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.id_document_url ? (
                        <a
                          href={selectedRequest.id_document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <FileText className="w-4 h-4" />
                          ID Document
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No ID document</span>
                      )}
                      {selectedRequest.insurance_document_url ? (
                        <a
                          href={selectedRequest.insurance_document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <FileText className="w-4 h-4" />
                          Insurance
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No insurance doc</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(selectedRequest.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="admin-notes">Admin Notes (optional, shared with provider if rejected)</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this verification request..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  {selectedRequest.status === 'pending' && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => handleDecision('rejected')}
                        disabled={isProcessing}
                        className="w-full sm:w-auto"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-1" />
                        )}
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleDecision('approved')}
                        disabled={isProcessing}
                        className="w-full sm:w-auto"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Approve
                      </Button>
                    </>
                  )}
                  {selectedRequest.status !== 'pending' && (
                    <p className="text-sm text-muted-foreground">
                      This request was {selectedRequest.status} on{' '}
                      {selectedRequest.reviewed_at
                        ? new Date(selectedRequest.reviewed_at).toLocaleString()
                        : 'unknown date'}
                    </p>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminVerifications;
