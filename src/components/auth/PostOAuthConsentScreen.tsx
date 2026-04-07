import { useState } from 'react';
import { Bell, Mail, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface Props {
  userId: string;
  email: string;
  provider: string;
  onComplete: () => void;
}

export default function PostOAuthConsentScreen({ userId, email, provider, onComplete }: Props) {
  const [pushEnabled, setPushEnabled]           = useState(true);
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [saving, setSaving]                     = useState(false);
  const { toast }     = useToast();
  const { subscribe } = usePushNotifications();

  const handleSave = async () => {
    setSaving(true);
    const now = new Date().toISOString();

    try {
      // 1. Save preferences to profile
      await supabase
        .from('profiles')
        .update({
          push_enabled:          pushEnabled,
          push_consent_at:       pushEnabled ? now : null,
          newsletter_enabled:    newsletterEnabled,
          newsletter_consent_at: newsletterEnabled ? now : null,
        } as any)
        .eq('id', userId);

      // 2. Subscribe to Web Push if user consented
      if (pushEnabled) {
        try {
          await subscribe(userId);
        } catch (e) {
          // Non-fatal – push may be blocked; user can enable later from settings
          console.warn('Push subscription failed:', e);
          toast({
            title: 'Push notifications',
            description: 'Could not register push notifications. You can enable them later in Settings.',
          });
        }
      }

      // 3. Subscribe to newsletter
      if (newsletterEnabled) {
        await supabase.from('newsletter_subscribers' as any).upsert(
          {
            email,
            consent_marketing: true,
            source: 'social_signup',
            consent_source: 'social_signup',
          } as any,
          { onConflict: 'email' }
        );
      }

      onComplete();
    } catch (err) {
      toast({ title: 'Error saving preferences', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const providerLabel = provider === 'linkedin_oidc' ? 'LinkedIn' : provider === 'google' ? 'Google' : 'social';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">You're almost in!</h1>
          <p className="text-slate-400 text-sm">
            Signed in with {providerLabel}. Choose your notification preferences to get the most out of Kluje.
          </p>
        </div>

        {/* Consent options */}
        <div className="space-y-4 mb-8">

          {/* Push notifications */}
          <label
            htmlFor="push-consent"
            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors
              ${pushEnabled
                ? 'border-brand-500/60 bg-brand-500/10'
                : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800/60'}`}
          >
            <Checkbox
              id="push-consent"
              checked={pushEnabled}
              onCheckedChange={(v) => setPushEnabled(!!v)}
              className="mt-0.5 data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-4 h-4 text-brand-400" />
                <span className="text-white font-medium text-sm">Enable push notifications</span>
                <span className="text-xs bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full">Recommended</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Get instant job alerts, quote updates, and AI-powered match notifications delivered to your device.
              </p>
            </div>
          </label>

          {/* Newsletter */}
          <label
            htmlFor="newsletter-consent"
            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors
              ${newsletterEnabled
                ? 'border-brand-500/60 bg-brand-500/10'
                : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800/60'}`}
          >
            <Checkbox
              id="newsletter-consent"
              checked={newsletterEnabled}
              onCheckedChange={(v) => setNewsletterEnabled(!!v)}
              className="mt-0.5 data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-brand-400" />
                <span className="text-white font-medium text-sm">Subscribe to Kluje Newsletter</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Market insights, AI tips, contractor success stories, and exclusive offers. Unsubscribe anytime.
              </p>
            </div>
          </label>
        </div>

        {/* CTA */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm"
        >
          {saving
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
            : <><span>Continue to Kluje</span><ChevronRight className="w-4 h-4 ml-2" /></>}
        </Button>

        <p className="text-slate-500 text-xs text-center mt-4">
          You can change these preferences anytime in{' '}
          <span className="text-slate-400">Settings → Notifications</span>.
        </p>
      </div>
    </div>
  );
}
