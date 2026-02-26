import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailStarRating,
  EmailInfoCard,
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

interface ReviewNotificationRequest {
  providerId: string;
  reviewerName: string;
  rating: number;
  title?: string;
  content?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-review-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { providerId, reviewerName, rating, title, content }: ReviewNotificationRequest = await req.json();

    if (!providerId) {
      return new Response(
        JSON.stringify({ error: "Provider ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://kluje.lovable.app";

    const { data: provider, error: providerError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", providerId)
      .maybeSingle();

    if (providerError || !provider?.email) {
      return new Response(
        JSON.stringify({ message: "Provider has no email address" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_enabled")
      .eq("user_id", providerId)
      .maybeSingle();

    if (prefs && !prefs.email_enabled) {
      return new Response(
        JSON.stringify({ message: "Email notifications disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const reviewContent = content 
      ? `<p style="margin: 0; color: #4b5563;">"${content}"</p>`
      : `<p style="margin: 0; color: #9ca3af; font-style: italic;">No written review provided</p>`;

    const reviewSection = `
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
        ${EmailStarRating(rating)}
        ${title ? `<h3 style="margin: 0 0 8px 0; color: #111827;">${title}</h3>` : ''}
        ${reviewContent}
      </div>
    `;

    const htmlContent = buildEmail({
      header: { title: '⭐ New Review Received!', variant: 'homeowner' },
      greeting: provider.full_name || 'there',
      intro: `Great news! <strong>${reviewerName}</strong> just left you a review on Kluje.`,
      sections: [
        reviewSection,
        `<p style="margin: 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">You can respond to this review from your dashboard to thank your customer or address any feedback.</p>`,
      ],
      buttons: [
        { href: `${siteUrl}/dashboard`, text: 'View in Dashboard' },
      ],
      footer: "You're receiving this because you have a provider account on Kluje.",
      closing: "Keep up the great work!",
    });

    const subject = `New ${rating}-Star Review from ${reviewerName}`;
    const emailResponse = await sendEmail(provider.email, subject, htmlContent);

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-review-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
