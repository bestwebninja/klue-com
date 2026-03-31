import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailInfoCard,
  EmailHighlightBox,
} from "../_shared/email-templates/components.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeocodingNotificationRequest {
  jobId: string;
  success: boolean;
  location?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, success, location, error }: GeocodingNotificationRequest = await req.json();
    
    console.log(`Sending geocoding notification for job ${jobId}, success: ${success}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://kluje.com";

    const { data: job, error: fetchError } = await supabase
      .from("job_listings")
      .select(`
        id,
        title,
        location,
        posted_by,
        profiles:posted_by (
          email,
          full_name
        )
      `)
      .eq("id", jobId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching job:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch job details" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!job) {
      console.log("Job not found:", jobId);
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profiles = job.profiles as { email: string | null; full_name: string | null }[] | null;
    const profile = profiles && profiles.length > 0 ? profiles[0] : null;
    const email = profile?.email;
    const userName = profile?.full_name || "there";

    if (!email) {
      console.log("No email found for job poster:", jobId);
      return new Response(
        JSON.stringify({ message: "No email found for job poster" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject: string;
    let htmlContent: string;

    if (success) {
      subject = `✅ Location verified for your job: ${job.title}`;
      htmlContent = buildEmail({
        header: { title: '📍 Location Verified!', variant: 'homeowner' },
        greeting: userName,
        intro: `Great news! The location for your job posting has been successfully verified.`,
        sections: [
          EmailInfoCard({
            title: 'Job Details',
            items: [
              { label: 'Job Title', value: job.title },
              { label: 'Location', value: location || job.location },
            ],
            variant: 'success',
          }),
          EmailHighlightBox({
            content: 'Your job is now visible to service providers in your area. You should start receiving quotes soon!',
            variant: 'success',
            icon: '🎉',
          }),
        ],
        buttons: [
          { href: `${siteUrl}/dashboard?tab=jobs`, text: 'View My Jobs' },
        ],
        footer: "You're receiving this because you posted a job on Kluje.",
        closing: "Questions? Reply to this email and we'll be happy to help!",
      });
    } else {
      subject = `⚠️ Location issue with your job: ${job.title}`;
      htmlContent = buildEmail({
        header: { title: '📍 Location Update Needed', subtitle: 'We couldn\'t verify your job location', variant: 'homeowner' },
        greeting: userName,
        intro: `We couldn't verify the location for your job posting. This means service providers may not be able to find your job.`,
        sections: [
          EmailInfoCard({
            title: 'Job Details',
            items: [
              { label: 'Job Title', value: job.title },
              { label: 'Location Entered', value: job.location },
            ],
          }),
          EmailHighlightBox({
            content: `<strong>Issue:</strong> ${error || "Location not found"}`,
            variant: 'warning',
          }),
          `<p style="margin: 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">Please update your job with a more specific address (including ZIP code) to help service providers find you.</p>`,
        ],
        buttons: [
          { href: `${siteUrl}/dashboard?tab=jobs`, text: 'Update Job Location' },
        ],
        footer: "You're receiving this because you posted a job on Kluje.",
        closing: "Need help? Reply to this email and we'll assist you!",
      });
    }

    const emailResponse = await resend.emails.send({
      from: "Kluje <notifications@kluje.com>",
      to: [email],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending geocoding notification:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
