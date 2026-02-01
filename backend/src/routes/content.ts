import { Router } from 'express';
import { supabase, type Genre, GENRES } from '../lib/supabase.js';

export const contentRouter = Router();

// Get all articles (with optional genre filter)
contentRouter.get('/articles', async (req, res) => {
  try {
    const { genre, status, limit = 20 } = req.query;
    
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Number(limit));
    
    if (genre && GENRES.includes(genre as Genre)) {
      query = query.eq('genre', genre);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ articles: data });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get latest articles (for Twitter bot)
contentRouter.get('/articles/latest', async (req, res) => {
  try {
    const { genre } = req.query;
    
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (genre && GENRES.includes(genre as Genre)) {
      query = query.eq('genre', genre);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ articles: data });
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    res.status(500).json({ error: 'Failed to fetch latest articles' });
  }
});

// Get single article by ID
contentRouter.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json({ article: data });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Create new article
contentRouter.post('/articles', async (req, res) => {
  try {
    const { user_id, genre, title, content, summary, source_urls } = req.body;
    
    if (!user_id || !genre || !title) {
      return res.status(400).json({ error: 'Missing required fields: user_id, genre, title' });
    }
    
    if (!GENRES.includes(genre)) {
      return res.status(400).json({ error: `Invalid genre. Must be one of: ${GENRES.join(', ')}` });
    }
    
    const { data, error } = await supabase
      .from('articles')
      .insert({
        user_id,
        genre,
        title,
        content,
        summary,
        source_urls,
        status: 'draft',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({ article: data });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Update article
contentRouter.patch('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate genre if provided
    if (updates.genre && !GENRES.includes(updates.genre)) {
      return res.status(400).json({ error: `Invalid genre. Must be one of: ${GENRES.join(', ')}` });
    }
    
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ article: data });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// Delete article
contentRouter.delete('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// Debug: Get scraped content status
contentRouter.get('/scraped', async (req, res) => {
  try {
    const { genre, processed } = req.query;
    
    let query = supabase
      .from('scraped_content')
      .select('id, genre, platform, processed, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (genre) {
      query = query.eq('genre', genre);
    }
    
    if (processed !== undefined) {
      query = query.eq('processed', processed === 'true');
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Get counts
    const { count: totalCount } = await supabase
      .from('scraped_content')
      .select('*', { count: 'exact', head: true });
    
    const { count: unprocessedCount } = await supabase
      .from('scraped_content')
      .select('*', { count: 'exact', head: true })
      .eq('processed', false);
    
    res.json({ 
      scraped: data,
      stats: {
        total: totalCount,
        unprocessed: unprocessedCount,
        processed: (totalCount || 0) - (unprocessedCount || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching scraped content:', error);
    res.status(500).json({ error: 'Failed to fetch scraped content' });
  }
});

// Reset scraped content (mark all as unprocessed)
contentRouter.post('/scraped/reset', async (req, res) => {
  try {
    const { genre } = req.body;
    
    let query = supabase
      .from('scraped_content')
      .update({ processed: false });
    
    if (genre) {
      query = query.eq('genre', genre);
    }
    
    const { error } = await query;
    
    if (error) throw error;
    
    res.json({ message: 'Scraped content reset successfully' });
  } catch (error) {
    console.error('Error resetting scraped content:', error);
    res.status(500).json({ error: 'Failed to reset scraped content' });
  }
});

// Get genre configurations
contentRouter.get('/genres', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('genre_config')
      .select('*')
      .eq('is_active', true)
      .order('genre');
    
    if (error) throw error;
    
    res.json({ genres: data });
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});
