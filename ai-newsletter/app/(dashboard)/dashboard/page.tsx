import { createClient } from '@/lib/supabase/server';
import { AnimatedDashboard } from '@/components/dashboard/animated-dashboard';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null; // Should be handled by layout but safe check

  // fetch data in parallel
  const [profileResult, articlesResult, preferencesResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('articles').select('genre, status').eq('user_id', user.id),
    supabase.from('user_preferences').select('preferred_genres').eq('user_id', user.id).single()
  ]);

  const profile = profileResult.data;
  const articles = articlesResult.data || [];
  const preferences = preferencesResult.data;
  const userGenres = preferences?.preferred_genres || [];

  const genreCounts = articles.reduce((acc: Record<string, number>, article) => {
    acc[article.genre] = (acc[article.genre] || 0) + 1;
    return acc;
  }, {});

  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.status === 'published').length;

  return (
    <AnimatedDashboard
      profile={profile}
      totalArticles={totalArticles}
      publishedArticles={publishedArticles}
      genreCounts={genreCounts}
      userGenres={userGenres}
    />
  );
}
