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

interface HomeownerWelcomeRequest {
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
    const { userId }: HomeownerWelcomeRequest = await req.json();

    if (!userId) {
      throw new Error("Missing userId");
    }

    console.log(`Processing homeowner welcome notification for user: ${userId}`);

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
    const siteUrl = Deno.env.get('SITE_URL') || 'https://kluje.com';
    const subject = `Welcome to Kluje! 🏠 Let's find you the perfect tradesperson`;

    const howItWorksSteps = EmailSteps({
      steps: [
        { title: 'Post your job', description: 'Describe what you need done, add photos if helpful, and set your budget range.' },
        { title: 'Receive quotes', description: "Qualified service providers will send you quote requests. You'll be notified by email." },
        { title: 'Compare and choose', description: 'Review profiles, ratings, and reviews to find the perfect match for your project.' },
        { title: 'Hire and review', description: 'Accept a quote, complete your project, and leave a review to help others.' },
      ],
      color: 'homeowner'
    });

    const quoteTips = EmailTipBox({
      title: '💡 Tips for Getting the Best Quotes',
      variant: 'info',
      items: [
        '<strong>Be specific:</strong> The more detail you provide about the job, the more accurate quotes you\'ll receive.',
        '<strong>Add photos:</strong> Pictures help providers understand the scope and give better estimates.',
        '<strong>Set a realistic budget:</strong> Research typical costs so providers know you\'re serious.',
        '<strong>Mention timing:</strong> Let providers know if the job is urgent or flexible.',
        '<strong>Include access details:</strong> Mention any access restrictions or parking availability.',
        '<strong>Respond promptly:</strong> Quick responses help you secure the best providers.',
      ]
    });

    const choosingProviderTips = EmailTipBox({
      title: '🔍 Choosing the Right Provider',
      variant: 'warning',
      intro: 'Before accepting a quote, we recommend:',
      items: [
        '<strong>Check reviews:</strong> Read what other homeowners say about their work.',
        '<strong>Look for verified badges:</strong> Verified providers have been checked by our team.',
        '<strong>Review their profile:</strong> A complete profile shows professionalism.',
        '<strong>Ask questions:</strong> Use our messaging to clarify any concerns before hiring.',
        '<strong>Get written quotes:</strong> Always get details in writing before work starts.',
      ]
    });

    const exploreFeatures = EmailTipBox({
      title: '✨ Explore Kluje Features',
      variant: 'success',
      items: [
        '<strong>Browse Providers:</strong> Search for service providers in your area without posting a job.',
        '<strong>Ask an Expert:</strong> Get free advice from qualified professionals.',
        '<strong>Secure Messaging:</strong> Communicate directly with providers through our platform.',
        '<strong>Track Everything:</strong> Manage all your jobs and quotes from your dashboard.',
      ]
    });

    const htmlContent = buildEmail({
      header: {
        title: '🏠 Welcome to Kluje!',
        subtitle: 'Your trusted platform for finding quality service providers',
        variant: 'homeowner'
      },
      greeting: userName,
      intro: "Welcome to Kluje! We're thrilled to have you. Whether you need a plumber, electrician, builder, or any other tradesperson, we're here to connect you with verified professionals in your area.",
      sections: [
        EmailSectionHeading('📋 How It Works'),
        howItWorksSteps,
        quoteTips,
        choosingProviderTips,
        exploreFeatures,
      ],
      buttons: [
        { href: `${siteUrl}/post-job`, text: 'Post Your First Job' },
        { href: `${siteUrl}/providers`, text: 'Browse Service Providers', variant: 'outline' },
      ],
      footer: "You're receiving this email because you signed up for Kluje.",
    });

    console.log(`Sending homeowner welcome notification to: ${userEmail}`);
    
    try {
      const emailResponse = await sendEmail(userEmail, subject, htmlContent);
      console.log("Email sent successfully:", emailResponse);

      await trackEmailNotification(
        supabase, userId, userEmail, 'homeowner_welcome', userId, 'profile',
        subject, 'sent', emailResponse?.id
      );

      return new Response(
        JSON.stringify({ success: true, message: "Homeowner welcome notification sent successfully", emailId: emailResponse?.id }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } catch (emailError: any) {
      console.error("Failed to send email:", emailError);
      await trackEmailNotification(
        supabase, userId, userEmail, 'homeowner_welcome', userId, 'profile',
        subject, 'error', undefined, emailError.message
      );
      throw emailError;
    }
  } catch (error: any) {
    console.error("Error in send-homeowner-welcome-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
