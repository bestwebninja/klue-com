import "dotenv/config";

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET ?? "replace-with-strong-secret",
  jwtIssuer: process.env.JWT_ISSUER ?? "kluje-api",
  jwtAudience: process.env.JWT_AUDIENCE ?? "kluje-clients",
  accessTokenTtl: process.env.JWT_ACCESS_TTL ?? "15m",
  refreshTokenTtl: process.env.JWT_REFRESH_TTL ?? "7d",
  rateLimitWindowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMax: toNumber(process.env.RATE_LIMIT_MAX, 200),
  authRateLimitMax: toNumber(process.env.AUTH_RATE_LIMIT_MAX, 20),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceIdStarter: process.env.STRIPE_PRICE_ID_STARTER ?? "price_starter_placeholder",
  stripePriceIdGrowth: process.env.STRIPE_PRICE_ID_GROWTH ?? "price_growth_placeholder",
  stripePriceIdEnterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE ?? "price_enterprise_placeholder",
  stripeProductIdStarter: process.env.STRIPE_PRODUCT_ID_STARTER ?? "prod_starter_placeholder",
  stripeProductIdGrowth: process.env.STRIPE_PRODUCT_ID_GROWTH ?? "prod_growth_placeholder",
  stripeCheckoutSuccessUrl:
    process.env.STRIPE_CHECKOUT_SUCCESS_URL ?? "https://dashboard.kluje.com/billing/success",
  stripeCheckoutCancelUrl:
    process.env.STRIPE_CHECKOUT_CANCEL_URL ?? "https://dashboard.kluje.com/billing/cancel"
};
