import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl p-8 bg-white rounded shadow text-center">
        <h1 className="text-2xl font-semibold mb-4">Thanks — payment succeeded!</h1>
        <p className="text-muted-foreground mb-6">Your subscription is now active. You can manage billing from your subscription page.</p>
        <Link href="/subscription">
          <Button>Go to Subscription</Button>
        </Link>
      </div>
    </div>
  );
}
