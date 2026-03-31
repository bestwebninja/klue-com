import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailJobSummary,
  EmailHighlightBox,
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

interface JobCancelledRequest {
  jobId: string;
  jobTitle: string;
  jobCategory?: string;
  cancellationReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-job-cancelled-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, jobTitle, jobCategory, cancellationReason }: JobCancelledRequest = await req.json();

    if (!jobId || !jobTitle) {
      return new Response(
        JSON.stringify({ error: "Job ID and title are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://kluje.com";

    // Get all providers who submitted quotes for this job
    const { data: quoteRequests, error: quotesError } = await supabase
      .from("quote_requests")
      .select("provider_id")
      .eq("job_listing_id", jobId)
      .in("status", ["pending", "accepted"]);

    if (quotesError) {
      console.error("Error fetching quote requests:", quotesError);
      throw quotesError;
    }

    if (!quoteRequests || quoteRequests.length === 0) {
      console.log("No providers to notify for this job");
      return new Response(
        JSON.stringify({ message: "No providers to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const providerIds = [...new Set(quoteRequests.map(q => q.provider_id))];
    let emailsSent = 0;

    for (const providerId of providerIds) {
      // Get provider details
      const { data: provider } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", providerId)
        .maybeSingle();

      if (!provider?.email) continue;

      // Check notification preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("email_enabled, quote_responses")
        .eq("user_id", providerId)
        .maybeSingle();

      if (prefs && (!prefs.email_enabled || !prefs.quote_responses)) continue;

      const reasonSection = cancellationReason 
        ? EmailHighlightBox({
            content: `<strong>Reason provided:</strong> ${cancellationReason}`,
            variant: 'info',
          })
        : '';

      const htmlContent = buildEmail({
        header: { title: 'Job Cancelled', subtitle: 'A job you quoted on has been cancelled', variant: 'provider' },
        greeting: provider.full_name || 'there',
        intro: `The homeowner has cancelled the job <strong>"${jobTitle}"</strong> that you submitted a quote for.`,
        sections: [
          EmailJobSummary({
            title: jobTitle,
            category: jobCategory || 'Service',
            budget: 'N/A',
          }),
          reasonSection,
          `<p style="margin: 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">Don't worry – there are plenty more opportunities waiting for you. Browse new jobs in your area to find your next project!</p>`,
        ],
        buttons: [
          { href: `${siteUrl}/browse-jobs`, text: 'Browse New Jobs', color: 'provider' },
        ],
        footer: "You're receiving this because you submitted a quote for this job on Kluje.",
        closing: "Questions? Reply to this email and we'll be happy to help!",
      });

      const subject = `Job Cancelled: ${jobTitle}`;
      
      try {
        const emailResponse = await sendEmail(provider.email, subject, htmlContent);

        // Log the email notification
        await supabase.from("email_notifications").insert({
          recipient_id: providerId,
          recipient_email: provider.email,
          email_type: "job_cancelled",
          subject,
          status: "sent",
          resend_id: emailResponse.id,
          related_entity_type: "job_listing",
          related_entity_id: jobId,
        });

        emailsSent++;
        console.log(`Job cancelled notification sent to provider ${providerId}`);
      } catch (emailError) {
        console.error(`Failed to send email to provider ${providerId}:`, emailError);
      }
    }

    console.log(`Job cancelled notifications sent to ${emailsSent} providers`);

    return new Response(
      JSON.stringify({ success: true, emailsSent }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-job-cancelled-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
