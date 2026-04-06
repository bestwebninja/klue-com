import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Shared verification codes store
// NOTE: This needs to share state with send-sms-verification.
// Since edge functions are stateless, we'll use a database table instead.

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: 'Phone number and code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanPhone = phone.replace(/\s/g, '');

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: 'Invalid code format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the submitted code before comparing (codes are stored as SHA-256 hashes)
    const codeHash = Array.from(
      new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code)))
    ).map(b => b.toString(16).padStart(2, '0')).join('');

    // Look up the hashed code in the database
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: verification, error: fetchError } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('phone', cleanPhone)
      .eq('code_hash', codeHash)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verification) {
      // Check if too many attempts
      const { data: recentAttempts } = await supabase
        .from('phone_verifications')
        .select('attempts')
        .eq('phone', cleanPhone)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentAttempts && recentAttempts.attempts >= 5) {
        return new Response(
          JSON.stringify({ error: 'Too many failed attempts. Please request a new code.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment attempts
      if (recentAttempts) {
        await supabase
          .from('phone_verifications')
          .update({ attempts: (recentAttempts.attempts || 0) + 1 })
          .eq('phone', cleanPhone)
          .eq('verified', false);
      }

      return new Response(
        JSON.stringify({ error: 'Invalid or expired verification code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark as verified
    await supabase
      .from('phone_verifications')
      .update({ verified: true })
      .eq('id', verification.id);

    console.log(`Phone ${cleanPhone} verified successfully`);

    return new Response(
      JSON.stringify({ success: true, verified: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-sms-code:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
