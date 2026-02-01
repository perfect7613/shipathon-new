import { config } from 'dotenv';
config();

import { AgentRuntime } from '@elizaos/core';
import { bootstrapPlugin } from '@elizaos/plugin-bootstrap';
import { 
  plugin as sqlPlugin, 
  createDatabaseAdapter, 
  DatabaseMigrationService 
} from '@elizaos/plugin-sql';
import { anthropicPlugin } from '@elizaos/plugin-anthropic';
import cron from 'node-cron';

// Check dry run mode
const isDryRun = process.env.TWITTER_DRY_RUN === 'true';
console.log(`📝 Twitter Dry Run Mode: ${isDryRun ? 'ENABLED' : 'DISABLED'}`);

// Conditionally import Twitter plugin
let twitterPlugin: any = null;
if (!isDryRun) {
  try {
    const twitterModule = await import('@elizaos/plugin-twitter');
    twitterPlugin = twitterModule.twitterPlugin || twitterModule.default;
    console.log('✅ Twitter plugin loaded');
  } catch (e) {
    console.warn('⚠️ Twitter plugin not available:', e);
  }
} else {
  console.log('📝 DRY RUN MODE - Twitter plugin not loaded');
}

console.log('✅ SQL plugin loaded');
console.log('✅ Anthropic plugin loaded');

console.log('🤖 AI Newsletter Bot Starting...');

// =============================================================================
// ARTICLE FETCHING FROM BACKEND API
// =============================================================================

type Genre = 'education' | 'finance' | 'entertainment' | 'technology' | 'ai';
const GENRES: Genre[] = ['education', 'finance', 'entertainment', 'technology', 'ai'];

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  genre: Genre;
  created_at: string;
}

// Rotate through genres based on time of day
function getNextGenreToPost(): Genre {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) return 'education';
  if (hour >= 10 && hour < 13) return 'finance';
  if (hour >= 13 && hour < 16) return 'technology';
  if (hour >= 16 && hour < 19) return 'ai';
  if (hour >= 19 && hour < 22) return 'entertainment';
  return GENRES[Math.floor(Math.random() * GENRES.length)];
}

const BASE_URL = process.env.NEWSLETTER_API_URL || 'http://localhost:3002/api';

// =============================================================================
// STEP 1: SCRAPE FRESH CONTENT
// =============================================================================

async function scrapeContentForGenre(genre: Genre): Promise<boolean> {
  const url = `${BASE_URL}/scraping/scrape-now/${genre}`;
  console.log(`  Scraping from: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  Scrape API error: ${response.status} - ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`  ✅ Scraping completed: ${data.message}`);
    if (data.results) {
      data.results.forEach((r: any) => {
        console.log(`     - ${r.platform}/${r.source}: ${r.itemCount} items`);
      });
    }
    return true;
  } catch (error) {
    console.error('  Error during scraping:', error);
    return false;
  }
}

// =============================================================================
// STEP 2: GENERATE ARTICLE FROM SCRAPED CONTENT
// =============================================================================

async function generateArticleForGenre(genre: Genre): Promise<Article | null> {
  const url = `${BASE_URL}/generation/article-now/${genre}`;
  console.log(`  Generating article from: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`  Generation API error: ${response.status} - ${errorData.error || response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`  ✅ Article generated: ${data.article?.title}`);
    return data.article;
  } catch (error) {
    console.error('  Error generating article:', error);
    return null;
  }
}

// =============================================================================
// STEP 3: FETCH EXISTING ARTICLES (fallback)
// =============================================================================

async function fetchArticlesFromBackend(genre: Genre): Promise<Article[]> {
  const url = `${BASE_URL}/content/articles/latest?genre=${genre}`;
  console.log(`  Fetching existing articles from: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error(`  API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('  Error fetching articles:', error);
    return [];
  }
}

// Track posted articles to avoid duplicates
const postedArticleIds = new Set<string>();

// =============================================================================
// MAIN PIPELINE: Scrape → Generate → Post to Twitter
// =============================================================================

async function postNewsletterArticle(runtime: AgentRuntime): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('📰 NEWSLETTER CONTENT PIPELINE');
  console.log('='.repeat(60));
  
  try {
    // 1. Get genre for this time slot
    const genre = getNextGenreToPost();
    console.log(`\n📂 Genre: ${genre}`);
    
    // 2. SCRAPE: Fetch fresh content from social media
    console.log('\n🔍 STEP 1: Scraping fresh content...');
    const scrapeSuccess = await scrapeContentForGenre(genre);
    
    // 3. GENERATE: Create article from scraped content
    let article: Article | null = null;
    
    if (scrapeSuccess) {
      console.log('\n📝 STEP 2: Generating article from scraped content...');
      article = await generateArticleForGenre(genre);
    }
    
    // 4. FALLBACK: If no new article, try to get existing one
    if (!article) {
      console.log('\n🔄 STEP 2b: No new article generated, checking existing articles...');
      const articles = await fetchArticlesFromBackend(genre);
      
      if (articles.length === 0) {
        console.log('  ⚠️ No articles available for this genre');
        console.log('  💡 Tip: Make sure the backend is running and has scraped content');
        return;
      }
      
      // Find an article we haven't posted yet
      article = articles.find(a => !postedArticleIds.has(a.id)) || articles[0];
    }
    
    console.log(`\n📄 Article ready: ${article.title}`);
    console.log(`   ID: ${article.id}`);
    
    // 5. TWEET: Generate thread using Claude
    console.log('\n🐦 STEP 3: Generating tweet thread with Claude...');
    
    const threadPrompt = `Create a compelling Twitter thread (4-5 tweets) about this article.

Article Title: ${article.title}
Summary: ${article.summary || 'No summary available'}
Genre: ${article.genre}
Content Preview: ${article.content?.substring(0, 500) || 'No content'}

Requirements:
- First tweet should be an attention-grabbing hook
- Each tweet must be under 280 characters
- Include 1-2 relevant hashtags per tweet
- Make it informative and engaging
- End with a CTA to check out our newsletter

Return ONLY a valid JSON array of tweet strings, nothing else.
Example format: ["First tweet here", "Second tweet here", "Third tweet here"]`;

    let tweets: string[] = [];
    
    try {
      const response = await runtime.useModel('TEXT_LARGE', {
        prompt: threadPrompt,
      });
      
      // Parse the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tweets = JSON.parse(jsonMatch[0]);
      }
    } catch (genError) {
      console.error('  Error generating tweets:', genError);
      // Fallback: create simple tweets from article
      tweets = [
        `🚀 ${article.title.substring(0, 200)} #${article.genre}`,
        `${article.summary?.substring(0, 250) || 'Check out this article!'} 🧵`,
        `Want more ${article.genre} content? Subscribe to our newsletter! 📬`
      ];
    }
    
    if (tweets.length === 0) {
      console.log('  ⚠️ Failed to generate tweets');
      return;
    }
    
    // Display generated thread
    console.log('\n📝 Generated Thread:');
    console.log('-'.repeat(40));
    tweets.forEach((tweet, i) => {
      console.log(`  ${i + 1}/${tweets.length}: ${tweet}`);
    });
    console.log('-'.repeat(40));
    
    // 6. POST: Send to Twitter (or show dry run)
    console.log('\n📤 STEP 4: Posting to Twitter...');
    if (isDryRun || !twitterPlugin) {
      console.log('  ✅ DRY RUN - Thread NOT posted to Twitter');
      console.log('     (Set TWITTER_DRY_RUN=false to post for real)');
    } else {
      
      try {
        const twitterService = runtime.getService('twitter');
        if (!twitterService?.twitterClient?.client) {
          console.log('  ⚠️ Twitter service not available');
          return;
        }

        const client = twitterService.twitterClient.client;
        let previousTweetId: string | null = null;
        
        for (const tweet of tweets) {
          const result = await client.twitterClient.sendTweet(
            tweet, 
            previousTweetId || undefined
          );
          previousTweetId = result?.data?.data?.id || result?.data?.id || previousTweetId;
          console.log(`  ✅ Posted: ${tweet.substring(0, 50)}...`);
        }
        
        console.log(`\n✅ Successfully posted thread with ${tweets.length} tweets!`);
      } catch (twitterError: any) {
        console.log(`  ⚠️ Twitter API error: ${twitterError.message}`);
        console.log('     (Your API credits may be depleted)');
      }
    }
    
    // Mark article as posted
    postedArticleIds.add(article.id);
    
    console.log('\n✅ PIPELINE COMPLETE');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error in pipeline:', error);
  }
}

// =============================================================================
// HELPER: Generate deterministic UUID from string
// =============================================================================

function stringToUuid(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-8${hex.slice(0, 3)}-${hex.padEnd(12, '0').slice(0, 12)}`;
}

// =============================================================================
// CHARACTER CONFIGURATION
// =============================================================================

const character = {
  name: "AINewsBot",
  description: "AI-powered newsletter curator that shares trending content",
  
  clients: isDryRun ? [] : ["twitter"],
  
  postExamples: [
    "🚀 Breaking: Latest AI developments are reshaping how we work...",
    "📚 This week's top education trends. Thread 🧵",
    "💰 Finance update: 3 key market moves everyone's talking about",
  ],
  
  bio: ["AI-powered newsletter curator"],
  
  style: {
    all: ["Be informative", "Use clear language"],
    post: ["Create engaging hooks", "Include hashtags"],
  },
  
  settings: {
    // Database
    PGLITE_DATA_DIR: process.env.PGLITE_DATA_DIR || './data/pglite',
    
    // Claude API
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    
    // Twitter - Cookie-based auth (bypasses API credits)
    TWITTER_USERNAME: process.env.TWITTER_USERNAME,
    TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
    TWITTER_EMAIL: process.env.TWITTER_EMAIL,
    
    // Twitter - OAuth 1.0a (fallback if cookie auth not set)
    TWITTER_API_KEY: process.env.TWITTER_API_KEY,
    TWITTER_API_SECRET_KEY: process.env.TWITTER_API_SECRET_KEY,
    TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    
    // Twitter behavior
    TWITTER_DRY_RUN: isDryRun.toString(),
    TWITTER_POST_ENABLE: process.env.TWITTER_POST_ENABLE || 'true',
    TWITTER_SEARCH_ENABLE: 'false',
  }
};

// =============================================================================
// SCHEDULER - Posts articles on schedule
// =============================================================================

let scheduledTasks: cron.ScheduledTask[] = [];

function setupScheduler(runtime: AgentRuntime) {
  console.log('\n⏰ Setting up scheduler...');
  
  // Post 3 times daily: 9am, 1pm, 6pm
  const postTask = cron.schedule('0 9,13,18 * * *', async () => {
    console.log('\n⏰ Scheduled post triggered!');
    await postNewsletterArticle(runtime);
  });
  scheduledTasks.push(postTask);
  console.log('  ✅ Scheduled: Posts at 9am, 1pm, 6pm daily');
  
  // Clear posted articles cache at midnight
  const clearTask = cron.schedule('0 0 * * *', () => {
    console.log('🗑️ Clearing posted articles cache');
    postedArticleIds.clear();
  });
  scheduledTasks.push(clearTask);
  console.log('  ✅ Scheduled: Cache clear at midnight');
}

function stopScheduler() {
  scheduledTasks.forEach(task => task.stop());
  scheduledTasks = [];
  console.log('⏰ Scheduler stopped');
}

// =============================================================================
// MAIN - With manual database initialization
// =============================================================================

async function main() {
  try {
    console.log('\n🔧 Initializing ElizaOS runtime...');
    console.log(`  Backend API: ${process.env.NEWSLETTER_API_URL || 'http://localhost:3002/api'}`);
    
    // Step 1: Generate agent ID
    const agentId = stringToUuid(character.name);
    console.log(`  Agent ID: ${agentId}`);
    
    // Step 2: Create database adapter BEFORE runtime
    console.log('  Creating database adapter...');
    const dataDir = process.env.PGLITE_DATA_DIR || './data/pglite';
    const dbAdapter = createDatabaseAdapter({ dataDir }, agentId);
    
    // Step 3: Initialize the adapter (creates PGlite instance)
    console.log('  Initializing database...');
    await dbAdapter.init();
    
    // Step 4: Run migrations BEFORE creating runtime
    console.log('  Running database migrations...');
    const migrationService = new DatabaseMigrationService();
    
    // Register schemas from all plugins that have them
    const allPlugins = [
      sqlPlugin,
      bootstrapPlugin,
      anthropicPlugin,
      ...(twitterPlugin && !isDryRun ? [twitterPlugin] : []),
    ];
    
    migrationService.discoverAndRegisterPluginSchemas(allPlugins);
    
    // Initialize with the database and run migrations
    await migrationService.initializeWithDatabase(dbAdapter.db);
    await migrationService.runAllPluginMigrations();
    console.log('  ✅ Migrations completed!');
    
    // Step 5: Create runtime with pre-initialized adapter
    const runtime = new AgentRuntime({ 
      agentId,
      character: {
        ...character,
        id: agentId,
      },
      adapter: dbAdapter,
      plugins: allPlugins,
    });
    
    // Step 6: Initialize runtime (skip migrations since we already ran them)
    await runtime.initialize();
    
    console.log('\n✅ ElizaOS Bot is running!');
    if (isDryRun) {
      console.log('📝 DRY RUN MODE - Tweets will be generated but not posted');
    }
    
    // Setup scheduled posting
    setupScheduler(runtime);
    
    // Post immediately on startup for testing
    if (process.env.POST_ON_STARTUP === 'true') {
      console.log('\n📤 POST_ON_STARTUP=true - Posting immediately...');
      await postNewsletterArticle(runtime);
    }
    
    console.log('\n🎯 Bot is ready! Waiting for scheduled posts...');
    console.log('   Press Ctrl+C to stop.\n');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down...');
      stopScheduler();
      await runtime.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

main();
