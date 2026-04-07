import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Manages Web Push VAPID subscriptions.
 *
 * Usage:
 *   const { supported, permission, subscribe, unsubscribe } = usePushNotifications();
 *
 * VAPID_PUBLIC_KEY must be set as VITE_VAPID_PUBLIC_KEY in the environment.
 * Generate keys with:  npx web-push generate-vapid-keys
 */

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotifications() {
  const [supported, setSupported]   = useState(false);
  const [permission, setPermission] = useState<PermissionState>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setSupported(ok);
    if (ok) setPermission(Notification.permission as PermissionState);
  }, []);

  // Register the service worker once
  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.register('/sw.js').catch((e) => {
      console.warn('SW registration failed:', e);
    });
  }, [supported]);

  const subscribe = useCallback(async (userId: string): Promise<boolean> => {
    if (!supported) return false;

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
    if (!vapidPublicKey) {
      console.error('VITE_VAPID_PUBLIC_KEY is not set');
      return false;
    }

    // Request permission
    const perm = await Notification.requestPermission();
    setPermission(perm as PermissionState);
    if (perm !== 'granted') return false;

    const reg  = await navigator.serviceWorker.ready;
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    setSubscription(sub);
    const subJson = sub.toJSON() as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    // Persist to Supabase via edge function (service role validates JWT)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    await supabase.functions.invoke('save-push-subscription', {
      body: {
        endpoint:  subJson.endpoint,
        p256dh:    subJson.keys.p256dh,
        authKey:   subJson.keys.auth,
        userAgent: navigator.userAgent,
      },
    });

    return true;
  }, [supported]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!subscription) return;
    await subscription.unsubscribe();
    setSubscription(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id);

    await supabase
      .from('profiles')
      .update({ push_enabled: false })
      .eq('id', user.id);
  }, [subscription]);

  return { supported, permission, subscription, subscribe, unsubscribe };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}
