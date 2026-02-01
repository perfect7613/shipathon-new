import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env.js';
import { scrapeByGenre, scrapeAllGenres, type Genre } from '../services/apify/scraper.js';
import { generateArticle, generateDailyArticles } from '../services/ai/article-generator.js';
import { generateNarration } from '../services/audio/elevenlabs.js';
import { supabase, GENRES } from '../lib/supabase.js';

// Redis connection
const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Content processing queue
export const contentQueue = new Queue('content-processing', { connection });

// Job types
interface ScrapeGenreJob {
  genre: Genre;
}

interface GenerateArticleJob {
  genre: Genre;
  customTopic?: string;
}

interface GenerateNarrationJob {
  articleId: string;
  content: string;
  voiceStyle: 'professional' | 'casual' | 'authoritative';
}

// Worker to process jobs
let worker: Worker | null = null;

export async function initializeWorkers() {
  if (worker) {
    console.log('Workers already initialized');
    return;
  }

  worker = new Worker(
    'content-processing',
    async (job: Job) => {
      console.log(`Processing job: ${job.name} (${job.id})`);
      
      try {
        switch (job.name) {
          case 'scrape-genre': {
            const { genre } = job.data as ScrapeGenreJob;
            const results = await scrapeByGenre(genre);
            return { 
              success: true, 
              genre, 
              batches: results.length,
              totalItems: results.reduce((acc, r) => acc + r.data.length, 0)
            };
          }
          
          case 'scrape-all': {
            const results = await scrapeAllGenres();
            return { 
              success: true, 
              batches: results.length,
              totalItems: results.reduce((acc, r) => acc + r.data.length, 0)
            };
          }
          
          case 'generate-article': {
            const { genre, customTopic } = job.data as GenerateArticleJob;
            
            // Get unprocessed scraped content
            let { data: scrapedContent, error } = await supabase
              .from('scraped_content')
              .select('*')
              .eq('genre', genre)
              .eq('processed', false)
              .order('created_at', { ascending: false })
              .limit(10);
            
            if (error) throw error;
            
            // If no unprocessed content, scrape fresh content first
            if (!scrapedContent || scrapedContent.length === 0) {
              console.log(`No unprocessed content for ${genre}, scraping fresh content...`);
              await scrapeByGenre(genre);
              
              // Fetch the newly scraped content
              const { data: newContent, error: newError } = await supabase
                .from('scraped_content')
                .select('*')
                .eq('genre', genre)
                .eq('processed', false)
                .order('created_at', { ascending: false })
                .limit(10);
              
              if (newError) throw newError;
              scrapedContent = newContent;
              
              if (!scrapedContent || scrapedContent.length === 0) {
                return { success: false, error: 'Scraping completed but no content was saved' };
              }
            }
            
            const article = await generateArticle(scrapedContent, genre, { customTopic });
            
            // Save article
            const { data: savedArticle, error: saveError } = await supabase
              .from('articles')
              .insert({
                genre,
                title: article.title,
                content: article.content,
                summary: article.summary,
                source_urls: article.sources,
                image_url: article.imageUrl || null,
                status: 'draft',
              })
              .select()
              .single();
            
            if (saveError) throw saveError;
            
            // Mark scraped content as processed
            await supabase
              .from('scraped_content')
              .update({ processed: true })
              .in('id', scrapedContent.map(c => c.id));
            
            return { success: true, article: savedArticle };
          }
          
          case 'generate-daily': {
            const articles = await generateDailyArticles();
            
            // Save all articles
            for (const article of articles) {
              await supabase
                .from('articles')
                .insert({
                  genre: article.genre,
                  title: article.title,
                  content: article.content,
                  summary: article.summary,
                  source_urls: article.sources,
                  status: 'draft',
                });
            }
            
            return { success: true, articlesGenerated: articles.length };
          }
          
          case 'generate-narration': {
            const { articleId, content, voiceStyle } = job.data as GenerateNarrationJob;
            
            const result = await generateNarration(content, { voiceStyle });
            
            // Update article with audio URL
            await supabase
              .from('articles')
              .update({ audio_url: result.url })
              .eq('id', articleId);
            
            return { success: true, audioUrl: result.url };
          }
          
          default:
            console.warn(`Unknown job type: ${job.name}`);
            return { success: false, error: 'Unknown job type' };
        }
      } catch (error) {
        console.error(`Job ${job.name} failed:`, error);
        throw error;
      }
    },
    { 
      connection,
      concurrency: 2,
    }
  );

  worker.on('completed', (job, result) => {
    console.log(`Job ${job.name} (${job.id}) completed:`, result);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.name} (${job?.id}) failed:`, err);
  });

  console.log('Content processing worker initialized');
}

// Schedule periodic jobs
export async function scheduleJobs() {
  // These would typically be set up with node-cron in production
  // For now, they can be triggered via API endpoints
  console.log('Job scheduling ready');
}

// Cleanup
export async function closeWorkers() {
  if (worker) {
    await worker.close();
    worker = null;
  }
  await connection.quit();
}
