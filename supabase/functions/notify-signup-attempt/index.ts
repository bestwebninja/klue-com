import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, userType } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Log the attempt
    await supabase.from("signup_attempts").insert({ email, user_type: userType });

    // Fetch notification email from site settings
    const { data: setting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "signup_notification_email")
      .single();

    const notifyEmail = String(setting?.value ?? "marcus@kluje.com").replace(/"/g, "");

    // Send email via Resend (requires RESEND_API_KEY secret in Supabase dashboard)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "noreply@kluje.com",
          to: notifyEmail,
          subject: `Kluje: Signup attempt — ${email}`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
              <h2 style="color:#f97316">Kluje Signup Notification</h2>
              <p>Someone attempted to create an account while signups are restricted.</p>
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="padding:6px 0;color:#666">Email</td><td style="padding:6px 0;font-weight:600">${email}</td></tr>
                <tr><td style="padding:6px 0;color:#666">Type</td><td style="padding:6px 0">${userType ?? "unknown"}</td></tr>
                <tr><td style="padding:6px 0;color:#666">Time</td><td style="padding:6px 0">${new Date().toUTCString()}</td></tr>
              </table>
              <p style="margin-top:24px;font-size:12px;color:#999">
                Manage signup restrictions at <a href="https://kluje.com/admin">kluje.com/admin</a>
              </p>
            </div>`,
        }),
      });

      // Mark as notified
      await supabase
        .from("signup_attempts")
        .update({ notified: true })
        .eq("email", email)
        .order("attempted_at", { ascending: false })
        .limit(1);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
