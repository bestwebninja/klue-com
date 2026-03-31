import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseAdmin = Boolean(supabaseUrl && supabaseServiceRoleKey);

export const supabaseAdmin = hasSupabaseAdmin
  ? createClient(supabaseUrl as string, supabaseServiceRoleKey as string, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;
