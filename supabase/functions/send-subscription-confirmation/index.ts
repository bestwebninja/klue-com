import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  growth: "Growth",
};

const CYCLE_LABELS: Record<string, string> = {
  monthly: "Monthly",
  annual: "Annual (10% savings)",
  annual_veteran: "Annual Veteran (3 months off)",
};

const PATH_LABELS: Record<string, string> = {
  ach_wire: "ACH / Wire Transfer",
  shopify_online: "Online Payment via www.kluje.app (Shopify)",
};

const STATUS_COPY: Record<string, { subject: string; headline: string; body: string; nextSteps: string }> = {
  awaiting_wire: {
    subject: "Your CleanScope subscription is pending wire confirmation",
    headline: "Subscription Created — Awaiting Wire Payment",
    body: "Your CleanScope AI subscription record has been created in Kluje. Because you selected ACH / Wire as your payment method, your plan will activate once our finance team confirms receipt of your payment.",
    nextSteps: "Please send your wire payment using the details you were provided at checkout. Reply to this email or contact marcus@kluje.com if you need wire instructions.",
  },
  pending: {
    subject: "Your CleanScope checkout has been initiated",
    headline: "Checkout Started — Payment Not Yet Confirmed",
    body: "Your CleanScope AI subscription record has been created in Kluje, and you were redirected to our secure hosted checkout on www.kluje.app (powered by Shopify) to complete payment. Your subscription will activate once Shopify confirms payment.",
    nextSteps: "If you did not complete checkout, please return to your Kluje dashboard and try again. Payment is processed entirely by Shopify — Kluje does not store your card details.",
  },
  active: {
    subject: "Your CleanScope subscription is now active",
    headline: "Subscription Active",
    body: "Your CleanScope AI subscription is now active in Kluje. You have full access to your plan features.",
    nextSteps: "Log in to your Kluje dashboard to get started.",
  },
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscriptionId, userId } = await req.json();

    if (!subscriptionId || !userId) {
      return new Response(JSON.stringify({ error: "subscriptionId and userId are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Use service-role client to read record and user email (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: sub, error: subError } = await supabase
      .from("janitorial_subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .single();

    if (subError || !sub) {
      return new Response(JSON.stringify({ error: "Subscription record not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    const userEmail = userData?.user?.email;

    if (userError || !userEmail) {
      return new Response(JSON.stringify({ error: "User email not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const copy = STATUS_COPY[sub.status] ?? STATUS_COPY["pending"];
    const planLabel = PLAN_LABELS[sub.plan] ?? sub.plan;
    const cycleLabel = CYCLE_LABELS[sub.billing_cycle] ?? sub.billing_cycle;
    const pathLabel = PATH_LABELS[sub.payment_path] ?? sub.payment_path;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
    <div style="background:#10b981;padding:32px 40px;">
      <p style="margin:0;color:#fff;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">CleanScope AI — Kluje</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:24px;font-weight:700;">${copy.headline}</h1>
    </div>
    <div style="padding:32px 40px;">
      <p style="margin:0 0 20px;font-size:16px;color:#374151;line-height:1.6;">${copy.body}</p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Subscription Details</p>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;width:140px;">Plan</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;">${planLabel}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Billing Cycle</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;">${cycleLabel}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Payment Method</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;">${pathLabel}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Status</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#10b981;">${sub.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</td></tr>
          ${sub.shopify_checkout_ref ? `<tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Shopify Ref</td><td style="padding:6px 0;font-size:14px;color:#111827;font-family:monospace;">${sub.shopify_checkout_ref}</td></tr>` : ""}
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Record ID</td><td style="padding:6px 0;font-size:11px;color:#9ca3af;font-family:monospace;">${sub.id}</td></tr>
        </table>
      </div>

      <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;"><strong>Next steps:</strong> ${copy.nextSteps}</p>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px;margin:0 0 24px;">
        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
          <strong>Important:</strong> This email confirms your subscription record was created in Kluje.
          ${sub.status === "pending" ? " Payment has <u>not yet been confirmed</u> — it will be confirmed once Shopify processes your checkout." : ""}
          ${sub.status === "awaiting_wire" ? " Your plan will remain inactive until wire payment is confirmed by our finance team." : ""}
        </p>
      </div>

      <a href="https://kluje.com/janitorial-dashboard" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;padding:12px 24px;font-size:15px;font-weight:600;">View My Dashboard</a>
    </div>
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;">
      <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;">
        Divitiae Terrae LLC · 1309 Coffeen Avenue STE 1200, Sheridan WY 82801<br>
        Billing questions: <a href="mailto:marcus@kluje.com" style="color:#10b981;">marcus@kluje.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: "CleanScope AI <hello@kluje.com>",
      to: [userEmail],
      subject: copy.subject,
      html,
    });

    // Also notify internal admin
    await resend.emails.send({
      from: "CleanScope AI <hello@kluje.com>",
      to: ["marcus@kluje.com"],
      subject: `[Admin] New subscription: ${planLabel} / ${cycleLabel} / ${pathLabel} — ${userEmail}`,
      html: `<p>New janitorial subscription record created.</p>
<ul>
  <li>User: ${userEmail}</li>
  <li>Plan: ${planLabel}</li>
  <li>Cycle: ${cycleLabel}</li>
  <li>Payment: ${pathLabel}</li>
  <li>Status: ${sub.status}</li>
  <li>Record ID: ${sub.id}</li>
  <li>Created: ${sub.created_at}</li>
</ul>`,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("send-subscription-confirmation error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
