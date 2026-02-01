import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PaymentSuccessPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // In development mode only: Auto-activate subscription since webhooks don't reach localhost
    if (process.env.NODE_ENV === 'development') {
        await supabase
            .from('profiles')
            .update({
                subscription_status: 'active',
                subscription_tier: 'pro', // Default to pro for dev testing
            })
            .eq('id', user.id);
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800/50 rounded-2xl p-8 border border-gray-700 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
                <p className="text-gray-400 mb-8">
                    Thank you for subscribing. We&apos;ve configured your account.
                </p>

                <Link
                    href="/dashboard"
                    className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                >
                    Go to Dashboard
                </Link>

                {process.env.NODE_ENV === 'development' && (
                    <p className="mt-4 text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded">
                        Dev Mode: Subscription auto-activated (Webhooks skipped)
                    </p>
                )}
            </div>
        </div>
    );
}
