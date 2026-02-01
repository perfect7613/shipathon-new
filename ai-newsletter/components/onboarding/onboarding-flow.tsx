'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const GENRES = [
    { id: 'education', name: 'Education', icon: '📚', color: 'from-blue-500 to-blue-600' },
    { id: 'finance', name: 'Finance', icon: '💰', color: 'from-green-500 to-green-600' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: 'from-purple-500 to-purple-600' },
    { id: 'technology', name: 'Technology', icon: '💻', color: 'from-orange-500 to-orange-600' },
    { id: 'ai', name: 'AI', icon: '🤖', color: 'from-pink-500 to-pink-600' },
];

export function OnboardingFlow() {
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const toggleGenre = (genreId: string) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
    };

    const handleSubmit = async () => {
        if (selectedGenres.length === 0) {
            alert('Please select at least one genre');
            return;
        }

        setIsSubmitting(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            // Save user preferences
            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: user.id,
                    preferred_genres: selectedGenres,
                    onboarded: true,
                });

            if (error) throw error;

            // Trigger initial article generation for selected genres
            await fetch('/api/generate/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ genres: selectedGenres }),
            });

            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            console.error('Onboarding error:', error);
            // Show specific error message if available
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to save preferences: ${errorMessage}. Please ensure the database migration has been run.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="max-w-3xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-400 text-sm mb-6">
                        <span className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></span>
                        Welcome to AI Newsletter
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        What topics interest you?
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Select the genres you'd like to receive AI-generated content for.
                        We'll start creating personalized articles right away!
                    </p>
                </div>

                {/* Genre Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {GENRES.map((genre) => (
                        <button
                            key={genre.id}
                            onClick={() => toggleGenre(genre.id)}
                            className={`
                relative p-6 rounded-xl border-2 transition-all duration-200
                ${selectedGenres.includes(genre.id)
                                    ? `bg-gradient-to-br ${genre.color} border-transparent scale-105`
                                    : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                                }
              `}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">{genre.icon}</span>
                                <div className="flex-1 text-left">
                                    <h3 className="text-xl font-semibold text-white">{genre.name}</h3>
                                    <p className="text-sm text-gray-400">
                                        {selectedGenres.includes(genre.id) ? 'Selected' : 'Click to select'}
                                    </p>
                                </div>
                                {selectedGenres.includes(genre.id) && (
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={selectedGenres.length === 0 || isSubmitting}
                        className={`
              w-full py-4 rounded-xl font-semibold text-lg transition-all
              ${selectedGenres.length === 0
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
                            }
            `}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Setting up your dashboard...
                            </span>
                        ) : (
                            `Continue with ${selectedGenres.length} ${selectedGenres.length === 1 ? 'genre' : 'genres'}`
                        )}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        You can change these preferences anytime in settings
                    </p>
                </div>
            </div>
        </div>
    );
}
