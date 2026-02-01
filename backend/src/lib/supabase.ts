import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Types
export type Genre = 'education' | 'finance' | 'entertainment' | 'technology' | 'ai';

export const GENRES: Genre[] = ['education', 'finance', 'entertainment', 'technology', 'ai'];

export interface Article {
  id: string;
  user_id: string;
  genre: Genre;
  title: string;
  content: string | null;
  summary: string | null;
  source_urls: string[] | null;
  image_url: string | null;
  status: string;
  video_url: string | null;
  audio_url: string | null;
  created_at: string;
}

export interface ScrapedContent {
  id: string;
  platform: string;
  genre: Genre;
  raw_data: Record<string, unknown>;
  processed: boolean;
  created_at: string;
}

export interface GenreConfig {
  id: string;
  genre: Genre;
  platform: string;
  keywords: string[];
  subreddits: string[] | null;
  hashtags: string[] | null;
  twitter_handles: string[] | null;
  instagram_handles: string[] | null;
  is_active: boolean;
  updated_at: string;
}
