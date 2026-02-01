-- Add instagram_handles column to genre_config table
ALTER TABLE genre_config 
ADD COLUMN IF NOT EXISTS instagram_handles TEXT[];

-- Add comment to document the column
COMMENT ON COLUMN genre_config.instagram_handles IS 'Instagram profile usernames to scrape posts from (without @ symbol)';

-- Example update to add Instagram handles to a genre
-- UPDATE genre_config 
-- SET instagram_handles = ARRAY['humansofny', 'natgeo', 'theeconomist']
-- WHERE genre = 'education' AND platform = 'instagram';
