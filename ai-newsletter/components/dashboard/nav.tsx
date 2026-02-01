'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function DashboardNav({ user }: { user: User }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="h-16 bg-gray-800/50 border-b border-gray-700 px-6 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">AI</span>
        </div>
        <span className="text-white font-semibold text-lg">Newsletter</span>
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">{user.email}</span>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition text-sm"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
