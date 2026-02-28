import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Crown, Check, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardSubscriptionProps {
  profile: Profile | null;
  onSubscriptionUpdate: () => void;
}

const DashboardSubscription = ({ profile, onSubscriptionUpdate }: DashboardSubscriptionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const isSubscribed = profile?.subscription_status === 'active';

  const handleSubscribe = async () => {
    setIsProcessing(true);

    // Mock subscription - in production, integrate with Stripe
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq('id', profile?.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to process subscription',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Subscription Activated!',
        description: 'You can now request quotes on jobs.',
      });
      onSubscriptionUpdate();
    }

    setIsProcessing(false);
  };

  const handleCancel = async () => {
    setIsProcessing(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
      })
      .eq('id', profile?.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled.',
      });
      onSubscriptionUpdate();
    }

    setIsProcessing(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Free Plan */}
      <Card className={!isSubscribed ? 'border-primary' : ''}>
        <CardHeader>
          <CardTitle>Free</CardTitle>
          <CardDescription>Basic features for new providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
          
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              Create your profile
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              Add unlimited services
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              Add service locations
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              Browse job listings
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <X className="w-4 h-4" />
              Request quotes on jobs
            </li>
          </ul>

          {!isSubscribed && (
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Pro Plan */}
      <Card className={isSubscribed ? 'border-primary bg-primary/5' : ''}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <CardTitle>Pro</CardTitle>
          </div>
          <CardDescription>Everything you need to win jobs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-bold">$4.99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
          
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              Everything in Free
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              Request unlimited quotes
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              Priority in search results
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              Direct messaging with clients
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              Pro badge on your profile
            </li>
          </ul>

          {isSubscribed ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Renews on {profile?.subscription_expires_at ? formatDate(profile.subscription_expires_at) : 'N/A'}
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleCancel}
                disabled={isProcessing}
              >
                Cancel Subscription
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Upgrade to Pro'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSubscription;
