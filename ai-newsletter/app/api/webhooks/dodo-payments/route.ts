import { Webhooks } from '@dodopayments/nextjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map product IDs to subscription tiers
function getTierFromProductId(productId: string): string {
  const tiers: Record<string, string> = {
    'prod_pro_monthly': 'pro',
    'prod_enterprise_monthly': 'enterprise',
  };
  return tiers[productId] || 'free';
}

export const POST = Webhooks({
  webhookKey: process.env.DODO_WEBHOOK_SECRET!,

  // Handle successful subscription activation
  onSubscriptionActive: async (payload) => {
    console.log('Subscription activated:', payload);

    // Access customer details correctly
    const customer = payload.data?.customer;
    const customerEmail = customer?.email;
    const productId = payload.data?.product_id;
    // Dodo Payments provides customer ID as customer_id inside the customer object
    const customerId = customer?.customer_id;

    if (!customerEmail) {
      console.error('No customer email in payload');
      return;
    }

    const tier = getTierFromProductId(productId || '');

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        dodo_customer_id: customerId
      })
      .eq('email', customerEmail);

    if (error) {
      console.error('Error updating profile:', error);
    }
  },

  // Handle subscription renewal
  onSubscriptionRenewed: async (payload) => {
    console.log('Subscription renewed:', payload);

    const customerId = payload.data?.customer?.customer_id;

    if (!customerId) return;

    await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('dodo_customer_id', customerId);
  },

  // Handle subscription cancellation
  onSubscriptionCancelled: async (payload) => {
    console.log('Subscription cancelled:', payload);

    const customerId = payload.data?.customer?.customer_id;

    if (!customerId) return;

    await supabase
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'cancelled'
      })
      .eq('dodo_customer_id', customerId);
  },

  // Handle failed payments
  onSubscriptionFailed: async (payload) => {
    console.log('Subscription payment failed:', payload);

    const customerId = payload.data?.customer?.customer_id;

    if (!customerId) return;

    await supabase
      .from('profiles')
      .update({ subscription_status: 'payment_failed' })
      .eq('dodo_customer_id', customerId);
  },

  // Handle subscription on hold
  onSubscriptionOnHold: async (payload) => {
    console.log('Subscription on hold:', payload);

    const customerId = payload.data?.customer?.customer_id;

    if (!customerId) return;

    await supabase
      .from('profiles')
      .update({ subscription_status: 'on_hold' })
      .eq('dodo_customer_id', customerId);
  },

  // Handle successful payments
  onPaymentSucceeded: async (payload) => {
    console.log('Payment succeeded:', payload);
  },

  // Generic payload handler for logging
  onPayload: async (payload) => {
    console.log('Received webhook:', payload.type);
  },
});
