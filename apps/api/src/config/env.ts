import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceIdStarter: process.env.STRIPE_PRICE_ID_STARTER ?? "price_starter_placeholder",
  stripePriceIdGrowth: process.env.STRIPE_PRICE_ID_GROWTH ?? "price_growth_placeholder",
  stripeProductIdStarter: process.env.STRIPE_PRODUCT_ID_STARTER ?? "prod_starter_placeholder",
  stripeProductIdGrowth: process.env.STRIPE_PRODUCT_ID_GROWTH ?? "prod_growth_placeholder",
  stripeCheckoutSuccessUrl:
    process.env.STRIPE_CHECKOUT_SUCCESS_URL ?? "https://dashboard.kluje.com/billing/success",
  stripeCheckoutCancelUrl:
    process.env.STRIPE_CHECKOUT_CANCEL_URL ?? "https://dashboard.kluje.com/billing/cancel",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret"
};
