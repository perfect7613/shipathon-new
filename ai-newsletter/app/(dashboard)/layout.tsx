import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/dashboard/nav';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { Sidebar } from '@/components/dashboard/sidebar';

const GENRE_LINKS = [
  { id: 'education', name: 'Education', color: 'bg-blue-500' },
  { id: 'finance', name: 'Finance', color: 'bg-emerald-500' },
  { id: 'entertainment', name: 'Entertainment', color: 'bg-purple-500' },
  { id: 'technology', name: 'Technology', color: 'bg-orange-500' },
  { id: 'ai', name: 'AI', color: 'bg-pink-500' },
];

async function checkSubscriptionStatus(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_tier')
    .eq('id', userId)
    .single();

  return (
    profile?.subscription_status === 'active' &&
    profile?.subscription_tier !== 'free'
  );
}

async function checkOnboardingStatus(userId: string) {
  const supabase = await createClient();

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('onboarded')
    .eq('user_id', userId)
    .single();

  return preferences?.onboarded ?? false;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check subscription
  const hasActiveSubscription = await checkSubscriptionStatus(user.id);
  if (!hasActiveSubscription) {
    redirect('/pricing');
  }

  // Check onboarding
  const hasCompletedOnboarding = await checkOnboardingStatus(user.id);
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow />;
  }

  // Fetch preferences
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('preferred_genres')
    .eq('user_id', user.id)
    .single();

  const userGenres: string[] = preferences?.preferred_genres || [];
  const visibleGenres = userGenres.length > 0
    ? GENRE_LINKS.filter(g => userGenres.includes(g.id))
    : GENRE_LINKS;

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar - Fixed */}
      <Sidebar visibleGenres={visibleGenres} />

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
        <DashboardNav user={user} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
