import express, { Router } from "express";
import type Stripe from "stripe";
import { z } from "zod";
import { env } from "../config/env";
import {
  billingStore,
  resolveBillingStatus,
  toSubscriptionRecord
} from "../services/subscription-store";
import { stripeClient } from "../services/stripe";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.header("stripe-signature");
  if (!signature) return res.status(400).send("Missing stripe-signature header");

  const payload = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body ?? "", "utf8");

  let event: Stripe.Event;

  try {
    event = stripeClient.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }

  if (billingStore.hasProcessedEvent(event.id)) {
    return res.status(200).json({ received: true, duplicate: true, eventId: event.id });
  }

  billingStore.markEventProcessed(event.id);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      billingStore.markCheckoutComplete(session.id, session.subscription as string | null);
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      billingStore.upsertSubscription(toSubscriptionRecord(subscription));
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      billingStore.markPaymentStatus(invoice.subscription as string | null, "payment_failed");
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      billingStore.markPaymentStatus(invoice.subscription as string | null, "paid");
      break;
    }
    default:
      break;
  }

  return res.status(200).json({ received: true, type: event.type, eventId: event.id });
});

router.use(requireAuth);

const createCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1)
});

const checkoutSchema = z.object({
  tenantId: z.string().min(1),
  customerId: z.string().min(1),
  planTier: z.enum(["starter", "growth"]),
  advertiserId: z.string().min(1).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

router.post("/customers", async (req, res) => {
  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const customer = await stripeClient.customers.create(parsed.data);
  return res.status(201).json(customer);
});

router.post("/checkout-session", async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const priceId =
    parsed.data.planTier === "starter" ? env.stripePriceIdStarter : env.stripePriceIdGrowth;
  if (!priceId) {
    return res.status(500).json({
      error: `Missing Stripe price ID for ${parsed.data.planTier} tier. Check API env configuration.`
    });
  }

  const session = await stripeClient.checkout.sessions.create({
    mode: "subscription",
    success_url: parsed.data.successUrl ?? env.stripeCheckoutSuccessUrl,
    cancel_url: parsed.data.cancelUrl ?? env.stripeCheckoutCancelUrl,
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    customer: parsed.data.customerId,
    metadata: {
      tenantId: parsed.data.tenantId,
      advertiserId: parsed.data.advertiserId ?? "",
      planTier: parsed.data.planTier
    },
    subscription_data: {
      metadata: {
        tenantId: parsed.data.tenantId,
        advertiserId: parsed.data.advertiserId ?? "",
        planTier: parsed.data.planTier
      }
    }
  });

  billingStore.upsertCheckoutSession({
    checkoutSessionId: session.id,
    tenantId: parsed.data.tenantId,
    customerId: parsed.data.customerId,
    planTier: parsed.data.planTier,
    status: "checkout_created"
  });

  return res.status(201).json({ id: session.id, url: session.url, priceId });
});

router.get("/subscriptions/:tenantId", (req, res) => {
  const subscription = billingStore.getByTenantId(req.params.tenantId);
  if (!subscription) {
    return res.status(404).json({
      error: "Subscription not found",
      tenantId: req.params.tenantId,
      billingStatus: "free"
    });
  }

  return res.status(200).json({
    ...subscription,
    billingStatus: resolveBillingStatus(subscription.status)
  });
});

export default router;
