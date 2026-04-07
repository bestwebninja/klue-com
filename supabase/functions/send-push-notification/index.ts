/**
 * send-push-notification
 * Sends a Web Push notification to one or all subscriptions for a user.
 * Uses VAPID (Web Push Protocol – RFC 8030 / RFC 8292).
 *
 * Body:
 *   { userId: string, title: string, body: string, url?: string, icon?: string }
 *   OR
 *   { userIds: string[], title: string, body: string, url?: string }
 *
 * Required env vars:
 *   VAPID_PUBLIC_KEY   – base64url-encoded VAPID public key
 *   VAPID_PRIVATE_KEY  – base64url-encoded VAPID private key
 *   VAPID_SUBJECT      – mailto: or https: URI identifying the push sender
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── VAPID helpers (pure Web Crypto – no npm dependency) ──────────────────────

async function importVapidKey(privateKeyB64: string): Promise<CryptoKey> {
  const raw = base64UrlDecode(privateKeyB64);
  return crypto.subtle.importKey(
    'raw', raw,
    { name: 'ECDH', namedCurve: 'P-256' },
    false, ['deriveKey', 'deriveBits']
  );
}

async function signVapidJwt(subject: string, audience: string, privateKeyB64: string): Promise<string> {
  const header = b64url(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const exp    = Math.floor(Date.now() / 1000) + 12 * 3600;
  const claims = b64url(JSON.stringify({ aud: audience, exp, sub: subject }));
  const msg    = `${header}.${claims}`;

  const keyData = base64UrlDecode(privateKeyB64);
  const key     = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(msg)
  );
  return `${msg}.${b64urlBuf(sig)}`;
}

function b64url(str: string)                  { return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,''); }
function b64urlBuf(buf: ArrayBuffer)          { return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,''); }
function base64UrlDecode(str: string)         {
  const s = str.replace(/-/g,'+').replace(/_/g,'/');
  return Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer;
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const vapidPublic  = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY');
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:noreply@kluje.com';

  if (!vapidPublic || !vapidPrivate) {
    return json({ error: 'VAPID keys not configured' }, 500);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const body = await req.json() as {
    userId?: string;
    userIds?: string[];
    title: string;
    body: string;
    url?: string;
    icon?: string;
  };

  const { title, body: msgBody, url = 'https://kluje.com', icon = 'https://kluje.com/favicon.ico' } = body;
  const userIds = body.userIds ?? (body.userId ? [body.userId] : []);

  if (userIds.length === 0) return json({ error: 'userId or userIds required' }, 400);

  // Fetch subscriptions
  const { data: subs, error: fetchErr } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth_key, user_id')
    .in('user_id', userIds);

  if (fetchErr) return json({ error: fetchErr.message }, 500);
  if (!subs || subs.length === 0) return json({ sent: 0, skipped: 'no subscriptions' });

  const payload = JSON.stringify({ title, body: msgBody, url, icon });
  const staleEndpoints: string[] = [];
  let sent = 0;

  for (const sub of subs) {
    try {
      const origin = new URL(sub.endpoint).origin;
      const jwt    = await signVapidJwt(vapidSubject, origin, vapidPrivate);

      const pushRes = await fetch(sub.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `vapid t=${jwt},k=${vapidPublic}`,
          'Content-Type':  'application/octet-stream',
          'TTL':           '86400',
        },
        body: new TextEncoder().encode(payload),
      });

      if (pushRes.status === 410 || pushRes.status === 404) {
        staleEndpoints.push(sub.endpoint);
      } else if (pushRes.ok || pushRes.status === 201) {
        sent++;
      }
    } catch (e) {
      console.warn(`Push to ${sub.endpoint} failed:`, e);
    }
  }

  // Remove stale subscriptions
  if (staleEndpoints.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', staleEndpoints);
  }

  return json({ sent, staleRemoved: staleEndpoints.length });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
