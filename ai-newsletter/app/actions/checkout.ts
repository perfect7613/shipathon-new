'use server';

import DodoPayments from 'dodopayments';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Product IDs from Dodo Payments Dashboard
// Replace these with your actual product IDs from https://dashboard.dodopayments.com
const PRODUCT_IDS: Record<string, string | undefined> = {
  pro: process.env.DODO_PRO_PRODUCT_ID,
  enterprise: process.env.DODO_ENTERPRISE_PRODUCT_ID,
};

function getClient() {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;

  if (!apiKey) {
    throw new Error('DODO_PAYMENTS_API_KEY is not configured');
  }

  return new DodoPayments({
    bearerToken: apiKey,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
  });
}

export async function createCheckoutSession(
  productId: string,
  customer: { email: string; name: string }
) {
  const client = getClient();

  const session = await client.checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    customer: {
      email: customer.email,
      name: customer.name,
    },
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
  });

  return session.checkout_url;
}

export async function redirectToCheckout(plan: 'pro' | 'enterprise', email: string, name: string) {
  const productId = PRODUCT_IDS[plan];

  if (!productId) {
    throw new Error(
      `Product ID for "${plan}" plan is not configured. ` +
      `Please set DODO_${plan.toUpperCase()}_PRODUCT_ID in your .env file. ` +
      `Create products at https://dashboard.dodopayments.com`
    );
  }

  const checkoutUrl = await createCheckoutSession(productId, { email, name });

  if (checkoutUrl) {
    redirect(checkoutUrl);
  }

  throw new Error('Failed to create checkout session');
}

export async function checkoutAction(formData: FormData) {
  const plan = formData.get('plan') as 'pro' | 'enterprise';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect('/signup?plan=' + plan);
  }

  // Get user profile name if available, otherwise default to Customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  await redirectToCheckout(plan, user.email, profile?.full_name || 'Customer');
}
