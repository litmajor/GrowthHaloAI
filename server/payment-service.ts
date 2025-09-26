
import Stripe from 'stripe';
import { subscriptionService } from './subscription-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16',
});

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  status: string;
}

export interface SubscriptionCheckout {
  sessionId: string;
  url: string;
}

const TIER_PRICE_IDS = {
  growth: process.env.STRIPE_GROWTH_PRICE_ID || 'price_growth_monthly',
  transformation: process.env.STRIPE_TRANSFORMATION_PRICE_ID || 'price_transformation_monthly',
  facilitator: process.env.STRIPE_FACILITATOR_PRICE_ID || 'price_facilitator_monthly',
};

export class PaymentService {
  async createSubscriptionCheckout(
    userId: string,
    tier: 'growth' | 'transformation' | 'facilitator',
    successUrl: string,
    cancelUrl: string
  ): Promise<SubscriptionCheckout> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: TIER_PRICE_IDS[tier],
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        customer_email: undefined, // Will be collected at checkout
        metadata: {
          userId,
          tier,
        },
      });

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async handleWebhook(signature: string, payload: string): Promise<void> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy'
      );

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
      }
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.client_reference_id!;
    const tier = session.metadata?.tier as string;
    
    if (session.subscription) {
      // Update user subscription in our database
      await subscriptionService.upgradeSubscription(userId, tier);
      
      // Store Stripe customer and subscription IDs
      // This would typically update the database with Stripe IDs
      console.log(`Subscription created for user ${userId}: ${session.subscription}`);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    // Handle subscription updates (upgrades, downgrades, etc.)
    console.log('Subscription updated:', subscription.id);
  }

  private async handleSubscriptionCancelled(subscription: Stripe.Subscription): Promise<void> {
    // Handle subscription cancellations
    console.log('Subscription cancelled:', subscription.id);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // Handle failed payments
    console.log('Payment failed for invoice:', invoice.id);
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<string> {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }
}

export const paymentService = new PaymentService();
