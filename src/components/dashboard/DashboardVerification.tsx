import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Upload, CheckCircle, Clock, XCircle, FileText, AlertCircle } from 'lucide-react';

interface VerificationRequest {
  id: string;
  business_name: string;
  business_registration_number: string | null;
  insurance_document_url: string | null;
  id_document_url: string | null;
  qualifications: string | null;
  years_experience: number | null;
  status: string;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

interface DashboardVerificationProps {
  userId: string;
  isVerified: boolean;
}

const DashboardVerification = ({ userId, isVerified }: DashboardVerificationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingInsurance, setUploadingInsurance] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const insuranceInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    business_name: '',
    business_registration_number: '',
    qualifications: '',
    years_experience: '',
    insurance_document_url: '',
    id_document_url: ''
  });

  useEffect(() => {
    fetchVerificationRequest();
  }, [userId]);

  const fetchVerificationRequest = async () => {
    try {
      // Use any type until types regenerate
      const { data, error } = await (supabase as any)
        .from('verification_requests')
        .select('*')
        .eq('provider_id', userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setRequest(data as VerificationRequest);
        setFormData({
          business_name: (data as any).business_name || '',
          business_registration_number: (data as any).business_registration_number || '',
          qualifications: (data as any).qualifications || '',
          years_experience: (data as any).years_experience?.toString() || '',
          insurance_document_url: (data as any).insurance_document_url || '',
          id_document_url: (data as any).id_document_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'insurance' | 'id') => {
    if (!file.type.match(/^(image\/|application\/pdf)/)) {
      toast({ title: 'Please upload an image or PDF', variant: 'destructive' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File must be under 10MB', variant: 'destructive' });
      return;
    }

    const setUploading = type === 'insurance' ? setUploadingInsurance : setUploadingId;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('verifications')
        .getPublicUrl(fileName);

      const fieldName = type === 'insurance' ? 'insurance_document_url' : 'id_document_url';
      setFormData(prev => ({ ...prev, [fieldName]: publicUrl }));
      toast({ title: 'Document uploaded' });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: 'Error uploading document', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.business_name.trim()) {
      toast({ title: 'Business name is required', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        provider_id: userId,
        business_name: formData.business_name.trim(),
        business_registration_number: formData.business_registration_number.trim() || null,
        qualifications: formData.qualifications.trim() || null,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        insurance_document_url: formData.insurance_document_url || null,
        id_document_url: formData.id_document_url || null,
        status: 'pending'
      };

      if (request) {
        const { error } = await (supabase as any)
          .from('verification_requests')
          .update(payload)
          .eq('id', request.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('verification_requests')
          .insert(payload);
        if (error) throw error;
      }

      toast({ title: 'Verification request submitted' });
      fetchVerificationRequest();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({ title: error.message || 'Error submitting request', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1">
            <Clock className="w-3 h-3" />
            Pending Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Already verified via profile
  if (isVerified && !request) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">You're Verified!</h3>
          <p className="text-muted-foreground">
            Your account has been verified. The verified badge is shown on your profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Verification Request
              </CardTitle>
              <CardDescription>
                Get verified to build trust with customers. Verified providers appear higher in search results.
              </CardDescription>
            </div>
            {request && getStatusBadge(request.status)}
          </div>
        </CardHeader>
        <CardContent>
          {request?.status === 'approved' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verification Approved!</h3>
              <p className="text-muted-foreground">
                Your verification has been approved. The verified badge is now displayed on your profile.
              </p>
            </div>
          ) : request?.status === 'rejected' ? (
            <div className="space-y-6">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-500">Verification Rejected</p>
                    {request.admin_notes && (
                      <p className="text-sm text-muted-foreground mt-1">{request.admin_notes}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      You can update your information and resubmit.
                    </p>
                  </div>
                </div>
              </div>
              <VerificationForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                submitting={submitting}
                uploadingInsurance={uploadingInsurance}
                uploadingId={uploadingId}
                insuranceInputRef={insuranceInputRef}
                idInputRef={idInputRef}
                handleFileUpload={handleFileUpload}
              />
            </div>
          ) : request?.status === 'pending' ? (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Under Review</h3>
              <p className="text-muted-foreground mb-4">
                Your verification request is being reviewed. This usually takes 1-2 business days.
              </p>
              <p className="text-sm text-muted-foreground">
                Submitted on {new Date(request.submitted_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <VerificationForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              submitting={submitting}
              uploadingInsurance={uploadingInsurance}
              uploadingId={uploadingId}
              insuranceInputRef={insuranceInputRef}
              idInputRef={idInputRef}
              handleFileUpload={handleFileUpload}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface VerificationFormProps {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  uploadingInsurance: boolean;
  uploadingId: boolean;
  insuranceInputRef: React.RefObject<HTMLInputElement>;
  idInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (file: File, type: 'insurance' | 'id') => void;
}

const VerificationForm = ({ 
  formData, setFormData, onSubmit, submitting, 
  uploadingInsurance, uploadingId, 
  insuranceInputRef, idInputRef, handleFileUpload 
}: VerificationFormProps) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="business_name">Business Name *</Label>
        <Input
          id="business_name"
          value={formData.business_name}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, business_name: e.target.value }))}
          placeholder="Your registered business name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="business_registration_number">Registration Number</Label>
        <Input
          id="business_registration_number"
          value={formData.business_registration_number}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, business_registration_number: e.target.value }))}
          placeholder="Companies House number (optional)"
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="qualifications">Qualifications & Certifications</Label>
      <Textarea
        id="qualifications"
        value={formData.qualifications}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, qualifications: e.target.value }))}
        placeholder="List your relevant qualifications, certifications, and training..."
        rows={3}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="years_experience">Years of Experience</Label>
      <Input
        id="years_experience"
        type="number"
        min="0"
        max="99"
        value={formData.years_experience}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, years_experience: e.target.value }))}
        placeholder="e.g., 10"
        className="w-32"
      />
    </div>

    {/* Document Uploads */}
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Insurance Document</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4">
          {formData.insurance_document_url ? (
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Document uploaded</p>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0"
                  onClick={() => insuranceInputRef.current?.click()}
                >
                  Replace
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => insuranceInputRef.current?.click()}
              disabled={uploadingInsurance}
              className="w-full text-center"
            >
              {uploadingInsurance ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              ) : (
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground">
                {uploadingInsurance ? 'Uploading...' : 'Upload insurance certificate'}
              </p>
            </button>
          )}
        </div>
        <input
          ref={insuranceInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'insurance')}
          className="hidden"
        />
      </div>

      <div className="space-y-2">
        <Label>ID Document</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4">
          {formData.id_document_url ? (
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Document uploaded</p>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0"
                  onClick={() => idInputRef.current?.click()}
                >
                  Replace
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => idInputRef.current?.click()}
              disabled={uploadingId}
              className="w-full text-center"
            >
              {uploadingId ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              ) : (
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground">
                {uploadingId ? 'Uploading...' : 'Upload photo ID'}
              </p>
            </button>
          )}
        </div>
        <input
          ref={idInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'id')}
          className="hidden"
        />
      </div>
    </div>

    <div className="p-4 bg-muted rounded-lg">
      <p className="text-sm text-muted-foreground">
        <strong>Note:</strong> All documents are stored securely and only reviewed by our verification team. 
        Verification typically takes 1-2 business days.
      </p>
    </div>

    <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
      {submitting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Submitting...
        </>
      ) : (
        'Submit for Verification'
      )}
    </Button>
  </form>
);

export default DashboardVerification;