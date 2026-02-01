'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Genre } from '@/lib/supabase/types';

const GENRES: { id: Genre; name: string; description: string }[] = [
  { id: 'education', name: 'Education', description: 'Learning, courses, academic insights' },
  { id: 'finance', name: 'Finance', description: 'Markets, investing, economics' },
  { id: 'entertainment', name: 'Entertainment', description: 'Movies, music, pop culture' },
  { id: 'technology', name: 'Technology', description: 'Software, gadgets, startups' },
  { id: 'ai', name: 'AI', description: 'Machine learning, LLMs, automation' },
];

type GenerationStep = 'idle' | 'checking' | 'scraping' | 'generating' | 'complete' | 'error';

const STEP_MESSAGES: Record<GenerationStep, string> = {
  idle: '',
  checking: 'Checking for existing content...',
  scraping: 'Gathering fresh content from sources...',
  generating: 'Writing your article with AI...',
  complete: 'Article created successfully!',
  error: 'Something went wrong',
};

export default function GeneratePage() {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [generateAudio, setGenerateAudio] = useState(false);
  const [step, setStep] = useState<GenerationStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [generatedArticleId, setGeneratedArticleId] = useState<string | null>(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

  const handleGenerate = async () => {
    if (!selectedGenre) {
      setError('Please select a genre');
      return;
    }

    setError(null);
    setStep('checking');

    try {
      // Step 1: Check for existing unprocessed content
      const checkResponse = await fetch(`${API_URL}/api/content/scraped?genre=${selectedGenre}`);
      const checkData = await checkResponse.json();
      
      const hasUnprocessedContent = checkData.stats?.unprocessed > 0;

      // Step 2: If no content, scrape first
      if (!hasUnprocessedContent) {
        setStep('scraping');
        await fetch(`${API_URL}/api/scraping/scrape-now/${selectedGenre}`, {
          method: 'POST',
        });
        // Wait a bit for scraping to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Step 3: Generate article
      setStep('generating');
      const response = await fetch(`${API_URL}/api/generation/article-now/${selectedGenre}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customTopic: customTopic || undefined,
          generateAudio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article');
      }

      if (data.article?.id) {
        setGeneratedArticleId(data.article.id);
        setStep('complete');
        
        // Redirect to article after a short delay
        setTimeout(() => {
          router.push(`/dashboard/articles/${data.article.id}`);
        }, 1500);
      } else {
        throw new Error('No article was generated');
      }
    } catch (err) {
      setStep('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const isProcessing = ['checking', 'scraping', 'generating'].includes(step);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-3">Create New Article</h1>
        <p className="text-gray-400">
          Generate AI-powered newsletter content from trending discussions
        </p>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-3 mb-8">
              {['checking', 'scraping', 'generating'].map((s, i) => {
                const stepIndex = ['checking', 'scraping', 'generating'].indexOf(step);
                const isActive = s === step;
                const isComplete = i < stepIndex;
                
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                      ${isActive ? 'bg-blue-600 text-white animate-pulse' : ''}
                      ${isComplete ? 'bg-green-600 text-white' : ''}
                      ${!isActive && !isComplete ? 'bg-gray-800 text-gray-500' : ''}
                    `}>
                      {isComplete ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    {i < 2 && (
                      <div className={`w-8 h-0.5 ${i < stepIndex ? 'bg-green-600' : 'bg-gray-800'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Spinner */}
            <div className="mb-6">
              <svg className="animate-spin h-12 w-12 mx-auto text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>

            {/* Status */}
            <p className="text-white font-medium text-lg mb-2">
              {STEP_MESSAGES[step]}
            </p>
            <p className="text-gray-500 text-sm">
              {step === 'checking' && 'Looking for existing content in database...'}
              {step === 'scraping' && 'Fetching latest posts from Reddit and social media...'}
              {step === 'generating' && 'Claude is crafting your newsletter article...'}
            </p>

            {/* Genre indicator */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <span className="text-gray-400 text-sm">
                Genre: <span className="text-white capitalize">{selectedGenre}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {step === 'complete' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Article Created!</h3>
            <p className="text-gray-400 mb-4">Redirecting you to your new article...</p>
            <div className="flex justify-center">
              <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 animate-pulse" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="space-y-8">
        {/* Genre Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Select a topic
          </label>
          <div className="grid gap-3">
            {GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                disabled={isProcessing}
                className={`
                  w-full p-4 rounded-xl border text-left transition-all
                  ${selectedGenre === genre.id
                    ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-800/50'
                  }
                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">{genre.name}</span>
                    <p className="text-gray-500 text-sm mt-0.5">{genre.description}</p>
                  </div>
                  {selectedGenre === genre.id && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Focus on a specific topic
            <span className="text-gray-500 font-normal ml-2">(optional)</span>
          </label>
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            disabled={isProcessing}
            placeholder="e.g., Latest AI coding assistants"
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 transition disabled:opacity-50"
          />
        </div>

        {/* Audio Option */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="audio"
            checked={generateAudio}
            onChange={(e) => setGenerateAudio(e.target.checked)}
            disabled={isProcessing}
            className="mt-1 w-4 h-4 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
          />
          <label htmlFor="audio" className="cursor-pointer">
            <span className="text-white text-sm font-medium">Generate audio narration</span>
            <p className="text-gray-500 text-sm">Add AI voice narration using ElevenLabs</p>
          </label>
        </div>

        {/* Error */}
        {error && step === 'error' && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isProcessing || !selectedGenre}
          className="w-full py-4 bg-white hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-500 text-gray-900 font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          Generate article
        </button>

        <p className="text-center text-gray-600 text-sm">
          This usually takes 30-60 seconds
        </p>
      </div>
    </div>
  );
}
