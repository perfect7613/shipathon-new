import { Router } from 'express';
import { scrapeByGenre, scrapeAllGenres, type Genre } from '../services/apify/scraper.js';
import { contentQueue } from '../jobs/queue.js';
import { GENRES } from '../lib/supabase.js';

export const scrapingRouter = Router();

// Trigger scraping for a specific genre
scrapingRouter.post('/scrape/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    
    if (!GENRES.includes(genre as Genre)) {
      return res.status(400).json({ 
        error: `Invalid genre. Must be one of: ${GENRES.join(', ')}` 
      });
    }
    
    // Add job to queue
    const job = await contentQueue.add('scrape-genre', { genre });
    
    res.json({ 
      message: `Scraping job queued for genre: ${genre}`,
      jobId: job.id 
    });
  } catch (error) {
    console.error('Error queuing scrape job:', error);
    res.status(500).json({ error: 'Failed to queue scrape job' });
  }
});

// Trigger scraping for all genres
scrapingRouter.post('/scrape-all', async (req, res) => {
  try {
    // Add job to queue
    const job = await contentQueue.add('scrape-all', {});
    
    res.json({ 
      message: 'Scraping job queued for all genres',
      jobId: job.id 
    });
  } catch (error) {
    console.error('Error queuing scrape job:', error);
    res.status(500).json({ error: 'Failed to queue scrape job' });
  }
});

// Get scraping status
scrapingRouter.get('/status', async (req, res) => {
  try {
    const waiting = await contentQueue.getWaitingCount();
    const active = await contentQueue.getActiveCount();
    const completed = await contentQueue.getCompletedCount();
    const failed = await contentQueue.getFailedCount();
    
    res.json({
      queue: {
        waiting,
        active,
        completed,
        failed,
      }
    });
  } catch (error) {
    console.error('Error fetching queue status:', error);
    res.status(500).json({ error: 'Failed to fetch queue status' });
  }
});

// Manual scrape (synchronous - for testing)
scrapingRouter.post('/scrape-now/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    
    if (!GENRES.includes(genre as Genre)) {
      return res.status(400).json({ 
        error: `Invalid genre. Must be one of: ${GENRES.join(', ')}` 
      });
    }
    
    const results = await scrapeByGenre(genre as Genre);
    
    res.json({ 
      message: `Scraping completed for genre: ${genre}`,
      results: results.map(r => ({
        platform: r.platform,
        source: r.source,
        itemCount: r.data.length
      }))
    });
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Failed to scrape content' });
  }
});
