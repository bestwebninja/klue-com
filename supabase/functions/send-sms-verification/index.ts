import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate US phone format
    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^\+1\d{10}$/.test(cleanPhone)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid US mobile number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Rate limiting: check if a code was sent in the last 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentCode } = await supabase
      .from('phone_verifications')
      .select('id')
      .eq('phone', cleanPhone)
      .gt('created_at', oneMinuteAgo)
      .limit(1)
      .single();

    if (recentCode) {
      return new Response(
        JSON.stringify({ error: 'Please wait at least 60 seconds before requesting a new code.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the code with SHA-256 before persisting (never store plaintext OTPs)
    const codeHash = Array.from(
      new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code)))
    ).map(b => b.toString(16).padStart(2, '0')).join('');

    // Store hashed code in database with 10-minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase
      .from('phone_verifications')
      .insert({
        phone: cleanPhone,
        code_hash: codeHash,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('Error storing verification code:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create verification code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send via Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromPhone) {
      console.error('Missing Twilio credentials');
      return new Response(
        JSON.stringify({ error: 'SMS service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: cleanPhone,
        From: fromPhone,
        Body: `Your Kluje verification code is: ${code}. This code expires in 10 minutes.`,
      }),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio API error:', JSON.stringify({
        status: twilioResponse.status,
        code: twilioData.code,
        message: twilioData.message,
        moreInfo: twilioData.more_info,
      }));
      return new Response(
        JSON.stringify({ error: `Failed to send SMS: ${twilioData.message || 'Unknown Twilio error'}. Please check the phone number and try again.` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verification SMS delivered — SID: ${twilioData.sid}, Status: ${twilioData.status}, To: ${cleanPhone}, From: ${fromPhone}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Verification code sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-sms-verification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
