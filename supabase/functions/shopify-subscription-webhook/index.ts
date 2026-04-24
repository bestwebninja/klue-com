import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Veteran SKUs map to billing_interval="annual" + is_veteran=true
const VARIANT_MAP: Record<
  string,
  { plan_tier: "starter" | "growth" | "pro"; billing_interval: "monthly" | "annual"; is_veteran: boolean }
> = {
  "44995551527120": { plan_tier: "starter", billing_interval: "monthly", is_veteran: false },
  "44995551625424": { plan_tier: "starter", billing_interval: "annual",  is_veteran: false },
  "44995551723728": { plan_tier: "starter", billing_interval: "annual",  is_veteran: true  },
  "44995551592656": { plan_tier: "pro",     billing_interval: "monthly", is_veteran: false },
  "44995551690960": { plan_tier: "pro",     billing_interval: "annual",  is_veteran: false },
  "44995551789264": { plan_tier: "pro",     billing_interval: "annual",  is_veteran: true  },
  "44995551559888": { plan_tier: "growth",  billing_interval: "monthly", is_veteran: false },
  "44995551658192": { plan_tier: "growth",  billing_interval: "annual",  is_veteran: false },
  "44995551756496": { plan_tier: "growth",  billing_interval: "annual",  is_veteran: true  },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(s: string) { return UUID_RE.test(s); }

async function verifyHmac(secret: string, rawBody: Uint8Array, header: string): Promise<boolean> {
  if (!header) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, rawBody);
  const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));
  if (computed.length !== header.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ header.charCodeAt(i);
  }
  return diff === 0;
}

function extractKlujeRef(order: Record<string, unknown>): string | null {
  const note = typeof order.note === "string" ? order.note : "";
  const noteMatch = note.match(/kluje_ref[=:]([0-9a-f-]{36})/i);
  if (noteMatch && isUuid(noteMatch[1])) return noteMatch[1];

  const attrs = Array.isArray(order.note_attributes) ? order.note_attributes : [];
  for (const a of attrs) {
    if (typeof a === "object" && a !== null && (a as Record<string, unknown>).name === "kluje_ref") {
      const v = String((a as Record<string, unknown>).value ?? "");
      if (isUuid(v)) return v;
    }
  }

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

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("SHOPIFY_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!secret || !supabaseUrl || !serviceKey) {
    return new Response("Server misconfiguration", { status: 500 });
  }

  const hmacHeader = req.headers.get("x-shopify-hmac-sha256") ?? "";
  const rawBody = new Uint8Array(await req.arrayBuffer());
  const valid = await verifyHmac(secret, rawBody, hmacHeader);
  if (!valid) return new Response("Unauthorized", { status: 401 });

  let order: Record<string, unknown>;
  try {
    order = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const klujeRef = extractKlujeRef(order);
  if (!klujeRef) return json({ ok: true, skipped: "no_kluje_ref" });

  const variantId = extractVariantId(order);
  if (!variantId) return json({ ok: false, error: "no_approved_variant" }, 422);

  const { plan_tier, billing_interval, is_veteran } = VARIANT_MAP[variantId];
  const orderId = String(order.id ?? "");
  const checkoutRef = String(order.checkout_id ?? order.checkout_token ?? order.cart_token ?? "");

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: sub, error: fetchErr } = await supabase
    .from("janitorial_subscriptions")
    .select("id, status, plan_tier, billing_interval, payment_path, shopify_order_ref, is_veteran")
    .eq("id", klujeRef)
    .maybeSingle();

  if (fetchErr) return json({ ok: false, error: fetchErr.message }, 500);
  if (!sub) return json({ ok: false, error: "subscription_not_found" }, 404);

  if (sub.status === "active" && sub.shopify_order_ref === orderId) {
    return json({ ok: true, skipped: "already_active" });
  }
  if (sub.status === "active" && sub.shopify_order_ref && sub.shopify_order_ref !== orderId) {
    return json({ ok: false, error: "conflict_different_order" }, 409);
  }
  if (sub.plan_tier !== plan_tier || sub.billing_interval !== billing_interval) {
    return json({ ok: false, error: "plan_cycle_mismatch" }, 409);
  }
  if (sub.payment_path !== "shopify_online") {
    return json({ ok: false, error: "wrong_payment_path" }, 409);
  }

  const updatePayload: Record<string, unknown> = {
    status: "active",
    shopify_order_ref: orderId,
    shopify_checkout_ref: checkoutRef || null,
  };
  if (is_veteran && !sub.is_veteran) {
    updatePayload.is_veteran = true;
    updatePayload.veteran_attested_at = new Date().toISOString();
  }

  const { error: updateErr } = await supabase
    .from("janitorial_subscriptions")
    .update(updatePayload)
    .eq("id", klujeRef);

  if (updateErr) return json({ ok: false, error: updateErr.message }, 500);

  return json({ ok: true, activated: klujeRef, plan_tier, billing_interval });
});
