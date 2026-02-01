import { ApifyClient } from 'apify-client';
import { supabase, type Genre, GENRES } from '../../lib/supabase.js';
import { env } from '../../config/env.js';

const client = new ApifyClient({ token: env.APIFY_TOKEN });

// Get genre config from database
async function getGenreConfig(genre: Genre) {
  const { data } = await supabase
    .from('genre_config')
    .select('*')
    .eq('genre', genre)
    .eq('is_active', true);
  return data || [];
}

// Twitter/X Scraper - Full-featured with all options
export async function scrapeTwitterByKeywords(keywords: string[], hashtags: string[]) {
  if (!keywords || keywords.length === 0) {
    console.log('No Twitter keywords provided, skipping');
    return { items: [] };
  }

  try {
    // Build search terms from keywords and hashtags
    const searchTerms = [
      ...keywords,
      ...hashtags.map(tag => `#${tag.replace('#', '')}`)
    ];

    // Build search URLs
    const startUrls = searchTerms.map(term =>
      `https://twitter.com/search?q=${encodeURIComponent(term)}&src=typed_query`
    );

    const run = await client.actor('apidojo/tweet-scraper').call({
      startUrls,
      searchTerms,
      maxItems: 100,
      includeUnavailableUsers: false,
      customMapFunction: "(object) => { return {...object} }",
    }, { waitSecs: 120 });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    return { items };
  } catch (error) {
    console.error('Error scraping Twitter by keywords:', error);
    return { items: [] };
  }
}

// Twitter/X Scraper - by user handles (for influencers)
export async function scrapeTwitterByHandles(handles: string[]) {
  if (!handles || handles.length === 0) {
    return { items: [] };
  }

  try {
    // Clean handles (remove @ if present)
    const cleanHandles = handles.map(h => h.replace('@', ''));

    // Build URLs for user profiles
    const startUrls = cleanHandles.map(handle =>
      `https://twitter.com/${handle}`
    );

    const run = await client.actor('apidojo/tweet-scraper').call({
      twitterHandles: cleanHandles,
      startUrls,
      maxItems: 100, // Get up to 100 tweets per handle
      includeUnavailableUsers: false,
      getFollowers: false, // Set to true if you want follower data
      getFollowing: false, // Set to true if you want following data  
      getRetweeters: false, // Set to true if you want retweeter data
      customMapFunction: "(object) => { return {...object} }",
    }, { waitSecs: 120 });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    return { items };
  } catch (error) {
    console.error('Error scraping Twitter by handles:', error);
    return { items: [] };
  }
}

// Combined Twitter scraper
export async function scrapeTwitter(
  keywords: string[],
  hashtags: string[],
  handles: string[]
) {
  const [keywordsResult, handlesResult] = await Promise.all([
    keywords.length > 0 ? scrapeTwitterByKeywords(keywords, hashtags) : Promise.resolve({ items: [] }),
    handles.length > 0 ? scrapeTwitterByHandles(handles) : Promise.resolve({ items: [] }),
  ]);

  return {
    items: [...keywordsResult.items, ...handlesResult.items],
    fromKeywords: keywordsResult.items,
    fromInfluencers: handlesResult.items,
  };
}

// Reddit Scraper
export async function scrapeReddit(subreddits: string[]) {
  if (!subreddits || subreddits.length === 0) {
    return { items: [] };
  }

  try {
    const run = await client.actor('trudax/reddit-scraper').call({
      startUrls: subreddits.map(s => ({ url: `https://reddit.com/r/${s}` })),
      maxItems: 50,
    }, { waitSecs: 120 });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    return { items };
  } catch (error) {
    console.error('Error scraping Reddit:', error);
    return { items: [] };
  }
}

// Instagram Scraper - Full-featured with all options
export async function scrapeInstagramByHashtags(hashtags: string[]) {
  if (!hashtags || hashtags.length === 0) {
    return { items: [] };
  }

  try {
    const run = await client.actor('apify/instagram-scraper').call({
      searchType: 'hashtag',
      searchLimit: 1,
      resultsType: 'posts',
      resultsLimit: 200,
      addParentData: false,
      directUrls: hashtags.map(tag =>
        `https://www.instagram.com/explore/tags/${tag.replace('#', '')}/`
      ),
    }, { waitSecs: 120 });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    return { items };
  } catch (error) {
    console.error('Error scraping Instagram by hashtags:', error);
    return { items: [] };
  }
}

// Instagram Scraper - by user profiles/handles
export async function scrapeInstagramByProfiles(profiles: string[]) {
  if (!profiles || profiles.length === 0) {
    return { items: [] };
  }

  try {
    const run = await client.actor('apify/instagram-scraper').call({
      searchType: 'user',
      searchLimit: 1,
      resultsType: 'posts',
      resultsLimit: 200,
      addParentData: false,
      directUrls: profiles.map(profile =>
        `https://www.instagram.com/${profile.replace('@', '')}/`
      ),
    }, { waitSecs: 120 });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    return { items };
  } catch (error) {
    console.error('Error scraping Instagram by profiles:', error);
    return { items: [] };
  }
}

// Combined Instagram scraper
export async function scrapeInstagram(
  hashtags: string[],
  profiles?: string[]
) {
  const [hashtagResult, profileResult] = await Promise.all([
    hashtags.length > 0 ? scrapeInstagramByHashtags(hashtags) : Promise.resolve({ items: [] }),
    profiles && profiles.length > 0 ? scrapeInstagramByProfiles(profiles) : Promise.resolve({ items: [] }),
  ]);

  return {
    items: [...hashtagResult.items, ...profileResult.items],
    fromHashtags: hashtagResult.items,
    fromProfiles: profileResult.items,
  };
}

// Scrape content for a specific genre
export async function scrapeByGenre(genre: Genre) {
  console.log(`Starting scrape for genre: ${genre}`);

  const configs = await getGenreConfig(genre);
  const results: { platform: string; genre: Genre; data: unknown[]; source: string }[] = [];

  for (const config of configs) {
    console.log(`Scraping ${config.platform} for ${genre}...`);

    switch (config.platform) {
      case 'twitter': {
        const twitterData = await scrapeTwitter(
          config.keywords || [],
          config.hashtags || [],
          config.twitter_handles || []
        );

        if (twitterData.fromKeywords.length > 0) {
          results.push({
            platform: 'twitter',
            genre,
            data: twitterData.fromKeywords,
            source: 'keywords'
          });
        }
        if (twitterData.fromInfluencers.length > 0) {
          results.push({
            platform: 'twitter',
            genre,
            data: twitterData.fromInfluencers,
            source: 'influencers'
          });
        }
        break;
      }
      case 'reddit': {
        const redditData = await scrapeReddit(config.subreddits || []);
        if (redditData.items.length > 0) {
          results.push({
            platform: 'reddit',
            genre,
            data: redditData.items,
            source: 'subreddits'
          });
        }
        break;
      }
      case 'instagram': {
        const instagramData = await scrapeInstagram(
          config.hashtags || [],
          config.instagram_handles || []
        );

        if (instagramData.fromHashtags.length > 0) {
          results.push({
            platform: 'instagram',
            genre,
            data: instagramData.fromHashtags,
            source: 'hashtags'
          });
        }
        if (instagramData.fromProfiles.length > 0) {
          results.push({
            platform: 'instagram',
            genre,
            data: instagramData.fromProfiles,
            source: 'profiles'
          });
        }
        break;
      }
    }
  }

  // Save results to database
  for (const { platform, genre: g, data, source } of results) {
    await supabase.from('scraped_content').insert({
      platform,
      genre: g,
      raw_data: { items: data, source },
      processed: false,
    });
  }

  console.log(`Scraping completed for ${genre}. Results: ${results.length} batches`);
  return results;
}

// Scrape all genres in parallel
export async function scrapeAllGenres() {
  console.log('Starting scrape for all genres...');

  const genreResults = await Promise.all(
    GENRES.map(genre => scrapeByGenre(genre))
  );

  console.log('All genre scraping completed');
  return genreResults.flat();
}

export { type Genre };
