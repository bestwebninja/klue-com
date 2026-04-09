import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DEFAULT_ADMIN_ALLOWLIST = [
  'divitiae.terrae.llc@gmail.com',
  'marcus@kluje.com',
  'marcusmommsen@gmail.com',
] as const;

const resolveAllowlist = (): string[] => {
  const configured = Deno.env.get('ADMIN_ALLOWLIST_EMAILS');
  if (!configured) return [...DEFAULT_ADMIN_ALLOWLIST];

  const emails = configured
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return emails.length > 0 ? emails : [...DEFAULT_ADMIN_ALLOWLIST];
};

const ADMIN_ALLOWLIST = resolveAllowlist();

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Missing Supabase environment configuration' }, 500);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(token);

  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const email = user.email?.toLowerCase() ?? '';
  if (!ADMIN_ALLOWLIST.includes(email)) {
    return json({ ok: true, synced: false });
  }

  const { error: upsertError } = await adminClient
    .from('user_roles')
    .upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id,role' });

  if (upsertError) {
    console.error('sync-admin-role-on-login upsert error:', upsertError);
    return json({ error: 'Failed to sync admin role' }, 500);
  }

  return json({ ok: true, synced: true });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
