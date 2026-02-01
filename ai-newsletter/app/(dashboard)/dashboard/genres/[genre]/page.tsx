import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const GENRE_CONFIG: Record<string, { color: string; bg: string; icon: string; description: string }> = {
  education: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    icon: '📚',
    description: 'Learning opportunities, skill development, and educational trends'
  },
  finance: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    icon: '💰',
    description: 'Market insights, investment strategies, and economic news'
  },
  entertainment: {
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    icon: '🎬',
    description: 'Movies, music, celebrity news, and pop culture'
  },
  technology: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    icon: '💻',
    description: 'Latest gadgets, software updates, and tech innovations'
  },
  ai: {
    color: 'text-pink-400',
    bg: 'bg-pink-500/20',
    icon: '🤖',
    description: 'Artificial Intelligence breakthroughs, tools, and research'
  },
};

export default async function GenrePage({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  const config = GENRE_CONFIG[genre];

  if (!config) return notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch articles for this genre
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('user_id', user?.id)
    .eq('genre', genre)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${config.bg}`}>
            {config.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white capitalize">{genre}</h1>
            <p className="text-gray-400 mt-1">{config.description}</p>
          </div>
        </div>

        <Link
          href={`/dashboard/generate?genre=${genre}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate {genre.charAt(0).toUpperCase() + genre.slice(1)} Article
        </Link>
      </div>

      {/* Articles Grid */}
      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/dashboard/articles/${article.id}`}
              className="group block bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-500 transition duration-300"
            >
              {article.image_url ? (
                <div className="aspect-video relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-black/50 backdrop-blur-md text-white border border-white/10`}>
                      {new Date(article.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`aspect-video ${config.bg} flex items-center justify-center group-hover:bg-opacity-80 transition`}>
                  <span className="text-4xl opacity-50">{config.icon}</span>
                </div>
              )}

              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                  {article.summary || 'No summary available.'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="capitalize px-2 py-1 bg-gray-700/50 rounded text-gray-300">{article.status}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                    Read more →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${config.bg} flex items-center justify-center text-3xl`}>
            {config.icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No {genre} articles yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Generate your first article in this genre to start building your newsletter content.
          </p>
          <Link
            href={`/dashboard/generate?genre=${genre}`}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Article
          </Link>
        </div>
      )}
    </div>
  );
}
