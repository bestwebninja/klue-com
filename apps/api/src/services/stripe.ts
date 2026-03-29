import Stripe from "stripe";
import { env } from "../config/env";

export const stripeClient = new Stripe(env.stripeSecretKey, {
  apiVersion: "2025-02-24.acacia"
});
