import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl p-8 bg-white rounded shadow text-center">
        <h1 className="text-2xl font-semibold mb-4">Checkout cancelled</h1>
        <p className="text-muted-foreground mb-6">Your checkout was cancelled. You can try again or contact support if you need help.</p>
        <Link href="/subscription">
          <Button>Back to Subscription</Button>
        </Link>
      </div>
    </div>
  );
}
