import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
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

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-contact-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    console.log("Received contact form submission:", { name, email, subject });

    if (!name || !email || !subject || !message) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send notification email to admin
    const adminHtmlContent = buildEmail({
      header: { title: '📬 New Contact Form', subtitle: subject, variant: 'homeowner' },
      greeting: 'Team',
      intro: `You have received a new message from <strong>${name}</strong>.`,
      sections: [
        EmailInfoCard({
          title: 'Contact Details',
          items: [
            { label: 'Name', value: name },
            { label: 'Email', value: email, isLink: true },
          ],
        }),
        EmailMessageBox(message, 'Message'),
      ],
      buttons: [
        { href: `mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`, text: 'Reply to Message' },
      ],
      footer: "This message was sent via the Kluje contact form.",
      closing: `Reply directly to ${email} to respond.`,
    });

    const adminEmailResponse = await resend.emails.send({
      from: "Kluje Contact <hello@kluje.com>",
      to: ["hello@kluje.com"],
      subject: `New Contact Form: ${subject}`,
      html: adminHtmlContent,
      reply_to: email,
    });

    console.log("Admin notification email sent:", adminEmailResponse);

    // Send confirmation email to user
    const userHtmlContent = buildEmail({
      header: { title: '✅ Message Received!', variant: 'homeowner' },
      greeting: name,
      intro: `Thank you for reaching out! We have received your message and will get back to you as soon as possible.`,
      sections: [
        EmailInfoCard({
          title: 'Your Message',
          items: [
            { label: 'Subject', value: subject },
          ],
        }),
        EmailMessageBox(message),
      ],
      buttons: [
        { href: 'https://kluje.lovable.app', text: 'Visit Kluje' },
      ],
      footer: "This is an automated confirmation email. Please do not reply directly to this message.",
      closing: "Best regards,\nThe Kluje Team",
    });

    const userEmailResponse = await resend.emails.send({
      from: "Kluje <noreply@kluje.com>",
      to: [email],
      subject: "We received your message!",
      html: userHtmlContent,
    });

    console.log("User confirmation email sent:", userEmailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Emails sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
