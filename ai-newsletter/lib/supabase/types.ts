export type Genre = 'education' | 'finance' | 'entertainment' | 'technology' | 'ai';

export const GENRES: Genre[] = ['education', 'finance', 'entertainment', 'technology', 'ai'];

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: string;
  dodo_customer_id: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  user_id: string;
  genre: Genre;
  title: string;
  content: string | null;
  summary: string | null;
  source_urls: string[] | null;
  status: ArticleStatus;
  video_url: string | null;
  audio_url: string | null;
  created_at: string;
}

export interface UserGenrePreference {
  id: string;
  user_id: string;
  genre: Genre;
  is_subscribed: boolean;
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
  is_active: boolean;
  updated_at: string;
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'> & { created_at?: string };
        Update: Partial<Profile>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Article>;
      };
      user_genre_preferences: {
        Row: UserGenrePreference;
        Insert: Omit<UserGenrePreference, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<UserGenrePreference>;
      };
      scraped_content: {
        Row: ScrapedContent;
        Insert: Omit<ScrapedContent, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<ScrapedContent>;
      };
      genre_config: {
        Row: GenreConfig;
        Insert: Omit<GenreConfig, 'id' | 'updated_at'> & { id?: string; updated_at?: string };
        Update: Partial<GenreConfig>;
      };
    };
  };
}
