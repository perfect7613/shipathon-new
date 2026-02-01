# Scraper Upgrades Summary

## Overview
All social media scrapers have been upgraded from basic, limited actors to full-featured implementations with advanced configuration options.

## Changes Summary

### ✅ Twitter Scraper
**Old**: `apidojo/twitter-user-scraper` (limited)
**New**: `apidojo/tweet-scraper` (full-featured)

**Improvements**:
- ✅ Keyword search now working
- ✅ Hashtag search support
- ✅ Search URL generation
- ✅ Configurable max items (100 vs 20)
- ✅ Custom mapping functions
- ⏸️ Optional: followers, following, retweeters data

### ✅ Instagram Scraper  
**Old**: `apify/instagram-hashtag-scraper` (hashtags only)
**New**: `apify/instagram-scraper` (full-featured)

**Improvements**:
- ✅ User profile scraping added
- ✅ Direct URL support
- ✅ Multiple result types (posts/reels/IGTV)
- ✅ Configurable limits (200 vs 20)
- ✅ Search type options
- ⏸️ Optional: parent data for nested content

### 📦 Reddit Scraper
**Status**: Already using full-featured actor
**No changes needed**

## Database Migrations Required

### 1. Articles Table - Add Image URL
```sql
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS image_url TEXT;
```
**Location**: `backend/migrations/add_image_url_to_articles.sql`

### 2. Genre Config - Add Instagram Handles
```sql
ALTER TABLE genre_config 
ADD COLUMN IF NOT EXISTS instagram_handles TEXT[];
```
**Location**: `backend/migrations/add_instagram_handles_to_genre_config.sql`

## Configuration Examples

### Twitter Configuration
```sql
UPDATE genre_config 
SET 
  keywords = ARRAY['AI', 'artificial intelligence'],
  hashtags = ARRAY['AI', 'MachineLearning'],
  twitter_handles = ARRAY['OpenAI', 'AnthropicAI']
WHERE genre = 'ai' AND platform = 'twitter';
```

### Instagram Configuration
```sql
UPDATE genre_config 
SET 
  hashtags = ARRAY['AI', 'TechNews'],
  instagram_handles = ARRAY['openai', 'nvidia', 'deepmind']
WHERE genre = 'ai' AND platform = 'instagram';
```

## API Comparison

| Feature | Twitter Old | Twitter New | Instagram Old | Instagram New |
|---------|-------------|-------------|---------------|---------------|
| **Actor** | twitter-user-scraper | tweet-scraper | instagram-hashtag-scraper | instagram-scraper |
| **Keywords** | ❌ | ✅ | N/A | N/A |
| **Hashtags** | ❌ | ✅ | ✅ | ✅ |
| **User Handles** | ✅ | ✅ | ❌ | ✅ |
| **Direct URLs** | ❌ | ✅ | ❌ | ✅ |
| **Max Items** | 20 | 100 | 20 | 200 |
| **Result Types** | Posts only | Posts only | Posts only | Posts/Reels/IGTV |
| **Search Types** | N/A | N/A | Hashtag only | Hashtag/User/Place |
| **Custom Mapping** | ❌ | ✅ | ❌ | ✅ |

## Code Changes

### Files Modified
1. `src/services/apify/scraper.ts`
   - Upgraded Twitter scraper functions
   - Upgraded Instagram scraper functions
   - Updated scrapeByGenre to use new parameters

2. `src/lib/supabase.ts`
   - Added `instagram_handles` to GenreConfig interface

3. `src/services/ai/article-generator.ts`
   - Migrated from Hugging Face to Freepik API for images
   - Added async task polling
   - Improved error handling

### New Files Created
1. `migrations/add_image_url_to_articles.sql`
2. `migrations/add_instagram_handles_to_genre_config.sql`
3. `docs/TWITTER_SCRAPER_GUIDE.md`
4. `docs/INSTAGRAM_SCRAPER_GUIDE.md`
5. `docs/SCRAPER_UPGRADES_SUMMARY.md` (this file)

## Testing Checklist

- [ ] Apply database migrations
- [ ] Update genre_config with Twitter handles
- [ ] Update genre_config with Instagram handles
- [ ] Test Twitter keyword search
- [ ] Test Twitter user handle scraping
- [ ] Test Instagram hashtag scraping
- [ ] Test Instagram profile scraping
- [ ] Verify image generation with Freepik API
- [ ] Check scraped data is saved to database

## Performance Notes

### Twitter
- Search: ~30-60 seconds per query
- Max 100 items per handle/keyword
- Rate limits apply

### Instagram  
- Search: ~30-90 seconds per query
- Max 200 items per hashtag/profile
- Strict rate limits, use carefully

### Recommendations
1. Don't scrape too frequently (respect rate limits)
2. Use reasonable `maxItems` limits
3. Spread scraping across different times
4. Monitor Apify usage/credits

## Next Steps

1. **Apply Migrations**
   ```
   Go to Supabase Dashboard → SQL Editor
   Run migrations for image_url and instagram_handles
   ```

2. **Configure Genres**
   ```sql
   -- Update your genre_config table with handles
   ```

3. **Test Scrapers**
   ```bash
   # Trigger a scrape for a specific genre
   curl -X POST http://localhost:3002/api/scrape/:genre
   ```

4. **Monitor Results**
   ```
   Check scraped_content table for new data
   Verify source field shows correct type (keywords/influencers/hashtags/profiles)
   ```

## Documentation

- **Twitter**: See `docs/TWITTER_SCRAPER_GUIDE.md`
- **Instagram**: See `docs/INSTAGRAM_SCRAPER_GUIDE.md`
- **API Reference**: Check Apify documentation for each actor

## Support

If you encounter issues:
1. Check Apify token is valid
2. Verify genre_config has correct data
3. Check scraper logs for errors
4. Ensure profiles/handles are public
5. Review rate limit messages from Apify
