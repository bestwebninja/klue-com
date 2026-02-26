import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailInfoCard,
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

interface AnswerNotificationRequest {
  questionId: string;
  answerId: string;
  providerName: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionId, answerId, providerName }: AnswerNotificationRequest = await req.json();
    
    console.log("Received notification request:", { questionId, answerId, providerName });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://kluje.lovable.app";

    const { data: question, error: questionError } = await supabase
      .from("expert_questions")
      .select("title, content, user_id")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      throw new Error("Question not found");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", question.user_id)
      .single();

    if (profileError || !profile?.email) {
      throw new Error("User email not found");
    }

    const { data: answer, error: answerError } = await supabase
      .from("expert_answers")
      .select("content")
      .eq("id", answerId)
      .single();

    if (answerError || !answer) {
      throw new Error("Answer not found");
    }

    const questionUrl = `${siteUrl}/ask-expert/${questionId}`;
    const answerPreview = answer.content.substring(0, 300) + (answer.content.length > 300 ? "..." : "");

    const questionSection = `
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937;">Your Question:</h3>
        <p style="margin: 0; font-weight: 600; color: #374151;">${question.title}</p>
      </div>
    `;

    const answerSection = `
      <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
        <h3 style="margin: 0 0 8px 0; color: #059669;">Expert Answer:</h3>
        <p style="margin: 0; color: #374151;">${answerPreview}</p>
      </div>
    `;

    const htmlContent = buildEmail({
      header: { title: '💡 Your Question Has Been Answered!', variant: 'provider' },
      greeting: profile.full_name || 'there',
      intro: `Great news! <strong>${providerName}</strong> has answered your question.`,
      sections: [
        questionSection,
        answerSection,
      ],
      buttons: [
        { href: questionUrl, text: 'View Full Answer' },
      ],
      footer: "You received this email because you asked a question on Kluje.",
      closing: "You can also ask follow-up questions or thank the expert for their help.",
    });

    const subject = `New answer to your question: ${question.title}`;
    const emailResponse = await sendEmail(profile.email, subject, htmlContent);

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-answer-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
