-- AI Newsletter Platform Database Schema
-- Run this in Supabase SQL Editor

-- Users extended profile
create table if not exists profiles (
  id uuid references auth.users primary key,
  email text unique not null,
  full_name text,
  subscription_tier text default 'free',
  subscription_status text default 'active',
  dodo_customer_id text,
  created_at timestamptz default now()
);

-- Newsletter content
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  genre text not null check (genre in ('education', 'finance', 'entertainment', 'technology', 'ai')),
  title text not null,
  content text,
  summary text,
  source_urls text[],
  status text default 'draft',
  video_url text,
  audio_url text,
  created_at timestamptz default now()
);

-- User genre preferences
create table if not exists user_genre_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  genre text not null check (genre in ('education', 'finance', 'entertainment', 'technology', 'ai')),
  is_subscribed boolean default true,
  created_at timestamptz default now(),
  unique(user_id, genre)
);

-- Scraped content queue
create table if not exists scraped_content (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  genre text not null check (genre in ('education', 'finance', 'entertainment', 'technology', 'ai')),
  raw_data jsonb,
  processed boolean default false,
  created_at timestamptz default now()
);

-- Genre configuration (topics/keywords per genre)
create table if not exists genre_config (
  id uuid primary key default gen_random_uuid(),
  genre text not null check (genre in ('education', 'finance', 'entertainment', 'technology', 'ai')),
  platform text not null,
  keywords text[] not null,
  subreddits text[],
  hashtags text[],
  twitter_handles text[],
  is_active boolean default true,
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table articles enable row level security;
alter table user_genre_preferences enable row level security;
alter table scraped_content enable row level security;
alter table genre_config enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- RLS Policies for articles
create policy "Users can view own articles" on articles
  for select using (auth.uid() = user_id);

create policy "Users can create own articles" on articles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own articles" on articles
  for update using (auth.uid() = user_id);

create policy "Users can delete own articles" on articles
  for delete using (auth.uid() = user_id);

-- RLS Policies for user_genre_preferences
create policy "Users can view own preferences" on user_genre_preferences
  for select using (auth.uid() = user_id);

create policy "Users can manage own preferences" on user_genre_preferences
  for all using (auth.uid() = user_id);

-- RLS Policies for scraped_content (service role only)
create policy "Service role can manage scraped_content" on scraped_content
  for all using (true);

-- RLS Policies for genre_config (public read, service role write)
create policy "Anyone can read genre_config" on genre_config
  for select using (true);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create indexes for better query performance
create index if not exists idx_articles_user_id on articles(user_id);
create index if not exists idx_articles_genre on articles(genre);
create index if not exists idx_articles_status on articles(status);
create index if not exists idx_scraped_content_genre on scraped_content(genre);
create index if not exists idx_scraped_content_processed on scraped_content(processed);
create index if not exists idx_genre_config_genre on genre_config(genre);
create index if not exists idx_genre_config_platform on genre_config(platform);
