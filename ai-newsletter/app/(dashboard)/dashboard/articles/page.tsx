import Link from 'next/link';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function estimateReadTime(content: string) {
  const wordsPerMinute = 200;
  const wordCount = content?.split(/\s+/).length || 0;
  return Math.ceil(wordCount / wordsPerMinute);
}

async function getArticles() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/content/articles`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.articles || [];
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
  }
  return [];
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="max-w-[680px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Articles</h1>
          <p className="text-gray-500 text-sm mt-1">{articles?.length || 0} articles</p>
        </div>
        <Link
          href="/dashboard/generate"
          className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition text-sm"
        >
          New article
        </Link>
      </div>

      {articles && articles.length > 0 ? (
        <div className="divide-y divide-gray-800">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/dashboard/articles/${article.id}`}
              className="block py-7 group"
            >
              <article className="flex gap-5">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Meta */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span className="capitalize">{article.genre}</span>
                    <span>·</span>
                    <span>{formatDate(article.created_at)}</span>
                    <span>·</span>
                    <span>{estimateReadTime(article.content)} min read</span>
                    {article.status === 'draft' && (
                      <>
                        <span>·</span>
                        <span className="text-amber-500">Draft</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition leading-snug mb-2">
                    {article.title}
                  </h2>

                  {/* Summary */}
                  {article.summary && (
                    <p className="text-gray-400 text-[15px] leading-relaxed line-clamp-2">
                      {article.summary}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-[10px] font-semibold">
                        AI
                      </div>
                      <span>AI Newsletter</span>
                    </div>
                    
                    {/* Media indicators */}
                    {(article.audio_url || article.video_url) && (
                      <div className="flex items-center gap-2 ml-auto text-gray-600">
                        {article.audio_url && (
                          <span title="Has audio">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                            </svg>
                          </span>
                        )}
                        {article.video_url && (
                          <span title="Has video">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail */}
                {article.image_url && (
                  <div className="flex-shrink-0 hidden sm:block">
                    <img
                      src={article.image_url}
                      alt=""
                      className="w-28 h-28 rounded-lg object-cover"
                    />
                  </div>
                )}
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No articles yet</h3>
          <p className="text-gray-500 mb-6">Create your first AI-generated article</p>
          <Link
            href="/dashboard/generate"
            className="inline-flex px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition text-sm"
          >
            Generate article
          </Link>
        </div>
      )}
    </div>
  );
}
