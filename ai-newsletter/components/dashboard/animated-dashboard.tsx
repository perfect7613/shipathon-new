'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const GENRE_COLORS: Record<string, string> = {
    education: 'bg-blue-500',
    finance: 'bg-emerald-500',
    entertainment: 'bg-purple-500',
    technology: 'bg-orange-500',
    ai: 'bg-pink-500',
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

interface DashboardContentProps {
    profile: any;
    totalArticles: number;
    publishedArticles: number;
    genreCounts: Record<string, number>;
    userGenres: string[];
}

export function AnimatedDashboard({
    profile,
    totalArticles,
    publishedArticles,
    genreCounts,
    userGenres
}: DashboardContentProps) {

    // Filter genres based on user preference
    // If userGenres is empty, fall back to showing all (or show nothing, but safer to show all for old users)
    // But user requested "only selected genres". So if empty, maybe show onboarding prompt?
    // I'll assume if len > 0 use it.
    const allGenres = Object.keys(GENRE_COLORS);
    const displayGenres = userGenres.length > 0 ? userGenres : allGenres;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <motion.div variants={item}>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
                </h1>
                <p className="text-gray-400">
                    Here&apos;s an overview of your AI-powered newsletter content.
                </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Articles */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition duration-300 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Articles</p>
                            <p className="text-2xl font-bold text-white">{totalArticles}</p>
                        </div>
                    </div>
                </div>

                {/* Published */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition duration-300 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Published</p>
                            <p className="text-2xl font-bold text-white">{publishedArticles}</p>
                        </div>
                    </div>
                </div>

                {/* Subscription */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition duration-300 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Subscription</p>
                            <p className="text-2xl font-bold text-white capitalize">{profile?.subscription_tier || 'Free'}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Genre Overview - Filtered */}
            <motion.div variants={item} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Content by Genre</h2>
                {displayGenres.length === 0 ? (
                    <div className="text-gray-400">No genres selected. Please update your preferences.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {displayGenres.map((genre) => (
                            <Link
                                key={genre}
                                href={`/dashboard/genres/${genre}`}
                                className="group block"
                            >
                                <div className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition h-full border border-transparent hover:border-gray-600">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`w-3 h-3 ${GENRE_COLORS[genre.toLowerCase()] || 'bg-gray-400'} rounded-full`}></span>
                                        <span className="text-white font-medium capitalize">{genre}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{genreCounts[genre] || 0}</p>
                                    <p className="text-gray-400 text-sm">articles</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={item} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/dashboard/generate"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition group"
                    >
                        <svg className="w-8 h-8 text-white group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div>
                            <p className="text-white font-semibold">Generate Article</p>
                            <p className="text-white/70 text-sm">Create AI-powered content</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/articles/new"
                        className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition border border-gray-600 group"
                    >
                        <svg className="w-8 h-8 text-gray-300 group-hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <div>
                            <p className="text-white font-semibold">New Article</p>
                            <p className="text-gray-400 text-sm">Write from scratch</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition border border-gray-600 group"
                    >
                        <svg className="w-8 h-8 text-gray-300 group-hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                            <p className="text-white font-semibold">Settings</p>
                            <p className="text-gray-400 text-sm">Manage preferences</p>
                        </div>
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
}
