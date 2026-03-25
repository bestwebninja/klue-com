import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, Upload, X, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { DashboardEmailHistory } from './DashboardEmailHistory';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardProfileProps {
  profile: Profile | null;
  onProfileUpdate: () => void;
}

const DashboardProfile = ({ profile, onProfileUpdate }: DashboardProfileProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: 'Invalid file type', 
        description: 'Please upload an image file.',
        variant: 'destructive' 
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ 
        title: 'File too large', 
        description: 'Please upload an image under 2MB.',
        variant: 'destructive' 
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache busting parameter
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;
      
      setFormData(prev => ({ ...prev, avatar_url: urlWithCacheBust }));
      toast({ title: 'Avatar uploaded successfully' });
    } catch (error: any) {
      toast({ 
        title: 'Error uploading avatar', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          bio: formData.bio.trim(),
          avatar_url: formData.avatar_url || null
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({ title: 'Profile updated successfully' });
      onProfileUpdate();
    } catch (error: any) {
      toast({ 
        title: 'Error updating profile', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your business profile. This information will be visible to potential customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {formData.avatar_url ? (
                    <div className="relative">
                      <img 
                        src={formData.avatar_url} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-border"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                          (e.target as HTMLImageElement).className = 'hidden';
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name / Business Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John's Plumbing Services"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    {(profile as any)?.phone_verified ? (
                      <Badge variant="secondary" className="gap-1 text-xs bg-primary/10 text-primary border-primary/20">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </Badge>
                    ) : profile?.phone ? (
                      <Badge variant="secondary" className="gap-1 text-xs bg-destructive/10 text-destructive border-destructive/20">
                        <XCircle className="w-3 h-3" />
                        Not Verified
                      </Badge>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs gap-1"
                      onClick={() => setShowReverify(!showReverify)}
                    >
                      <RefreshCw className="w-3 h-3" />
                      {showReverify ? 'Cancel' : (profile as any)?.phone_verified ? 'Re-verify' : 'Verify'}
                    </Button>
                  </div>
                </div>
                {showReverify ? (
                  <div className="p-4 border border-border rounded-lg bg-muted/30">
                    <PhoneVerification
                      onVerified={async (phone) => {
                        // Update profile with new verified phone
                        if (profile) {
                          await supabase
                            .from('profiles')
                            .update({ phone, phone_verified: true } as any)
                            .eq('id', profile.id);
                          setFormData(prev => ({ ...prev, phone }));
                          setShowReverify(false);
                          onProfileUpdate();
                          toast({ title: 'Phone verified!', description: 'Your mobile number has been updated and verified.' });
                        }
                      }}
                      userType="provider"
                    />
                  </div>
                ) : (
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    maxLength={20}
                    disabled
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  Use the {(profile as any)?.phone_verified ? 're-verify' : 'verify'} button to change or verify your phone number.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio / About Your Business</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell customers about your experience, qualifications, and the services you offer..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Email:</strong> {profile?.email || 'Not set'}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <strong>Mobile:</strong> {profile?.phone || 'Not set'}
                {(profile as any)?.phone_verified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                ) : profile?.phone ? (
                  <span className="inline-flex items-center gap-1 text-xs text-destructive">
                    <XCircle className="w-3 h-3" /> Not verified
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed here. Contact support if you need to update your email.
              </p>
            </div>

            <Button type="submit" disabled={loading || uploading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email Notification History */}
      <DashboardEmailHistory />
    </div>
  );
};

export default DashboardProfile;
