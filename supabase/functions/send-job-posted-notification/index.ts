import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailSteps,
  EmailTipBox,
  EmailJobSummary,
  EmailSectionHeading,
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

interface JobPostedNotificationRequest {
  jobId: string;
  userId: string;
}

async function trackEmailNotification(
  supabase: any,
  recipientId: string,
  recipientEmail: string,
  emailType: string,
  relatedEntityId: string,
  relatedEntityType: string,
  subject: string,
  status: 'sent' | 'error',
  resendId?: string,
  errorMessage?: string
) {
  try {
    await supabase.from('email_notifications').insert({
      recipient_id: recipientId,
      recipient_email: recipientEmail,
      email_type: emailType,
      related_entity_id: relatedEntityId,
      related_entity_type: relatedEntityType,
      subject: subject,
      status: status,
      resend_id: resendId || null,
      error_message: errorMessage || null,
    });
  } catch (error) {
    console.error('Failed to track email notification:', error);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, userId }: JobPostedNotificationRequest = await req.json();

    if (!jobId || !userId) {
      throw new Error("Missing jobId or userId");
    }

    console.log(`Processing job posted notification for job: ${jobId}, user: ${userId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: job, error: jobError } = await supabase
      .from("job_listings")
      .select("id, title, description, location, budget_min, budget_max, category_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Failed to fetch job: ${jobError?.message || "Not found"}`);
    }

    let categoryName = "General";
    if (job.category_id) {
      const { data: category } = await supabase
        .from("service_categories")
        .select("name")
        .eq("id", job.category_id)
        .single();
      if (category) categoryName = category.name;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();

    let userEmail = profile?.email;
    if (!userEmail) {
      const { data: authData } = await supabase.auth.admin.getUserById(userId);
      userEmail = authData?.user?.email;
    }

    if (!userEmail) {
      throw new Error("Could not find user email");
    }

    const userName = profile?.full_name || "there";
    const siteUrl = Deno.env.get('SITE_URL') || 'https://kluje.lovable.app';
    const budgetText = job.budget_min && job.budget_max 
      ? `$${job.budget_min.toLocaleString()} - $${job.budget_max.toLocaleString()}`
      : job.budget_min 
        ? `From $${job.budget_min.toLocaleString()}`
        : job.budget_max 
          ? `Up to $${job.budget_max.toLocaleString()}`
          : "Flexible";

    const subject = `Your job "${job.title}" has been posted! 🎉`;

    const jobSummary = EmailJobSummary({
      title: job.title,
      category: categoryName,
      location: job.location || undefined,
      budget: budgetText,
    });

    const nextSteps = EmailSteps({
      steps: [
        { title: 'Service providers review your job', description: 'Your job is now visible to qualified professionals who match your requirements.' },
        { title: 'Receive quote requests', description: "Interested providers will send you quote requests. You'll receive email notifications for each." },
        { title: 'Review and compare quotes', description: 'Compare quotes, check provider profiles, ratings, and reviews before deciding.' },
        { title: 'Accept and hire', description: 'Accept a quote to connect directly with the provider. Complete the job and leave a review!' },
      ],
      color: 'homeowner'
    });

    const dueDiligence = EmailTipBox({
      title: '🔍 Due Diligence Checklist',
      variant: 'warning',
      intro: 'Before hiring a service provider, we recommend checking:',
      items: [
        '<strong>Reviews & Ratings:</strong> Look at their overall rating and read recent reviews from other customers.',
        '<strong>Profile Completeness:</strong> A well-maintained profile with photos of previous work shows professionalism.',
        '<strong>Verification Status:</strong> Verified providers have been checked by our team.',
        '<strong>Response Quality:</strong> A thoughtful, detailed quote message suggests a professional approach.',
        '<strong>Ask Questions:</strong> Use our messaging system to ask about experience, timeline, and guarantees.',
        '<strong>Get Written Quotes:</strong> Always get a detailed written quote before work begins.',
        '<strong>Check Insurance:</strong> For larger jobs, ask if they have public liability insurance.',
        '<strong>Trust Your Instincts:</strong> If something feels off, it\'s okay to wait for another quote.',
      ]
    });

    const htmlContent = buildEmail({
      header: {
        title: '🎉 Job Posted Successfully!',
        variant: 'homeowner'
      },
      greeting: userName,
      intro: "Great news! Your job has been posted and is now visible to qualified service providers in your area.",
      sections: [
        jobSummary,
        EmailSectionHeading('📋 What Happens Next'),
        nextSteps,
        dueDiligence,
      ],
      buttons: [
        { href: `${siteUrl}/user-dashboard`, text: 'View Your Dashboard' },
      ],
      footer: "You're receiving this email because you posted a job on Kluje.",
    });

    console.log(`Sending job posted notification to: ${userEmail}`);
    
    try {
      const emailResponse = await sendEmail(userEmail, subject, htmlContent);
      console.log("Email sent successfully:", emailResponse);

      await trackEmailNotification(
        supabase, userId, userEmail, 'job_posted', jobId, 'job_listing',
        subject, 'sent', emailResponse?.id
      );

      return new Response(
        JSON.stringify({ success: true, message: "Job posted notification sent successfully", emailId: emailResponse?.id }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } catch (emailError: any) {
      console.error("Failed to send email:", emailError);
      await trackEmailNotification(
        supabase, userId, userEmail, 'job_posted', jobId, 'job_listing',
        subject, 'error', undefined, emailError.message
      );
      throw emailError;
    }
  } catch (error: any) {
    console.error("Error in send-job-posted-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
