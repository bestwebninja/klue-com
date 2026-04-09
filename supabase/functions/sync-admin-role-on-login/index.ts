import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_ALLOWLIST = [
  'divitiae.terrae.llc@gmail.com',
  'marcus@kluje.com',
  'marcusmommsen@gmail.com',
] as const;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const anonClient = createClient(supabaseUrl, anonKey);

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const email = user.email?.toLowerCase() ?? '';
  const isAllowlisted = ADMIN_ALLOWLIST.includes(email as (typeof ADMIN_ALLOWLIST)[number]);

  if (!isAllowlisted) {
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
