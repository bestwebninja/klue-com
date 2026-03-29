import { Router } from "express";
import { z } from "zod";
import { stripeClient } from "../services/stripe";
import { env } from "../config/env";

const router = Router();

const createCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string()
});

router.post("/customers", async (req, res) => {
  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const customer = await stripeClient.customers.create(parsed.data);
  return res.status(201).json(customer);
});

router.post("/checkout-session", async (req, res) => {
  const session = await stripeClient.checkout.sessions.create({
    mode: "subscription",
    success_url: "https://dashboard.kluje.com/billing/success",
    cancel_url: "https://dashboard.kluje.com/billing/cancel",
    line_items: [{
      price: req.body.priceId,
      quantity: 1
    }],
    customer: req.body.customerId
  });

  return res.status(201).json({ id: session.id, url: session.url });
});

router.post("/webhooks/stripe", expressRawBody, async (req, res) => {
  const signature = req.header("stripe-signature");
  if (!signature) return res.status(400).send("Missing stripe-signature header");

  try {
    const event = stripeClient.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);

    if (
      event.type === "invoice.paid" ||
      event.type === "invoice.payment_failed" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      // TODO: Project to subscriptions/invoices read model and emit domain event for n8n.
    }

    return res.status(200).json({ received: true, type: event.type });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

function expressRawBody(req: any, _res: any, next: any) {
  let data = "";
  req.setEncoding("utf8");
  req.on("data", (chunk: string) => (data += chunk));
  req.on("end", () => {
    req.body = data;
    next();
  });
}

export default router;
