import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ArticleActions } from '@/components/article/ArticleActions';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function estimateReadTime(content: string) {
  const wordsPerMinute = 200;
  const wordCount = content?.split(/\s+/).length || 0;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // First try to get the article (handles RLS)
  let { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  // If RLS blocks it, try fetching without user restriction
  // This handles articles created by the backend with user_id: null
  if (error || !article) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/content/articles/${id}`, {
      cache: 'no-store',
    });
    
    if (response.ok) {
      const data = await response.json();
      article = data.article;
    }
  }

  if (!article) {
    notFound();
  }

  const readTime = estimateReadTime(article.content);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Navigation */}
      <div className="max-w-[680px] mx-auto px-6 py-6">
        <Link
          href="/dashboard/articles"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>

      {/* Article Container */}
      <article className="max-w-[680px] mx-auto px-6 pb-20">
        {/* Header */}
        <header className="mb-10">
          {/* Genre & Status */}
          <div className="flex items-center gap-3 mb-6 text-sm">
            <span className="text-gray-500 capitalize">{article.genre}</span>
            {article.status === 'draft' && (
              <>
                <span className="text-gray-700">·</span>
                <span className="text-amber-500">Draft</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-[32px] md:text-[42px] font-bold text-white leading-[1.15] tracking-[-0.02em] mb-6">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.summary && (
            <p className="text-xl md:text-[22px] text-gray-400 leading-relaxed mb-8">
              {article.summary}
            </p>
          )}

          {/* Author & Meta */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-800">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              AI
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-[15px]">AI Newsletter</p>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>{formatDate(article.created_at)}</span>
                <span>·</span>
                <span>{readTime} min read</span>
              </div>
            </div>
            
            {/* Share Buttons */}
            <div className="flex items-center gap-1">
              <button className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {article.image_url && (
          <div className="mb-10 -mx-6 md:mx-0">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-auto rounded-xl object-cover max-h-[400px]"
            />
          </div>
        )}

        {/* Audio Player */}
        {article.audio_url && (
          <div className="mb-10 p-5 rounded-xl bg-gray-900 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-gray-400 text-sm font-medium">Listen to this article</span>
            </div>
            <audio controls className="w-full h-10" src={article.audio_url}>
              Your browser does not support audio.
            </audio>
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg prose-invert max-w-none
          prose-p:text-[18px] prose-p:leading-[1.8] prose-p:text-gray-300 prose-p:mb-7
          prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-[26px] prose-h2:mt-12 prose-h2:mb-5
          prose-h3:text-[22px] prose-h3:mt-10 prose-h3:mb-4
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white prose-strong:font-semibold
          prose-blockquote:border-l-[3px] prose-blockquote:border-gray-700 prose-blockquote:pl-6 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:text-gray-400 prose-blockquote:text-[17px]
          prose-ul:text-gray-300 prose-ul:text-[18px] prose-li:mb-2
          prose-ol:text-gray-300 prose-ol:text-[18px]
          prose-li:marker:text-gray-600
          prose-hr:border-gray-800 prose-hr:my-10
        ">
          {article.content ? (
            <ReactMarkdown>{article.content}</ReactMarkdown>
          ) : (
            <p className="text-gray-600 italic">No content yet.</p>
          )}
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-gray-800" />

        {/* Sources */}
        {article.source_urls && article.source_urls.length > 0 && (
          <div className="mb-12">
            <h4 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Sources</h4>
            <ul className="space-y-2">
              {article.source_urls.map((url: string, index: number) => (
                <li key={index}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-[15px] hover:underline break-all"
                  >
                    {url.replace(/^https?:\/\//, '').slice(0, 60)}...
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <ArticleActions 
          articleId={article.id}
          status={article.status}
          hasAudio={!!article.audio_url}
        />

        {/* Subscribe CTA */}
        <div className="mt-16 p-8 rounded-2xl border border-gray-800 bg-gray-900/50 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Like this article?
          </h3>
          <p className="text-gray-400 mb-6">
            Subscribe to get curated content delivered to your inbox.
          </p>
          <div className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
            />
            <button className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition text-sm whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
