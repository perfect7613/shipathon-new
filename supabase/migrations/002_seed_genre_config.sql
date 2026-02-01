-- Seed default genre configurations
-- Run this after the initial schema migration

-- Clear existing data (if re-running)
truncate table genre_config;

-- Insert default genre configurations
insert into genre_config (genre, platform, keywords, subreddits, hashtags, twitter_handles) values
  -- Education
  ('education', 'twitter', 
    array['edtech', 'online learning', 'AI education', 'coursera', 'udemy'], 
    null, 
    array['#EdTech', '#OnlineLearning', '#Education'], 
    array['lexfridman', 'hubaborerman']),
  ('education', 'reddit', 
    array['education', 'learning'], 
    array['education', 'learnprogramming', 'datascience', 'MachineLearning'], 
    null, 
    null),
  
  -- Finance
  ('finance', 'twitter', 
    array['fintech', 'investing', 'crypto', 'stock market', 'personal finance'], 
    null, 
    array['#Fintech', '#Investing', '#Finance'], 
    array['chamath', 'naval', 'balajis']),
  ('finance', 'reddit', 
    array['finance', 'investing'], 
    array['personalfinance', 'investing', 'stocks', 'CryptoCurrency', 'financialindependence'], 
    null, 
    null),
  
  -- Entertainment
  ('entertainment', 'twitter', 
    array['streaming', 'netflix', 'gaming', 'movies', 'music'], 
    null, 
    array['#Entertainment', '#Streaming', '#Gaming'], 
    array['MKBHD', 'ijustine']),
  ('entertainment', 'reddit', 
    array['entertainment', 'movies'], 
    array['movies', 'television', 'gaming', 'Music', 'entertainment'], 
    null, 
    null),
  
  -- Technology
  ('technology', 'twitter', 
    array['tech', 'startups', 'programming', 'software', 'silicon valley'], 
    null, 
    array['#Tech', '#Startups', '#Programming'], 
    array['elonmusk', 'paulg', 'pmarca', 'levelsio']),
  ('technology', 'reddit', 
    array['technology', 'programming'], 
    array['technology', 'programming', 'webdev', 'startups', 'sysadmin'], 
    null, 
    null),
  
  -- AI
  ('ai', 'twitter', 
    array['artificial intelligence', 'machine learning', 'deep learning', 'LLM', 'GPT', 'neural networks'], 
    null, 
    array['#AI', '#MachineLearning', '#DeepLearning', '#LLM'], 
    array['karpathy', 'ylecun', 'goodfellow_ian', 'AndrewYNg', 'sama', 'iaborilya_sut']),
  ('ai', 'reddit', 
    array['AI', 'machine learning'], 
    array['MachineLearning', 'artificial', 'deeplearning', 'LocalLLaMA', 'ChatGPT'], 
    null, 
    null);
