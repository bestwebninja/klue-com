import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailInfoCard,
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

interface QuoteAcceptedRequest {
  quoteId: string;
  providerId: string;
  jobId: string;
  jobPosterId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quoteId, providerId, jobId, jobPosterId }: QuoteAcceptedRequest = await req.json();
    
    console.log(`Sending quote accepted notification for quote ${quoteId} to provider ${providerId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://kluje.lovable.app";

    const { data: provider, error: providerError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", providerId)
      .maybeSingle();

    if (providerError || !provider?.email) {
      return new Response(
        JSON.stringify({ message: "No email found for provider" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: jobPoster } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", jobPosterId)
      .maybeSingle();

    const { data: job } = await supabase
      .from("job_listings")
      .select("title, description, location")
      .eq("id", jobId)
      .maybeSingle();

    const jobTitle = job?.title || "a job";
    const providerName = provider.full_name || "there";
    const posterName = jobPoster?.full_name || "The customer";
    const posterEmail = jobPoster?.email || null;
    const posterPhone = jobPoster?.phone || null;

    const contactItems = [];
    if (posterEmail) contactItems.push({ label: 'Email', value: posterEmail, isLink: true });
    if (posterPhone) contactItems.push({ label: 'Phone', value: posterPhone });

    const htmlContent = buildEmail({
      header: { title: '🎉 Your quote has been accepted!', variant: 'provider' },
      greeting: providerName,
      intro: `Great news! <strong>${posterName}</strong> has accepted your quote.`,
      sections: [
        EmailJobSummary({ 
          title: jobTitle, 
          category: '', 
          location: job?.location || undefined, 
          budget: '' 
        }),
        contactItems.length > 0 
          ? EmailInfoCard({ title: 'Customer Contact Details', items: contactItems, variant: 'success' })
          : '',
        `<p style="margin: 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">You can now contact the customer directly to discuss the job details and arrange the work. You can also message them through your dashboard.</p>`,
      ].filter(Boolean),
      buttons: [
        { href: `${siteUrl}/dashboard`, text: 'Go to Dashboard' },
      ],
      footer: "You received this email because a customer accepted your quote on Kluje.",
      closing: "Best of luck with the job!",
    });

    const subject = `Great news! Your quote was accepted for "${jobTitle}"`;
    const emailResponse = await sendEmail(provider.email, subject, htmlContent);

    console.log("Quote accepted notification sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending quote accepted notification:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
