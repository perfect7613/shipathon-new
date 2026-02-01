import Link from 'next/link';

const GENRES = [
  { name: 'Education', icon: '📚', color: 'from-blue-500 to-blue-600' },
  { name: 'Finance', icon: '💰', color: 'from-green-500 to-green-600' },
  { name: 'Entertainment', icon: '🎬', color: 'from-purple-500 to-purple-600' },
  { name: 'Technology', icon: '💻', color: 'from-orange-500 to-orange-600' },
  { name: 'AI', icon: '🤖', color: 'from-pink-500 to-pink-600' },
];

const FEATURES = [
  {
    icon: '⚡',
    title: 'AI-Powered Content',
    description: 'Generate high-quality articles using Claude and Gemini AI models',
  },
  {
    icon: '🎙️',
    title: 'Audio Narration',
    description: 'Professional voiceovers powered by ElevenLabs text-to-speech',
  },
  {
    icon: '🔄',
    title: 'Automated Scraping',
    description: 'Curate trending content from Twitter, Reddit, and Instagram',
  },
  {
    icon: '🎯',
    title: '5 Genre Categories',
    description: 'Education, Finance, Entertainment, Technology, and AI coverage',
  },
  {
    icon: '📱',
    title: 'Multi-Platform',
    description: 'Reach audiences through newsletters, web, and social media',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    description: 'Track engagement and optimize your content strategy',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-white font-semibold text-lg">Newsletter</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-300 hover:text-white transition">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-400 text-sm mb-8">
            <span className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></span>
            AI-Powered Newsletter Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Create Stunning Newsletters{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              with AI
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto">
            Generate personalized articles, videos, and audio narrations across 5 trending genres.
            Powered by Claude, Gemini, and ElevenLabs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup?plan=pro"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition text-lg"
            >
              Get Started - $19/mo
            </Link>
            <Link
              href="#pricing"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition text-lg border border-gray-700"
            >
              View Pricing
            </Link>
            <Link
              href="https://x.com/bitreport_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl transition text-lg border border-gray-800 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter Bot
            </Link>
          </div>
        </div>
      </section>

      {/* Genres Section */}
      <section className="py-20 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">5 Trending Genres</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Stay ahead with AI-curated content from the hottest topics across multiple industries
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {GENRES.map((genre) => (
              <div
                key={genre.name}
                className={`bg-gradient-to-br ${genre.color} rounded-xl p-6 text-center transform hover:scale-105 transition`}
              >
                <span className="text-4xl mb-3 block">{genre.icon}</span>
                <span className="text-white font-semibold">{genre.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Powerful Features</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to create, manage, and distribute AI-powered newsletters
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition"
              >
                <span className="text-3xl mb-4 block">{feature.icon}</span>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Simple Pricing</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full text-white text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$19</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  20 articles per month
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Video + Audio generation
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All 5 genres
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <Link
                href="/signup?plan=pro"
                className="block w-full py-3 text-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Get Started Now
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$49</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited articles
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  API access
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom branding
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dedicated support
                </li>
              </ul>
              <Link
                href="/signup?plan=enterprise"
                className="block w-full py-3 text-center bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Newsletter?</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of creators using AI to produce engaging content faster than ever.
          </p>
          <Link
            href="/signup?plan=pro"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition text-lg"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-white font-semibold">Newsletter</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} AI Newsletter. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
