# Instagram Scraper Configuration Guide

## Overview
The Instagram scraper now uses the full-featured `apify/instagram-scraper` actor which supports hashtags, user profiles, direct URLs, and multiple result types.

## Available Configuration Options

### Basic Options (Currently Implemented)
```typescript
{
  // Search configuration
  searchType: 'hashtag' | 'user' | 'place',
  searchLimit: number,           // Max items per search
  
  // Results configuration
  resultsType: 'posts' | 'reels' | 'igtv',
  resultsLimit: number,          // Max results to fetch (default: 200)
  
  // Direct URLs
  directUrls: string[],          // Direct Instagram URLs to scrape
  
  // Data options
  addParentData: boolean,        // Include parent post data for comments
}
```

## Example Usage

### 1. Scrape by Hashtags
```typescript
await scrapeInstagramByHashtags([
  'AI',
  'MachineLearning',
  'TechNews'
]);
```

This generates:
- Search type: `'hashtag'`
- Direct URLs: `['https://www.instagram.com/explore/tags/AI/', ...]`
- Results: Up to 200 posts per hashtag

### 2. Scrape by User Profiles
```typescript
await scrapeInstagramByProfiles([
  'humansofny',
  'natgeo',
  'theeconomist'
]);
```

This generates:
- Search type: `'user'`
- Direct URLs: `['https://www.instagram.com/humansofny/', ...]`
- Results: Up to 200 posts per profile

### 3. Combined Scraping (as used in scrapeByGenre)
```typescript
await scrapeInstagram(
  ['AI', 'TechNews'],              // hashtags
  ['humansofny', 'natgeo']         // profiles
);
```

Returns:
```typescript
{
  items: [...],                    // All items combined
  fromHashtags: [...],            // Items from hashtag search
  fromProfiles: [...]             // Items from profile search
}
```

## Configuration in Database

Your `genre_config` table should have:
```sql
{
  genre: 'education',
  platform: 'instagram',
  hashtags: ['Education', 'Learning', 'Knowledge'],
  instagram_handles: ['humansofny', 'natgeo', 'ted']
}
```

### Migration Required
Run this SQL in Supabase Dashboard → SQL Editor:
```sql
ALTER TABLE genre_config 
ADD COLUMN IF NOT EXISTS instagram_handles TEXT[];
```

## Current Settings

### Enabled Features
- ✅ Search by hashtags
- ✅ Scrape by user profiles
- ✅ Direct URL support
- ✅ Configurable result types (posts, reels, IGTV)
- ✅ Configurable result limits (up to 200+)
- ✅ Multiple profiles/hashtags in single call

### Configuration Details
- **Result Type**: `'posts'` (can be changed to 'reels' or 'igtv')
- **Results Limit**: `200` per query
- **Search Limit**: `1` (number of pages to search)
- **Add Parent Data**: `false` (can be enabled for nested data)

## Advanced Configuration

### Change Result Type to Reels
Edit `scraper.ts` and change:
```typescript
resultsType: 'reels',  // Instead of 'posts'
```

### Increase Result Limit
```typescript
resultsLimit: 500,     // Get more results (may take longer)
```

### Enable Parent Data (for comments/nested content)
```typescript
addParentData: true,   // Include parent post data
```

## Comparison: Old vs New

### Old Actor (`apify/instagram-hashtag-scraper`)
- ❌ Limited to hashtags only
- ❌ Fixed 20 results
- ❌ No user profile support
- ❌ No direct URL support
- ❌ No result type selection

### New Actor (`apify/instagram-scraper`)
- ✅ Hashtags + User profiles
- ✅ Up to 200+ results (configurable)
- ✅ Direct URL support
- ✅ Multiple result types (posts/reels/IGTV)
- ✅ Advanced search options
- ✅ Parent data support

## Data Structure

Each Instagram post item contains:
```json
{
  "id": "post_id",
  "type": "Image" | "Video" | "Sidecar",
  "shortCode": "ABC123",
  "caption": "Post caption text...",
  "hashtags": ["#AI", "#Tech"],
  "mentions": ["@username"],
  "url": "https://www.instagram.com/p/ABC123/",
  "commentsCount": 42,
  "likesCount": 1234,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "ownerUsername": "username",
  "ownerFullName": "Full Name",
  "locationName": "Location",
  "imageUrl": "https://...",
  "videoUrl": "https://...",
  ...
}
```

## Troubleshooting

### No results returned?
1. Check if profiles/hashtags are public
2. Verify handles don't include `@` symbol
3. Check Apify token is valid
4. Increase `resultsLimit` if needed

### Rate limits?
- Instagram has strict rate limits
- The scraper waits up to 120 seconds per run
- Consider reducing frequency or result limits
- Spread scraping across different times

### Private profiles?
- The scraper only works with **public** profiles
- Private profiles will return no data
- Ensure profiles are public before adding to config

## Example Full Configuration

Matching your provided JSON example:
```typescript
{
  directUrls: [
    "https://www.instagram.com/humansofny/"
  ],
  resultsLimit: 200,
  resultsType: "posts",
  searchLimit: 1,
  searchType: "hashtag",
  addParentData: false
}
```

This is now fully implemented in the scraper! ✅

## Database Setup Example

```sql
-- Add Instagram configuration for AI genre
INSERT INTO genre_config (genre, platform, keywords, hashtags, instagram_handles, is_active)
VALUES (
  'ai',
  'instagram',
  ARRAY[]::TEXT[],
  ARRAY['AI', 'MachineLearning', 'DeepLearning'],
  ARRAY['openai', 'deepmind', 'nvidia'],
  true
);
```
