import type { Action, IAgentRuntime } from '@elizaos/core';

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

export const fetchLatestArticlesAction: Action = {
  name: 'FETCH_LATEST_ARTICLES',
  description: 'Fetches the latest articles from the newsletter backend by genre',
  similes: ['get articles', 'fetch news', 'get latest content'],
  
  async validate(runtime: IAgentRuntime): Promise<boolean> {
    return !!process.env.NEWSLETTER_API_URL;
  },

  async handler(runtime: IAgentRuntime, message: unknown, state: unknown, options?: { genre?: Genre }): Promise<Article[]> {
    const genre = options?.genre;
    const url = genre 
      ? `${process.env.NEWSLETTER_API_URL}/content/articles/latest?genre=${genre}`
      : `${process.env.NEWSLETTER_API_URL}/content/articles/latest`;
      
    try {
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${process.env.NEWSLETTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch articles:', response.statusText);
        return [];
      }
      
      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  },
  
  examples: [
    [
      {
        user: 'user',
        content: { text: 'Get the latest AI articles' },
      },
      {
        user: 'AINewsBot',
        content: { text: 'Fetching the latest AI articles...', action: 'FETCH_LATEST_ARTICLES' },
      },
    ],
  ],
};

// Rotate through genres for diverse posting (5 genres)
export function getNextGenreToPost(): Genre {
  const hour = new Date().getHours();
  
  // Rotate through genres based on time of day
  // Morning (6-10): education
  // Late morning (10-13): finance  
  // Afternoon (13-16): technology
  // Late afternoon (16-19): ai
  // Evening (19-22): entertainment
  // Night: random from all
  if (hour >= 6 && hour < 10) return 'education';
  if (hour >= 10 && hour < 13) return 'finance';
  if (hour >= 13 && hour < 16) return 'technology';
  if (hour >= 16 && hour < 19) return 'ai';
  if (hour >= 19 && hour < 22) return 'entertainment';
  
  return GENRES[Math.floor(Math.random() * GENRES.length)];
}

export async function fetchArticlesByGenre(genre: Genre): Promise<Article[]> {
  const url = `${process.env.NEWSLETTER_API_URL}/content/articles/latest?genre=${genre}`;
  
  try {
    const response = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${process.env.NEWSLETTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}
