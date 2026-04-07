/**
 * save-push-subscription
 * Saves a Web Push VAPID subscription for the authenticated user.
 * Called from usePushNotifications.tsx after the browser grants permission.
 *
 * Body: { endpoint, p256dh, authKey, userAgent? }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Verify caller JWT
  const { data: { user }, error: authErr } = await createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  ).auth.getUser(authHeader.replace('Bearer ', ''));

  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  const { endpoint, p256dh, authKey, userAgent } = await req.json();
  if (!endpoint || !p256dh || !authKey) {
    return json({ error: 'endpoint, p256dh, and authKey are required' }, 400);
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: user.id, endpoint, p256dh, auth_key: authKey, user_agent: userAgent ?? null, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,endpoint' }
    );

  if (error) {
    console.error('save-push-subscription error:', error);
    return json({ error: 'Failed to save subscription' }, 500);
  }

  // Update profile push_enabled flag
  await supabase
    .from('profiles')
    .update({ push_enabled: true, push_consent_at: new Date().toISOString() })
    .eq('id', user.id);

  return json({ success: true });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
