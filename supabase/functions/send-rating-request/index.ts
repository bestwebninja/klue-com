import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailHighlightBox,
  EmailStarRating,
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

interface RatingRequestPayload {
  quoteRequestId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-rating-request function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { quoteRequestId }: RatingRequestPayload = await req.json();

    if (!quoteRequestId) {
      return new Response(
        JSON.stringify({ error: "Quote request ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://kluje.lovable.app";

    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: quoteRequest, error: quoteError } = await supabase
      .from("quote_requests")
      .select(`id, provider_id, status, job_listing_id, job_listings (id, title, posted_by)`)
      .eq("id", quoteRequestId)
      .maybeSingle();

    if (quoteError || !quoteRequest) {
      return new Response(
        JSON.stringify({ error: "Quote request not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (quoteRequest.provider_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "You can only request ratings for your own quotes" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (quoteRequest.status !== 'accepted' && quoteRequest.status !== 'completed') {
      return new Response(
        JSON.stringify({ error: "Quote must be accepted before requesting a rating" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const jobListing = quoteRequest.job_listings as any;
    if (!jobListing?.posted_by) {
      return new Response(
        JSON.stringify({ error: "Job listing not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    await supabase
      .from("quote_requests")
      .update({ status: 'completed' })
      .eq("id", quoteRequestId);

    const { data: customer } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", jobListing.posted_by)
      .maybeSingle();

    if (!customer?.email) {
      return new Response(
        JSON.stringify({ success: true, message: "Quote marked as completed. Customer has no email address." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: provider } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const providerName = provider?.full_name || 'Your service provider';
    const customerName = customer.full_name || 'there';
    const jobTitle = jobListing.title || 'your project';

    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_enabled")
      .eq("user_id", jobListing.posted_by)
      .maybeSingle();

    if (prefs && !prefs.email_enabled) {
      return new Response(
        JSON.stringify({ success: true, message: "Quote marked as completed. Customer has disabled email notifications." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const htmlContent = buildEmail({
      header: { title: '⭐ Share Your Experience', variant: 'homeowner' },
      greeting: customerName,
      intro: `<strong>${providerName}</strong> has marked <strong>"${jobTitle}"</strong> as complete and would love to hear about your experience!`,
      sections: [
        EmailHighlightBox({
          content: '<strong>Your feedback matters!</strong> Reviews help other customers find great service providers and help providers improve their services.',
          variant: 'warning',
        }),
        `<div style="text-align: center; margin: 30px 0;">
          <p style="color: #6b7280; margin-bottom: 15px;">How would you rate your experience?</p>
          ${EmailStarRating(0, 'large')}
        </div>`,
      ],
      buttons: [
        { href: `${siteUrl}/provider/${quoteRequest.provider_id}`, text: 'Leave a Review' },
      ],
      footer: "You're receiving this because you posted a job on Kluje.",
      closing: `If you haven't finished working with ${providerName} yet, you can leave a review anytime from your dashboard.`,
    });

    const subject = `How was your experience with ${providerName}?`;
    await sendEmail(customer.email, subject, htmlContent);

    console.log("Rating request email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Rating request sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-rating-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
