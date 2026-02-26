import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { ArrowLeft, Bell, Mail, MessageSquare, FileQuestion, MessageCircle, HelpCircle, MapPin } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useNotifications } from '@/hooks/useNotifications';
import { useUserRole } from '@/hooks/useUserRole';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { preferences, loading, saving, updatePreferences } = useNotificationPreferences();
  const { permission, requestPermission, isSupported } = useNotifications();
  const { isProvider } = useUserRole();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 p-4 md:p-8 pt-24 md:pt-28">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') {
        return;
      }
    }
    updatePreferences({ push_enabled: enabled });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title="Manage Notification Preferences | Kluje" description="Choose which email and push notifications you receive for new quotes, messages, job leads, and expert answers on Kluje." noIndex={true} />
      <Navbar />
      <div className="flex-1 pt-20">
        <div className="max-w-2xl mx-auto p-4 md:p-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Notification Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage how you receive notifications
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Notification Channels */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Channels
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="push-notifications" className="font-medium">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {isSupported 
                            ? permission === 'granted' 
                              ? 'Receive browser notifications when tab is inactive'
                              : permission === 'denied'
                                ? 'Browser notifications are blocked. Enable in browser settings.'
                                : 'Allow browser notifications'
                            : 'Not supported in this browser'
                          }
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={preferences.push_enabled && permission === 'granted'}
                      onCheckedChange={handlePushToggle}
                      disabled={saving || !isSupported || permission === 'denied'}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="email-notifications" className="font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={preferences.email_enabled}
                      onCheckedChange={(checked) => updatePreferences({ email_enabled: checked })}
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Notification Types
                  </CardTitle>
                  <CardDescription>
                    Choose which events trigger notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="new-messages" className="font-medium">
                          New Messages
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          When you receive a new message
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="new-messages"
                      checked={preferences.new_messages}
                      onCheckedChange={(checked) => updatePreferences({ new_messages: checked })}
                      disabled={saving}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileQuestion className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="quote-requests" className="font-medium">
                          Quote Requests
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          When a provider sends you a quote
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="quote-requests"
                      checked={preferences.quote_requests}
                      onCheckedChange={(checked) => updatePreferences({ quote_requests: checked })}
                      disabled={saving}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="quote-responses" className="font-medium">
                          Quote Responses
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          When someone responds to your quote
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="quote-responses"
                      checked={preferences.quote_responses}
                      onCheckedChange={(checked) => updatePreferences({ quote_responses: checked })}
                      disabled={saving}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="expert-answers" className="font-medium">
                          Expert Answers
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          When an expert answers your question
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="expert-answers"
                      checked={preferences.expert_answers}
                      onCheckedChange={(checked) => updatePreferences({ expert_answers: checked })}
                      disabled={saving}
                    />
                  </div>

                  {isProvider && (
                    <>
                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <Label htmlFor="job-lead-distance" className="font-medium">
                              Job Lead Distance
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Receive job lead notifications within {preferences.job_lead_max_distance} miles
                            </p>
                          </div>
                        </div>
                        <div className="px-2">
                          <Slider
                            id="job-lead-distance"
                            value={[preferences.job_lead_max_distance]}
                            onValueChange={(value) => updatePreferences({ job_lead_max_distance: value[0] })}
                            min={5}
                            max={200}
                            step={5}
                            disabled={saving}
                            className="w-full"
                          />
                          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            <span>5 miles</span>
                            <span>200 miles</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
