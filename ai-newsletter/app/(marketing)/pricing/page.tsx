import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { checkoutAction } from '@/app/actions/checkout';

const PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    features: [
      '20 articles per month',
      'Video + Audio generation',
      'All 5 genres',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49,
    features: [
      'Unlimited articles',
      'API access',
      'Custom branding',
      'Dedicated support',
    ],
    popular: false,
  },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user already has subscription, redirect to dashboard
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier')
      .eq('id', user.id)
      .single();

    // Check if user has active AND paid subscription
    if (profile?.subscription_status === 'active' && profile?.subscription_tier !== 'free') {
      redirect('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8 text-gray-400 hover:text-white transition">
            <div className="flex items-center gap-2 justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-white font-semibold text-lg">Newsletter</span>
            </div>
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-lg">
            Get instant access to AI-powered newsletter creation
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative rounded-2xl p-8 border-2 transition
                ${plan.popular
                  ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-blue-500'
                  : 'bg-gray-800/50 border-gray-700'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full text-white text-sm font-medium">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-semibold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">${plan.price}</span>
                <span className="text-gray-400">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <form action={checkoutAction}>
                <input type="hidden" name="plan" value={plan.id} />
                <button
                  type="submit"
                  className={`
                    w-full py-3 rounded-lg font-medium transition
                    ${plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }
                  `}
                >
                  Get Started
                </button>
              </form>
            </div>
          ))}
        </div>

        {/* Back Link */}
        {!user && (
          <div className="text-center mt-8">
            <Link href="/" className="text-gray-400 hover:text-white transition">
              ← Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
