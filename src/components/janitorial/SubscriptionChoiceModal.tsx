import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type PlanKey = 'starter' | 'professional' | 'growth';
export type BillingCycle = 'monthly' | 'annual' | 'annual_veteran';

const PLAN_LABELS: Record<PlanKey, string> = {
  starter: 'Starter',
  professional: 'Professional',
  growth: 'Growth',
};

const BILLING_LABELS: Record<BillingCycle, string> = {
  monthly: 'Monthly',
  annual: 'Annual',
  annual_veteran: 'Annual Veteran',
};

// Shopify product handles on www.kluje.app keyed by plan + billing cycle.
// Update handles once the Shopify store products are created.
const SHOPIFY_HANDLES: Record<string, string> = {
  'starter-monthly':         'cleanscope-starter-monthly',
  'starter-annual':          'cleanscope-starter-annual',
  'starter-annual_veteran':  'cleanscope-starter-annual-veteran',
  'professional-monthly':    'cleanscope-professional-monthly',
  'professional-annual':     'cleanscope-professional-annual',
  'professional-annual_veteran': 'cleanscope-professional-annual-veteran',
  'growth-monthly':          'cleanscope-growth-monthly',
  'growth-annual':           'cleanscope-growth-annual',
  'growth-annual_veteran':   'cleanscope-growth-annual-veteran',
};

function buildShopifyUrl(plan: PlanKey, cycle: BillingCycle, klujePendingId: string): string {
  const handle = SHOPIFY_HANDLES[`${plan}-${cycle}`] ?? 'cleanscope-starter-monthly';
  // kluje_ref lets the Shopify checkout note reference the pending Kluje record.
  const note = encodeURIComponent(`kluje_ref:${klujePendingId}`);
  return `https://www.kluje.app/products/${handle}?note=${note}`;
}

interface SubscriptionChoiceModalProps {
  open: boolean;
  plan: PlanKey | null;
  billingCycle: BillingCycle;
  onClose: () => void;
  onSuccess: (result: { paymentPath: 'ach_wire' | 'shopify_online'; recordId: string }) => void;
}

export function SubscriptionChoiceModal({
  open,
  plan,
  billingCycle,
  onClose,
  onSuccess,
}: SubscriptionChoiceModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!plan) return null;

  const planLabel = PLAN_LABELS[plan];
  const cycleLabel = BILLING_LABELS[billingCycle];

  async function createRecord(paymentPath: 'ach_wire' | 'shopify_online') {
    if (!user) { setError('You must be logged in to subscribe.'); return null; }
    setError(null);
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('janitorial_subscriptions')
        .insert({
          user_id: user.id,
          plan,
          billing_cycle: billingCycle,
          payment_path: paymentPath,
          status: paymentPath === 'ach_wire' ? 'awaiting_wire' : 'pending',
        })
        .select('id')
        .single();

      if (dbError) throw new Error(dbError.message);
      return data.id as string;
    } catch (err) {
      setError((err as Error).message ?? 'Something went wrong. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleAch() {
    const id = await createRecord('ach_wire');
    if (!id) return;

    // Trigger confirmation email via edge function (fire-and-forget)
    void supabase.functions.invoke('send-subscription-confirmation', {
      body: { subscriptionId: id, userId: user!.id },
    });

    onSuccess({ paymentPath: 'ach_wire', recordId: id });
    onClose();
  }

  async function handleShopify() {
    const id = await createRecord('shopify_online');
    if (!id) return;

    // Trigger confirmation email (fire-and-forget — purchase is only initiated)
    void supabase.functions.invoke('send-subscription-confirmation', {
      body: { subscriptionId: id, userId: user!.id },
    });

    const url = buildShopifyUrl(plan, billingCycle, id);
    window.open(url, '_blank', 'noopener,noreferrer');

    onSuccess({ paymentPath: 'shopify_online', recordId: id });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose Payment Method</DialogTitle>
        </DialogHeader>

        <div className="rounded-2xl border border-border/60 bg-muted/30 px-5 py-4 text-sm space-y-1">
          <p className="font-semibold text-base">{planLabel} Plan</p>
          <p className="text-muted-foreground">{cycleLabel} billing</p>
          <p className="text-xs text-muted-foreground mt-1">
            You are logged in to Kluje as {user?.email ?? 'your account'}. Your subscription record will be created instantly.
          </p>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <div className="grid gap-4 mt-1">
          {/* Option A — ACH / Wire */}
          <button
            type="button"
            disabled={loading}
            onClick={handleAch}
            className="group rounded-2xl border-2 border-border hover:border-primary/60 bg-background p-5 text-left transition-all disabled:opacity-50"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-base">ACH / Wire Transfer</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Send payment via ACH or bank wire. Your subscription record is created immediately as <strong>Awaiting Wire</strong>. Features activate after our finance team confirms receipt — typically within 1 business day.
                </p>
              </div>
              <Badge variant="outline" className="ml-4 shrink-0 mt-0.5">Manual Review</Badge>
            </div>
          </button>

          {/* Option B — Shopify Online */}
          <button
            type="button"
            disabled={loading}
            onClick={handleShopify}
            className="group rounded-2xl border-2 border-primary/40 hover:border-primary bg-primary/5 p-5 text-left transition-all disabled:opacity-50"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-base">Pay Online</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Secure hosted checkout on <span className="font-medium text-foreground">www.kluje.app</span> (Shopify). Card and online payment handled entirely by Shopify — Kluje never processes your card details. Opens in a new tab.
                </p>
              </div>
              <Badge className="ml-4 shrink-0 mt-0.5 bg-primary text-primary-foreground">Recommended</Badge>
            </div>
          </button>
        </div>

        <div className="rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground space-y-1 mt-1">
          <p className="font-medium text-foreground">White Label?</p>
          <p>White Label is a separate, request-led engagement. <a href="mailto:marcus@kluje.com" className="underline">Contact us directly</a> to discuss your requirements.</p>
        </div>

        <div className="flex justify-end pt-1">
          <Button variant="ghost" className="rounded-2xl" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
