'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Genre, UserGenrePreference } from '@/lib/supabase/types';

const GENRES: { id: Genre; name: string; color: string }[] = [
  { id: 'education', name: 'Education', color: 'bg-blue-500' },
  { id: 'finance', name: 'Finance', color: 'bg-green-500' },
  { id: 'entertainment', name: 'Entertainment', color: 'bg-purple-500' },
  { id: 'technology', name: 'Technology', color: 'bg-orange-500' },
  { id: 'ai', name: 'AI', color: 'bg-pink-500' },
];

interface GenrePreferencesProps {
  userId: string;
  initialPreferences: UserGenrePreference[];
}

export function GenrePreferences({ userId, initialPreferences }: GenrePreferencesProps) {
  const [preferences, setPreferences] = useState<Record<Genre, boolean>>(() => {
    const prefs: Record<Genre, boolean> = {
      education: true,
      finance: true,
      entertainment: true,
      technology: true,
      ai: true,
    };
    
    initialPreferences.forEach((pref) => {
      prefs[pref.genre] = pref.is_subscribed;
    });
    
    return prefs;
  });
  
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const toggleGenre = async (genre: Genre) => {
    const newValue = !preferences[genre];
    setPreferences((prev) => ({ ...prev, [genre]: newValue }));
    setSaving(true);

    try {
      // Upsert the preference
      await supabase
        .from('user_genre_preferences')
        .upsert({
          user_id: userId,
          genre,
          is_subscribed: newValue,
        }, {
          onConflict: 'user_id,genre',
        });
    } catch (error) {
      console.error('Error updating preference:', error);
      // Revert on error
      setPreferences((prev) => ({ ...prev, [genre]: !newValue }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {GENRES.map((genre) => (
        <label
          key={genre.id}
          className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50 transition"
        >
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 ${genre.color} rounded-full`}></span>
            <span className="text-white font-medium">{genre.name}</span>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={preferences[genre.id]}
              onChange={() => toggleGenre(genre.id)}
              disabled={saving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      ))}
    </div>
  );
}
