import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailHighlightBox,
  EmailTipBox,
} from "../_shared/email-templates/components.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SuspensionNotificationRequest {
  userId: string;
  action: "suspended" | "unsuspended";
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, action, reason }: SuspensionNotificationRequest = await req.json();

    console.log(`Processing ${action} notification for user ${userId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://kluje.lovable.app";

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      throw new Error("User profile not found");
    }

    if (!profile.email) {
      console.error("User has no email address");
      throw new Error("User has no email address");
    }

    const userName = profile.full_name || "there";
    
    let subject: string;
    let htmlContent: string;

    if (action === "suspended") {
      subject = "⚠️ Your Account Has Been Suspended";
      
      const reasonSection = reason 
        ? EmailHighlightBox({
            content: `<strong>Reason:</strong> ${reason}`,
            variant: 'warning',
          })
        : '';

      htmlContent = buildEmail({
        header: { title: '🚫 Account Suspended', variant: 'provider' },
        greeting: userName,
        intro: `We regret to inform you that your account has been suspended.`,
        sections: [
          reasonSection,
          EmailTipBox({
            title: 'What happens now?',
            items: [
              'You will not be able to access your dashboard',
              'Your profile will be hidden from other users',
              'Any active quotes or jobs will be paused',
              'You can appeal this decision by contacting support',
            ],
            variant: 'warning',
          }),
          `<p style="margin: 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">If you believe this is a mistake or would like to appeal this decision, please contact our support team.</p>`,
        ],
        buttons: [
          { href: `${siteUrl}/contact`, text: 'Contact Support', variant: 'outline' },
        ],
        footer: "This is an automated notification regarding your Kluje account.",
        closing: "We're here to help if you have any questions.",
      });
    } else {
      subject = "✅ Your Account Has Been Reactivated";
      htmlContent = buildEmail({
        header: { title: '🎉 Welcome Back!', subtitle: 'Your account has been reactivated', variant: 'homeowner' },
        greeting: userName,
        intro: `Great news! Your account has been reactivated and you can now access all features again.`,
        sections: [
          EmailHighlightBox({
            content: 'Your account is now active and you can continue using Kluje as normal.',
            variant: 'success',
            icon: '✅',
          }),
          EmailTipBox({
            title: 'Get back on track',
            items: [
              'Review and update your profile information',
              'Check for any new job leads in your area',
              'Respond to any pending messages',
              'Continue building your reputation with great service',
            ],
            variant: 'success',
          }),
        ],
        buttons: [
          { href: `${siteUrl}/dashboard`, text: 'Go to Dashboard' },
        ],
        footer: "We're glad to have you back on Kluje!",
        closing: "Thank you for your patience and understanding.",
      });
    }

    const emailResponse = await resend.emails.send({
      from: "Kluje <notifications@kluje.com>",
      to: [profile.email],
      subject,
      html: htmlContent,
    });

    console.log(`Email sent successfully for ${action}:`, emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-suspension-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
