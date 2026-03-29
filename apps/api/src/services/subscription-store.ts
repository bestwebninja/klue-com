import type Stripe from "stripe";

export type InternalPlanTier = "starter" | "growth";

export interface SubscriptionRecord {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  tenantId: string;
  advertiserId?: string;
  planTier: string;
  status: Stripe.Subscription.Status;
  billingInterval: "month" | "year";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  latestPaymentStatus?: "paid" | "payment_failed";
  updatedAt: string;
}

interface CheckoutSessionRecord {
  checkoutSessionId: string;
  tenantId: string;
  customerId: string;
  planTier: InternalPlanTier;
  status: "checkout_created" | "checkout_completed";
  stripeSubscriptionId?: string;
  updatedAt: string;
}

class BillingStore {
  private readonly subscriptionsByStripeId = new Map<string, SubscriptionRecord>();
  private readonly tenantToStripeSubscription = new Map<string, string>();
  private readonly checkoutBySessionId = new Map<string, CheckoutSessionRecord>();
  private readonly processedEventIds = new Set<string>();

  upsertCheckoutSession(
    record: Omit<CheckoutSessionRecord, "updatedAt"> & { updatedAt?: string }
  ): void {
    this.checkoutBySessionId.set(record.checkoutSessionId, {
      ...record,
      updatedAt: record.updatedAt ?? new Date().toISOString()
    });
  }

  markCheckoutComplete(checkoutSessionId: string, stripeSubscriptionId: string | null): void {
    const checkout = this.checkoutBySessionId.get(checkoutSessionId);
    if (!checkout) return;

    this.checkoutBySessionId.set(checkoutSessionId, {
      ...checkout,
      status: "checkout_completed",
      stripeSubscriptionId: stripeSubscriptionId ?? checkout.stripeSubscriptionId,
      updatedAt: new Date().toISOString()
    });
  }

  upsertSubscription(subscription: SubscriptionRecord): void {
    this.subscriptionsByStripeId.set(subscription.stripeSubscriptionId, subscription);
    this.tenantToStripeSubscription.set(subscription.tenantId, subscription.stripeSubscriptionId);
  }

  getByTenantId(tenantId: string): SubscriptionRecord | undefined {
    const subscriptionId = this.tenantToStripeSubscription.get(tenantId);
    if (!subscriptionId) return undefined;

    return this.subscriptionsByStripeId.get(subscriptionId);
  }

  markPaymentStatus(stripeSubscriptionId: string | null, paymentStatus: "paid" | "payment_failed"): void {
    if (!stripeSubscriptionId) return;
    const existing = this.subscriptionsByStripeId.get(stripeSubscriptionId);
    if (!existing) return;

    this.subscriptionsByStripeId.set(stripeSubscriptionId, {
      ...existing,
      latestPaymentStatus: paymentStatus,
      updatedAt: new Date().toISOString()
    });
  }

  hasProcessedEvent(eventId: string): boolean {
    return this.processedEventIds.has(eventId);
  }

  markEventProcessed(eventId: string): void {
    this.processedEventIds.add(eventId);
  }
}

export const billingStore = new BillingStore();

export function toSubscriptionRecord(subscription: Stripe.Subscription): SubscriptionRecord {
  const metadata = subscription.metadata ?? {};

  return {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId:
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    tenantId: metadata.tenantId ?? "unknown",
    advertiserId: metadata.advertiserId,
    planTier: metadata.planTier ?? "starter",
    status: subscription.status,
    billingInterval: subscription.items.data[0]?.plan.interval === "year" ? "year" : "month",
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: new Date().toISOString()
  };
}

export function resolveBillingStatus(status: Stripe.Subscription.Status): string {
  if (["trialing", "active"].includes(status)) return "active";
  if (["past_due", "unpaid", "incomplete", "incomplete_expired"].includes(status)) {
    return "past_due";
  }
  if (status === "canceled") return "cancelled";

  return "inactive";
}
