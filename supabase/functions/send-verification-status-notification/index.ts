import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailTipBox,
  EmailHighlightBox,
  EmailSteps,
} from "../_shared/email-templates/components.tsx";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Kluje <notifications@kluje.com>",
      to: [to],
      subject,
      html,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
  
  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationStatusRequest {
  providerId: string;
  status: 'approved' | 'rejected';
  businessName: string;
  adminNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-verification-status-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { providerId, status, businessName, adminNotes }: VerificationStatusRequest = await req.json();

    if (!providerId || !status || !businessName) {
      return new Response(
        JSON.stringify({ error: "Provider ID, status, and business name are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://kluje.com";

    // Get provider details
    const { data: provider, error: providerError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", providerId)
      .maybeSingle();

    if (providerError || !provider?.email) {
      console.log("Provider has no email address");
      return new Response(
        JSON.stringify({ message: "Provider has no email address" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check notification preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_enabled")
      .eq("user_id", providerId)
      .maybeSingle();

    if (prefs && !prefs.email_enabled) {
      console.log("Email notifications disabled for this user");
      return new Response(
        JSON.stringify({ message: "Email notifications disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let htmlContent: string;
    let subject: string;

    if (status === 'approved') {
      const benefitsSection = EmailTipBox({
        title: '🎉 Your Verified Benefits',
        items: [
          'Verified badge displayed on your profile',
          'Higher visibility in search results',
          'Increased trust from homeowners',
          'Priority placement in job matches',
        ],
        variant: 'success',
      });

      const nextStepsSection = EmailSteps({
        steps: [
          { title: 'Complete your profile', description: 'Add a professional bio and contact details' },
          { title: 'Upload portfolio images', description: 'Showcase your best work to attract customers' },
          { title: 'Set your service areas', description: 'Define where you operate to get relevant leads' },
          { title: 'Start quoting', description: 'Browse jobs and submit competitive quotes' },
        ],
        color: 'provider',
      });

      htmlContent = buildEmail({
        header: { title: '✅ Verification Approved!', subtitle: `${businessName} is now verified`, variant: 'provider' },
        greeting: provider.full_name || 'there',
        intro: `Great news! Your verification request for <strong>${businessName}</strong> has been approved. You're now a verified service provider on Kluje!`,
        sections: [
          benefitsSection,
          `<h2 style="margin: 30px 0 20px 0; font-size: 20px; color: #111827; font-weight: 600;">Next Steps</h2>`,
          nextStepsSection,
        ],
        buttons: [
          { href: `${siteUrl}/dashboard`, text: 'Go to Dashboard', color: 'provider' },
          { href: `${siteUrl}/browse-jobs`, text: 'Browse Jobs', variant: 'outline' },
        ],
        footer: "You're receiving this because you submitted a verification request on Kluje.",
        closing: "Congratulations and welcome to the verified provider community!",
      });

      subject = `🎉 Verification Approved: ${businessName}`;
    } else {
      const reasonSection = adminNotes 
        ? EmailHighlightBox({
            content: `<strong>Reason:</strong> ${adminNotes}`,
            variant: 'warning',
          })
        : '';

      const nextStepsSection = EmailTipBox({
        title: 'What you can do',
        items: [
          'Review the feedback provided and address any issues',
          'Ensure all documents are clear and legible',
          'Make sure your business details are accurate',
          'Resubmit your verification request when ready',
        ],
        variant: 'info',
      });

      htmlContent = buildEmail({
        header: { title: 'Verification Update', subtitle: 'Your request needs attention', variant: 'provider' },
        greeting: provider.full_name || 'there',
        intro: `We've reviewed your verification request for <strong>${businessName}</strong>, but we weren't able to approve it at this time.`,
        sections: [
          reasonSection,
          nextStepsSection,
          `<p style="margin: 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">Don't worry – you can still use Kluje as a service provider. Once you've addressed the issues, you're welcome to submit a new verification request.</p>`,
        ],
        buttons: [
          { href: `${siteUrl}/dashboard?tab=verification`, text: 'Review & Resubmit', color: 'provider' },
        ],
        footer: "You're receiving this because you submitted a verification request on Kluje.",
        closing: "Questions? Reply to this email and we'll be happy to help!",
      });

      subject = `Verification Update: ${businessName}`;
    }

    const emailResponse = await sendEmail(provider.email, subject, htmlContent);

    // Log the email notification
    await supabase.from("email_notifications").insert({
      recipient_id: providerId,
      recipient_email: provider.email,
      email_type: `verification_${status}`,
      subject,
      status: "sent",
      resend_id: emailResponse.id,
      related_entity_type: "verification_request",
    });

    console.log(`Verification ${status} notification sent successfully:`, emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-verification-status-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
