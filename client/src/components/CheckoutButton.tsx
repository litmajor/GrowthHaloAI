import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  userId: string;
  tier: 'growth' | 'transformation' | 'facilitator';
};

export default function CheckoutButton({ userId, tier }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function startCheckout() {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tier, successUrl: window.location.origin + '/checkout/success', cancelUrl: window.location.origin + '/checkout/cancel' })
      });

      if (!res.ok) {
        const errText = await res.text();
        setError(`Failed to create checkout session: ${errText}`);
        return;
      }

      const data = await res.json();
      if (data && data.url) {
        // Redirect to Stripe Checkout (hosted)
        window.location.href = data.url;
      } else if (data && data.sessionId) {
        // Fallback: if sessionId provided, redirect to /checkout with session id
        window.location.href = `/checkout?session_id=${data.sessionId}`;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Checkout error', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={startCheckout} disabled={loading} className={cn(loading ? 'opacity-70' : '')}>
        {loading ? 'Starting checkout...' : `Subscribe (${tier})`}
      </Button>
      {error && <div className="text-sm text-destructive mt-2">{error}</div>}
    </div>
  );
}
