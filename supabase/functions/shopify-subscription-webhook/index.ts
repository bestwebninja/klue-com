import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VARIANT_MAP: Record<string, { plan: string; billing_cycle: string }> = {
  "44995551527120": { plan: "starter",      billing_cycle: "monthly"        },
  "44995551625424": { plan: "starter",      billing_cycle: "annual"         },
  "44995551723728": { plan: "starter",      billing_cycle: "annual_veteran" },
  "44995551592656": { plan: "professional", billing_cycle: "monthly"        },
  "44995551690960": { plan: "professional", billing_cycle: "annual"         },
  "44995551789264": { plan: "professional", billing_cycle: "annual_veteran" },
  "44995551559888": { plan: "growth",       billing_cycle: "monthly"        },
  "44995551658192": { plan: "growth",       billing_cycle: "annual"         },
  "44995551756496": { plan: "growth",       billing_cycle: "annual_veteran" },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(s: string) {
  return UUID_RE.test(s);
}

async function verifyHmac(secret: string, rawBody: Uint8Array, header: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, rawBody);
  const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));
  // Timing-safe compare via fixed-length XOR
  if (computed.length !== header.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ header.charCodeAt(i);
  }
  return diff === 0;
}

function extractKlujeRef(order: Record<string, unknown>): string | null {
  // 1. order.note — format "kluje_ref:UUID"
  const note = typeof order.note === "string" ? order.note : "";
  const noteMatch = note.match(/kluje_ref[=:]([0-9a-f-]{36})/i);
  if (noteMatch) return noteMatch[1];

  // 2. note_attributes array — [{ name, value }]
  const attrs = Array.isArray(order.note_attributes) ? order.note_attributes : [];
  for (const a of attrs) {
    if (
      typeof a === "object" && a !== null &&
      (a as Record<string, unknown>).name === "kluje_ref"
    ) {
      const v = String((a as Record<string, unknown>).value ?? "");
      if (isUuid(v)) return v;
    }
  }

  // 3. Top-level kluje_ref field
  if (typeof order.kluje_ref === "string" && isUuid(order.kluje_ref)) {
    return order.kluje_ref;
  }

  return null;
}

function extractVariantId(order: Record<string, unknown>): string | null {
  const items = Array.isArray(order.line_items) ? order.line_items : [];
  for (const item of items) {
    if (typeof item === "object" && item !== null) {
      const vid = String((item as Record<string, unknown>).variant_id ?? "");
      if (vid && VARIANT_MAP[vid]) return vid;
    }
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = Deno.env.get("SHOPIFY_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!secret || !supabaseUrl || !serviceKey) {
    return new Response("Server misconfiguration", { status: 500 });
  }

  const hmacHeader = req.headers.get("x-shopify-hmac-sha256") ?? "";
  const rawBody = new Uint8Array(await req.arrayBuffer());

  const valid = await verifyHmac(secret, rawBody, hmacHeader);
  if (!valid) {
    return new Response("Unauthorized", { status: 401 });
  }

  let order: Record<string, unknown>;
  try {
    order = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const klujeRef = extractKlujeRef(order);
  if (!klujeRef || !isUuid(klujeRef)) {
    // No kluje_ref — not a CleanScope AI order, ignore gracefully
    return new Response(JSON.stringify({ ok: true, skipped: "no_kluje_ref" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  const variantId = extractVariantId(order);
  if (!variantId) {
    return new Response(
      JSON.stringify({ ok: false, error: "no_approved_variant" }),
      { status: 422, headers: { "content-type": "application/json" } },
    );
  }

  const { plan, billing_cycle } = VARIANT_MAP[variantId];
  const orderId = String(order.id ?? "");
  const checkoutRef = String(
    order.checkout_id ?? order.checkout_token ?? order.cart_token ?? "",
  );

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: sub, error: fetchErr } = await supabase
    .from("janitorial_subscriptions")
    .select("id, status, plan, billing_cycle, payment_path, shopify_order_ref")
    .eq("id", klujeRef)
    .maybeSingle();

  if (fetchErr) {
    return new Response(JSON.stringify({ ok: false, error: fetchErr.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  if (!sub) {
    return new Response(JSON.stringify({ ok: false, error: "subscription_not_found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  // Duplicate webhook — same order already activated
  if (sub.status === "active" && sub.shopify_order_ref === orderId) {
    return new Response(JSON.stringify({ ok: true, skipped: "already_active" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  // Already active with a DIFFERENT order — conflict
  if (sub.status === "active" && sub.shopify_order_ref !== orderId) {
    return new Response(JSON.stringify({ ok: false, error: "conflict_different_order" }), {
      status: 409,
      headers: { "content-type": "application/json" },
    });
  }

  // Plan or cycle mismatch
  if (sub.plan !== plan || sub.billing_cycle !== billing_cycle) {
    return new Response(
      JSON.stringify({ ok: false, error: "plan_cycle_mismatch", expected: { plan, billing_cycle }, found: { plan: sub.plan, billing_cycle: sub.billing_cycle } }),
      { status: 409, headers: { "content-type": "application/json" } },
    );
  }

  // Wrong payment path — should be shopify_online
  if (sub.payment_path !== "shopify_online") {
    return new Response(
      JSON.stringify({ ok: false, error: "wrong_payment_path", path: sub.payment_path }),
      { status: 409, headers: { "content-type": "application/json" } },
    );
  }

  // Activate
  const { error: updateErr } = await supabase
    .from("janitorial_subscriptions")
    .update({
      status: "active",
      shopify_order_ref: orderId,
      shopify_checkout_ref: checkoutRef || null,
    })
    .eq("id", klujeRef);

  if (updateErr) {
    return new Response(JSON.stringify({ ok: false, error: updateErr.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, activated: klujeRef, plan, billing_cycle }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});
