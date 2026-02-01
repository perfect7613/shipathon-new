'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ArticleActionsProps {
  articleId: string;
  status: string;
  hasAudio: boolean;
}

export function ArticleActions({ articleId, status, hasAudio }: ArticleActionsProps) {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    setError(null);

    try {
      // Use synchronous endpoint for immediate feedback
      const response = await fetch(`${API_URL}/api/generation/narration-now/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceStyle: 'professional' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      // Refresh the page to show the audio player
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);

    try {
      const newStatus = status === 'draft' ? 'published' : 'draft';
      const response = await fetch(`${API_URL}/api/content/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update article status');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/content/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      router.push('/dashboard/articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 py-6 border-t border-gray-800">
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="px-5 py-2.5 bg-white hover:bg-gray-100 disabled:bg-gray-600 text-gray-900 text-sm font-medium rounded-lg transition flex items-center gap-2"
        >
          {isPublishing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Updating...
            </>
          ) : (
            status === 'draft' ? 'Publish' : 'Unpublish'
          )}
        </button>

        {!hasAudio && (
          <button
            onClick={handleGenerateAudio}
            disabled={isGeneratingAudio}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
          >
            {isGeneratingAudio ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating Audio...
              </>
            ) : (
              'Add Audio'
            )}
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-5 py-2.5 text-red-400 hover:text-red-300 disabled:text-red-600 text-sm font-medium transition ml-auto"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {isGeneratingAudio && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <div>
              <p className="text-blue-400 font-medium">Generating audio narration...</p>
              <p className="text-blue-400/70 text-sm">This may take a minute depending on article length</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
