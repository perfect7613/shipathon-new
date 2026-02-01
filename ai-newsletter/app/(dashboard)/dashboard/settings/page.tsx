import { createClient } from '@/lib/supabase/server';
import { GenrePreferences } from '@/components/dashboard/genre-preferences';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  const { data: preferences } = await supabase
    .from('user_genre_preferences')
    .select('*')
    .eq('user_id', user?.id);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue={profile?.full_name || ''}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Your name"
              />
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium capitalize">{profile?.subscription_tier || 'Free'} Plan</p>
              <p className="text-gray-400 text-sm">
                {profile?.subscription_tier === 'free' 
                  ? '3 articles per month' 
                  : profile?.subscription_tier === 'pro'
                  ? '20 articles per month with video & audio'
                  : 'Unlimited articles with API access'}
              </p>
            </div>
            <a
              href="/pricing"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              {profile?.subscription_tier === 'free' ? 'Upgrade' : 'Manage'}
            </a>
          </div>
        </div>

        {/* Genre Preferences */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Genre Preferences</h2>
          <p className="text-gray-400 text-sm mb-4">
            Select which genres you want to receive in your newsletter feed
          </p>
          <GenrePreferences 
            userId={user?.id || ''} 
            initialPreferences={preferences || []} 
          />
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-red-900/50">
          <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
          <p className="text-gray-400 text-sm mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg transition border border-red-600/50">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
