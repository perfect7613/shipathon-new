import { Router } from 'express';
import { generateArticle, generateDailyArticles } from '../services/ai/article-generator.js';
import { generateNarration } from '../services/audio/elevenlabs.js';
import { contentQueue } from '../jobs/queue.js';
import { supabase, GENRES, type Genre } from '../lib/supabase.js';
import { scrapeByGenre } from '../services/apify/scraper.js';

export const generationRouter = Router();

// Generate article for a specific genre
generationRouter.post('/article/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const { customTopic } = req.body;
    
    if (!GENRES.includes(genre as Genre)) {
      return res.status(400).json({ 
        error: `Invalid genre. Must be one of: ${GENRES.join(', ')}` 
      });
    }
    
    // Add job to queue
    const job = await contentQueue.add('generate-article', { 
      genre, 
      customTopic 
    });
    
    res.json({ 
      message: `Article generation job queued for genre: ${genre}`,
      jobId: job.id 
    });
  } catch (error) {
    console.error('Error queuing generation job:', error);
    res.status(500).json({ error: 'Failed to queue generation job' });
  }
});

// Generate articles for all genres
generationRouter.post('/articles/daily', async (req, res) => {
  try {
    // Add job to queue
    const job = await contentQueue.add('generate-daily', {});
    
    res.json({ 
      message: 'Daily article generation job queued',
      jobId: job.id 
    });
  } catch (error) {
    console.error('Error queuing daily generation job:', error);
    res.status(500).json({ error: 'Failed to queue daily generation job' });
  }
});

// Generate audio narration for an article
generationRouter.post('/narration/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const { voiceStyle } = req.body;
    
    // Get article content
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();
    
    if (error || !article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    if (!article.content) {
      return res.status(400).json({ error: 'Article has no content to narrate' });
    }
    
    // Add job to queue
    const job = await contentQueue.add('generate-narration', { 
      articleId,
      content: article.content,
      voiceStyle: voiceStyle || 'professional'
    });
    
    res.json({ 
      message: `Narration generation job queued for article: ${articleId}`,
      jobId: job.id 
    });
  } catch (error) {
    console.error('Error queuing narration job:', error);
    res.status(500).json({ error: 'Failed to queue narration job' });
  }
});

// Sync generate narration (for frontend)
generationRouter.post('/narration-now/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const { voiceStyle } = req.body;
    
    // Get article content
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();
    
    if (error || !article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    if (!article.content) {
      return res.status(400).json({ error: 'Article has no content to narrate' });
    }
    
    console.log(`Generating narration for article: ${articleId}`);
    
    // Generate narration
    const result = await generateNarration(article.content, { 
      voiceStyle: voiceStyle || 'professional' 
    });
    
    // Update article with audio URL
    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update({ audio_url: result.url })
      .eq('id', articleId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    res.json({ 
      message: 'Narration generated successfully',
      audioUrl: result.url,
      article: updatedArticle
    });
  } catch (error) {
    console.error('Error generating narration:', error);
    res.status(500).json({ error: 'Failed to generate narration' });
  }
});

// Sync generate article (for testing)
generationRouter.post('/article-now/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const { customTopic, userId } = req.body;
    
    if (!GENRES.includes(genre as Genre)) {
      return res.status(400).json({ 
        error: `Invalid genre. Must be one of: ${GENRES.join(', ')}` 
      });
    }
    
    // Get unprocessed scraped content
    let { data: scrapedContent, error: scrapedError } = await supabase
      .from('scraped_content')
      .select('*')
      .eq('genre', genre)
      .eq('processed', false)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (scrapedError) throw scrapedError;
    
    // If no unprocessed content, scrape fresh content first
    if (!scrapedContent || scrapedContent.length === 0) {
      console.log(`No unprocessed content for ${genre}, scraping fresh content...`);
      await scrapeByGenre(genre as Genre);
      
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
        return res.status(400).json({ 
          error: `Scraping completed but no content was saved for genre: ${genre}` 
        });
      }
    }
    
    // Generate article
    const article = await generateArticle(scrapedContent, genre as Genre, { customTopic });
    
    // Save to database
    const { data: savedArticle, error: saveError } = await supabase
      .from('articles')
      .insert({
        user_id: userId || null,
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
    
    res.json({ 
      message: 'Article generated successfully',
      article: savedArticle 
    });
  } catch (error) {
    console.error('Error generating article:', error);
    res.status(500).json({ error: 'Failed to generate article' });
  }
});
