import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailSteps,
  EmailTipBox,
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

interface ProviderWelcomeRequest {
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
    const { userId }: ProviderWelcomeRequest = await req.json();

    if (!userId) {
      throw new Error("Missing userId");
    }

    console.log(`Processing provider welcome notification for user: ${userId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const subject = `Welcome to Kluje! 🎉 Here's how to get hired`;

    const gettingStartedSteps = EmailSteps({
      steps: [
        { title: 'Complete your profile', description: 'Add a professional photo, write a compelling bio, and list your qualifications.' },
        { title: 'Browse available jobs', description: 'Check the jobs page to see homeowner requests matching your services and location.' },
        { title: 'Send quote requests', description: 'Express interest in jobs you can complete well. Quality over quantity wins!' },
        { title: 'Build your reputation', description: 'Complete jobs successfully and collect 5-star reviews to stand out from the crowd.' },
      ],
      color: 'provider'
    });

    const hiringTips = EmailTipBox({
      title: '💡 Top Tips for Getting Hired',
      variant: 'info',
      items: [
        '<strong>Respond quickly:</strong> Homeowners often choose the first professional who responds. Check your notifications regularly!',
        '<strong>Write personalised messages:</strong> Reference specific details from the job description to show you\'ve read it carefully.',
        '<strong>Be transparent about pricing:</strong> Give clear estimates upfront. Hidden costs lose trust.',
        '<strong>Showcase your work:</strong> Add photos of completed projects to your profile. Visual proof builds confidence.',
        '<strong>Get verified:</strong> Complete our verification process to display the verified badge and rank higher in searches.',
        '<strong>Ask for reviews:</strong> After completing a job, politely ask satisfied customers to leave a review.',
        '<strong>Be professional:</strong> Arrive on time, communicate clearly, and follow up after completion.',
        '<strong>Answer expert questions:</strong> Share your expertise in our "Ask an Expert" section to build credibility.',
      ]
    });

    const profileChecklist = EmailTipBox({
      title: '✅ Profile Checklist',
      variant: 'success',
      intro: 'Complete profiles get 3x more quote requests. Make sure you have:',
      items: [
        'Professional profile photo',
        'Detailed bio describing your experience and services',
        'All relevant service categories selected',
        'Service area locations set correctly',
        'Photos of previous work (coming soon)',
        'Valid contact information',
      ]
    });

    const htmlContent = buildEmail({
      header: {
        title: '🎉 Welcome to Kluje!',
        subtitle: "You're now part of our service provider community",
        variant: 'provider'
      },
      greeting: userName,
      intro: "Congratulations on joining Kluje! You're now connected to homeowners looking for quality service providers like you. Here's how to make the most of your account and start winning jobs.",
      sections: [
        EmailSectionHeading('🚀 Getting Started'),
        gettingStartedSteps,
        hiringTips,
        profileChecklist,
      ],
      buttons: [
        { href: `${siteUrl}/dashboard`, text: 'Go to Your Dashboard' },
        { href: `${siteUrl}/jobs`, text: 'Browse Available Jobs', variant: 'outline' },
      ],
      footer: "You're receiving this email because you registered as a service provider on Kluje.",
    });

    console.log(`Sending provider welcome notification to: ${userEmail}`);
    
    try {
      const emailResponse = await sendEmail(userEmail, subject, htmlContent);
      console.log("Email sent successfully:", emailResponse);

      await trackEmailNotification(
        supabase, userId, userEmail, 'provider_welcome', userId, 'profile',
        subject, 'sent', emailResponse?.id
      );

      return new Response(
        JSON.stringify({ success: true, message: "Provider welcome notification sent successfully", emailId: emailResponse?.id }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } catch (emailError: any) {
      console.error("Failed to send email:", emailError);
      await trackEmailNotification(
        supabase, userId, userEmail, 'provider_welcome', userId, 'profile',
        subject, 'error', undefined, emailError.message
      );
      throw emailError;
    }
  } catch (error: any) {
    console.error("Error in send-provider-welcome-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
