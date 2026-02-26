import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailInfoCard,
  EmailMessageBox,
  EmailSteps,
  EmailJobSummary,
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

interface QuoteNotificationRequest {
  jobId: string;
  providerId: string;
  message?: string | null;
}

async function trackEmailNotification(
  supabase: any,
  recipientId: string,
  recipientEmail: string,
  emailType: string,
  subject: string,
  relatedEntityId: string | null,
  relatedEntityType: string | null,
  resendId: string | null,
  status: string,
  errorMessage: string | null = null
) {
  try {
    await supabase.from("email_notifications").insert({
      recipient_id: recipientId,
      recipient_email: recipientEmail,
      email_type: emailType,
      subject: subject,
      related_entity_id: relatedEntityId,
      related_entity_type: relatedEntityType,
      resend_id: resendId,
      status: status,
      error_message: errorMessage,
    });
  } catch (error) {
    console.error("Failed to track email notification:", error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, providerId, message }: QuoteNotificationRequest = await req.json();
    
    console.log(`Sending quote notification for job ${jobId} from provider ${providerId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://kluje.lovable.app";

    const { data: job, error: jobError } = await supabase
      .from("job_listings")
      .select("title, description, posted_by, location")
      .eq("id", jobId)
      .maybeSingle();

    if (jobError || !job?.posted_by) {
      return new Response(
        JSON.stringify({ message: "No job or poster found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: provider } = await supabase
      .from("profiles")
      .select("full_name, email, phone, bio")
      .eq("id", providerId)
      .maybeSingle();

    const { data: jobPoster } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", job.posted_by)
      .maybeSingle();

    let posterEmail = jobPoster?.email;
    let posterName = jobPoster?.full_name || "there";
    let posterPhone = jobPoster?.phone || "Not provided";

    if (!posterEmail) {
      const { data: authUser } = await supabase.auth.admin.getUserById(job.posted_by);
      posterEmail = authUser?.user?.email;
      posterName = authUser?.user?.user_metadata?.full_name || posterName;
    }

    if (!posterEmail) {
      return new Response(
        JSON.stringify({ message: "No email found for job poster" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const providerName = provider?.full_name || "A service provider";
    const providerEmail = provider?.email || "Not provided";
    const providerPhone = provider?.phone || "Not provided";
    const providerBio = provider?.bio || null;

    const { data: providerServices } = await supabase
      .from("provider_services")
      .select("custom_name, service_categories(name)")
      .eq("provider_id", providerId)
      .limit(3);

    const servicesText = providerServices?.length 
      ? providerServices.map(s => s.custom_name || (s.service_categories as any)?.name).filter(Boolean).join(", ")
      : null;

    // Homeowner email
    const homeownerSubject = `New quote request from ${providerName} for "${job.title}"`;
    let homeownerEmailSuccess = false;
    let homeownerResendId: string | null = null;

    try {
      const providerInfoItems = [
        { label: 'Name', value: providerName },
        { label: 'Email', value: providerEmail, isLink: true },
        { label: 'Phone', value: providerPhone },
      ];
      if (servicesText) providerInfoItems.push({ label: 'Services', value: servicesText });
      if (providerBio) providerInfoItems.push({ label: 'About', value: providerBio });

      const htmlContent = buildEmail({
        header: { title: '🎉 You have a new quote request!', variant: 'homeowner' },
        greeting: posterName,
        intro: `Great news! <strong>${providerName}</strong> is interested in your job listing and would like to provide a quote.`,
        sections: [
          EmailJobSummary({ title: job.title, category: 'Your Job', location: job.location, budget: '' }),
          EmailInfoCard({ title: 'Provider Details', items: providerInfoItems, variant: 'default' }),
          message ? EmailMessageBox(message, "Provider's Message") : '',
        ].filter(Boolean),
        buttons: [
          { href: `${siteUrl}/provider/${providerId}`, text: 'View Provider Profile' },
          { href: `${siteUrl}/user-dashboard`, text: 'Go to Dashboard', variant: 'outline' },
        ],
        footer: "You received this email because a service provider expressed interest in your job on Kluje.",
      });

      const emailResponse = await sendEmail(posterEmail, homeownerSubject, htmlContent);
      homeownerEmailSuccess = true;
      homeownerResendId = emailResponse?.id || null;

      await trackEmailNotification(
        supabase, job.posted_by, posterEmail, "quote_request_received",
        homeownerSubject, jobId, "job_listing", homeownerResendId, "sent"
      );
    } catch (emailError: any) {
      console.error("Failed to send homeowner email:", emailError);
      await trackEmailNotification(
        supabase, job.posted_by, posterEmail, "quote_request_received",
        homeownerSubject, jobId, "job_listing", null, "error", emailError.message
      );
    }

    // Provider email
    const providerSubject = `Thank you for your quote request - "${job.title}"`;
    let providerEmailSuccess = false;

    if (provider?.email) {
      try {
        const jobDesc = job.description?.substring(0, 200) + (job.description?.length > 200 ? '...' : '');
        
        const nextSteps = EmailSteps({
          steps: [
            { title: 'Contact the homeowner', description: 'Discuss the job requirements in detail.' },
            { title: 'Arrange a site visit', description: 'If necessary, schedule a visit to assess the work.' },
            { title: 'Provide your detailed quote', description: 'Send a comprehensive quote with pricing.' },
            { title: 'Complete and get reviewed', description: 'Finish the job and request a review to build your reputation.' },
          ],
          color: 'provider'
        });

        const htmlContent = buildEmail({
          header: { title: '✅ Quote Request Submitted!', variant: 'provider' },
          greeting: providerName,
          intro: "Thank you for expressing interest in this job. The homeowner has been notified and you can now contact them directly.",
          sections: [
            EmailJobSummary({ title: job.title, category: jobDesc, location: job.location || 'Not specified', budget: '' }),
            EmailInfoCard({
              title: 'Homeowner Contact Details',
              items: [
                { label: 'Name', value: posterName },
                { label: 'Email', value: posterEmail, isLink: true },
                { label: 'Phone', value: posterPhone },
                { label: 'Location', value: job.location || 'Not specified' },
              ],
              variant: 'success'
            }),
            message ? EmailMessageBox(message, "Your Message to the Homeowner") : '',
            `<h3 style="margin: 25px 0 15px 0; font-size: 18px; color: #111827; font-weight: 600;">Next Steps</h3>`,
            nextSteps,
          ].filter(Boolean),
          buttons: [
            { href: `${siteUrl}/jobs/${jobId}`, text: 'View Job Details' },
            { href: `${siteUrl}/dashboard`, text: 'Go to Dashboard', variant: 'outline' },
          ],
          footer: "You received this email because you submitted a quote request on Kluje.",
          closing: "Good luck with this opportunity!",
        });

        const emailResponse = await sendEmail(provider.email, providerSubject, htmlContent);
        providerEmailSuccess = true;

        await trackEmailNotification(
          supabase, providerId, provider.email, "quote_request_sent",
          providerSubject, jobId, "job_listing", emailResponse?.id || null, "sent"
        );
      } catch (emailError: any) {
        console.error("Failed to send provider email:", emailError);
        await trackEmailNotification(
          supabase, providerId, provider.email, "quote_request_sent",
          providerSubject, jobId, "job_listing", null, "error", emailError.message
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: homeownerEmailSuccess || providerEmailSuccess, 
        homeownerNotified: homeownerEmailSuccess,
        providerNotified: providerEmailSuccess
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending quote notification:", errorMsg);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
