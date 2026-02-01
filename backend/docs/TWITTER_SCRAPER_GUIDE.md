# Twitter Scraper Configuration Guide

## Overview
The Twitter scraper now uses the full-featured `apidojo/tweet-scraper` actor which supports all the advanced features from Apify.

## Available Configuration Options

### Basic Options (Currently Implemented)
```typescript
{
  // Search configuration
  searchTerms: string[],        // Keywords and hashtags to search for
  twitterHandles: string[],     // User handles to scrape tweets from
  startUrls: string[],          // Direct Twitter URLs to scrape
  
  // Limits
  maxItems: number,             // Max tweets per scrape (default: 100)
  
  // Filters
  includeUnavailableUsers: boolean,  // Include deleted/suspended users
  
  // Data transform
  customMapFunction: string,    // JavaScript function to transform results
}
```

### Advanced Options (Available but not enabled)
```typescript
{
  // User relationship data
  getFollowers: boolean,        // Fetch follower data for users
  getFollowing: boolean,        // Fetch following data for users
  getRetweeters: boolean,       // Fetch retweeters for each tweet
  
  // User IDs (alternative to handles)
  twitterUserIds: string[],     // Numeric user IDs instead of handles
}
```

## Example Usage

### 1. Search by Keywords and Hashtags
```typescript
await scrapeTwitterByKeywords(
  ['AI', 'machine learning'],     // keywords
  ['AITools', 'MachineLearning']  // hashtags
);
```
This generates:
- Search terms: `['AI', 'machine learning', '#AITools', '#MachineLearning']`
- Search URLs: `['https://twitter.com/search?q=AI&src=typed_query', ...]`

### 2. Scrape Specific Users
```typescript
await scrapeTwitterByHandles([
  'elonmusk',
  'taylorswift13',
  'BillGates'
]);
```
This generates:
- Twitter handles: `['elonmusk', 'taylorswift13', 'BillGates']`
- Start URLs: `['https://twitter.com/elonmusk', ...]`
- Max 100 tweets per user

### 3. Combined Scraping (as used in scrapeByGenre)
```typescript
await scrapeTwitter(
  ['AI', 'tech'],           // keywords
  ['TechNews'],             // hashtags
  ['elonmusk', 'sundarpichai']  // handles
);
```

## Configuration in Database

Your `genre_config` table should have:
```sql
{
  genre: 'ai',
  platform: 'twitter',
  keywords: ['AI', 'artificial intelligence', 'machine learning'],
  hashtags: ['AI', 'MachineLearning', 'DeepLearning'],
  twitter_handles: ['OpenAI', 'AnthropicAI', 'GoogleAI']
}
```

## Current Settings

### Enabled Features
- ✅ Search by keywords and hashtags
- ✅ Scrape by user handles
- ✅ Start URLs support
- ✅ Custom mapping function
- ✅ Configurable maxItems (100 per query)

### Disabled Features (can be enabled)
- ⏸️ Get followers data (`getFollowers: false`)
- ⏸️ Get following data (`getFollowing: false`)
- ⏸️ Get retweeters (`getRetweeters: false`)

> **Note**: Enabling follower/following/retweeters increases scraping time and costs

## To Enable Advanced Features

Edit `scraper.ts` and change:
```typescript
getFollowers: true,   // Enable follower scraping
getFollowing: true,   // Enable following scraping
getRetweeters: true,  // Enable retweeter scraping
```

## Troubleshooting

### No results returned?
1. Check if handles exist and are public
2. Verify keywords are not too restrictive
3. Check Apify token is valid
4. Increase `maxItems` if needed

### Rate limits?
- Twitter has rate limits
- The scraper waits up to 120 seconds per run
- Consider reducing `maxItems` or frequency

### Data format?
Each tweet item contains:
```json
{
  "id": "tweet_id",
  "text": "tweet content",
  "user": { "screen_name": "...", "followers_count": 123 },
  "created_at": "...",
  "retweet_count": 10,
  "favorite_count": 50,
  ...
}
```

## Comparison: Old vs New

### Old Actor (`apidojo/twitter-user-scraper`)
- ❌ Limited to user profiles only
- ❌ No keyword search
- ❌ No hashtag support
- ❌ Fixed 20 tweets per user

### New Actor (`apidojo/tweet-scraper`)
- ✅ Full keyword search support
- ✅ Hashtag search
- ✅ Direct URL scraping
- ✅ Flexible maxItems (up to 1000+)
- ✅ Advanced features (followers, retweeters, etc.)
- ✅ Custom data mapping
