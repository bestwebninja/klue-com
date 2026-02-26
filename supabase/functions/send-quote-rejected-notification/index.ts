import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailJobSummary,
  EmailTipBox,
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
      from: "Kluje <notifications@kluje.co.uk>",
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

interface QuoteRejectedRequest {
  quoteRequestId: string;
  providerId: string;
  jobTitle: string;
  jobCategory?: string;
  rejectionReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-quote-rejected-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quoteRequestId, providerId, jobTitle, jobCategory, rejectionReason }: QuoteRejectedRequest = await req.json();

    if (!providerId || !jobTitle) {
      return new Response(
        JSON.stringify({ error: "Provider ID and job title are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://kluje.lovable.app";

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
      .select("email_enabled, quote_responses")
      .eq("user_id", providerId)
      .maybeSingle();

    if (prefs && (!prefs.email_enabled || !prefs.quote_responses)) {
      console.log("Email notifications disabled for this user");
      return new Response(
        JSON.stringify({ message: "Email notifications disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const tipsSection = EmailTipBox({
      title: "Don't be discouraged!",
      items: [
        "Homeowners often receive multiple quotes and choose based on various factors",
        "Keep your profile updated with recent work to stand out",
        "Respond quickly to new job leads to increase your chances",
        "Consider adding more portfolio images to showcase your expertise",
      ],
      variant: "info",
    });

    const htmlContent = buildEmail({
      header: { title: 'Quote Update', subtitle: 'Your quote was not selected', variant: 'provider' },
      greeting: provider.full_name || 'there',
      intro: `Unfortunately, the homeowner has decided not to proceed with your quote for <strong>"${jobTitle}"</strong>.${rejectionReason ? ` They mentioned: "${rejectionReason}"` : ''}`,
      sections: [
        EmailJobSummary({
          title: jobTitle,
          category: jobCategory || 'Service',
          budget: 'N/A',
        }),
        tipsSection,
      ],
      buttons: [
        { href: `${siteUrl}/browse-jobs`, text: 'Browse New Jobs', color: 'provider' },
        { href: `${siteUrl}/dashboard?tab=quotes`, text: 'View My Quotes', variant: 'outline' },
      ],
      footer: "You're receiving this because you submitted a quote on Kluje.",
      closing: "Keep up the great work – the right job is just around the corner!",
    });

    const subject = `Quote Update: ${jobTitle}`;
    const emailResponse = await sendEmail(provider.email, subject, htmlContent);

    // Log the email notification
    await supabase.from("email_notifications").insert({
      recipient_id: providerId,
      recipient_email: provider.email,
      email_type: "quote_rejected",
      subject,
      status: "sent",
      resend_id: emailResponse.id,
      related_entity_type: "quote_request",
      related_entity_id: quoteRequestId,
    });

    console.log("Quote rejected notification sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-quote-rejected-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
