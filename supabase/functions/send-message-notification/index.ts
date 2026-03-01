import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailMessageBox,
  EmailInfoCard,
} from "../_shared/email-templates/components.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationRequest {
  messageId: string;
  quoteRequestId: string;
  senderId: string;
  recipientId: string;
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageId, quoteRequestId, senderId, recipientId, content }: MessageNotificationRequest = await req.json();
    
    console.log(`Sending message notification for message ${messageId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://kluje.lovable.app";

    // Fetch sender profile
    const { data: sender, error: senderError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", senderId)
      .maybeSingle();

    if (senderError) {
      console.error("Error fetching sender:", senderError);
    }

    // Fetch recipient profile
    const { data: recipient, error: recipientError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", recipientId)
      .maybeSingle();

    if (recipientError) {
      console.error("Error fetching recipient:", recipientError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch recipient" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!recipient?.email) {
      console.log("No email found for recipient:", recipientId);
      return new Response(
        JSON.stringify({ message: "No email found for recipient" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check recipient's notification preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_enabled, new_messages")
      .eq("user_id", recipientId)
      .maybeSingle();

    if (prefs && (!prefs.email_enabled || !prefs.new_messages)) {
      console.log("Message notifications disabled for recipient:", recipientId);
      return new Response(
        JSON.stringify({ message: "Message notifications disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the quote request to get the job details
    const { data: quoteRequest, error: quoteError } = await supabase
      .from("quote_requests")
      .select("job_listing_id")
      .eq("id", quoteRequestId)
      .maybeSingle();

    let jobTitle = "your job";
    if (!quoteError && quoteRequest?.job_listing_id) {
      const { data: job } = await supabase
        .from("job_listings")
        .select("title")
        .eq("id", quoteRequest.job_listing_id)
        .maybeSingle();
      
      if (job?.title) {
        jobTitle = job.title;
      }
    }

    const senderName = sender?.full_name || "Someone";
    const recipientName = recipient.full_name || "there";

    // Truncate message preview
    const messagePreview = content.length > 300 ? content.substring(0, 300) + "..." : content;

    const htmlContent = buildEmail({
      header: { title: '💬 New Message', subtitle: `Regarding: ${jobTitle}`, variant: 'homeowner' },
      greeting: recipientName,
      intro: `<strong>${senderName}</strong> has sent you a message about <strong>"${jobTitle}"</strong>.`,
      sections: [
        EmailMessageBox(messagePreview, 'Message Preview'),
        `<p style="margin: 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">Log in to your dashboard to view the full message and reply.</p>`,
      ],
      buttons: [
        { href: `${siteUrl}/dashboard?tab=messages`, text: 'View Messages' },
      ],
      footer: "You received this email because someone sent you a message on Kluje.",
      closing: "Don't keep them waiting – reply soon!",
    });

    const emailResponse = await resend.emails.send({
      from: "Kluje <notifications@kluje.com>",
      to: [recipient.email],
      subject: `New message from ${senderName} about "${jobTitle}"`,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending message notification:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
