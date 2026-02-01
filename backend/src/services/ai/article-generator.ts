import Anthropic from '@anthropic-ai/sdk';
import { supabase, type Genre, GENRES, type ScrapedContent } from '../../lib/supabase.js';
import { env } from '../../config/env.js';

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

// Freepik API configuration
const FREEPIK_API_KEY = process.env.FREEPIK_API;
const FREEPIK_BASE_URL = 'https://api.freepik.com';

// Freepik task status type
interface FreepikTask {
  task_id: string;
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  generated?: string[];
}

// Ensure images bucket exists
async function ensureImagesBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const imagesBucket = buckets?.find(b => b.name === 'images');

  if (!imagesBucket) {
    console.log('Creating images storage bucket...');
    const { error } = await supabase.storage.createBucket('images', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
    });

    if (error && !error.message.includes('already exists')) {
      console.error('Failed to create images bucket:', error);
      throw error;
    }
    console.log('Images bucket created successfully');
  }
}

// Poll for Freepik task completion
async function pollFreepikTask(taskId: string, maxAttempts = 30, intervalMs = 2000): Promise<string[]> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${FREEPIK_BASE_URL}/v1/ai/text-to-image/z-image/${taskId}`, {
      headers: {
        'x-freepik-api-key': FREEPIK_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check task status: ${response.statusText}`);
    }

    const result = await response.json() as { data: FreepikTask };
    const taskData = result.data;

    if (taskData.status === 'COMPLETED' && taskData.generated) {
      return taskData.generated;
    }

    if (taskData.status === 'FAILED') {
      throw new Error(`Image generation task failed`);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Image generation timed out');
}

// Generate article cover image using Freepik Z-Image API
async function generateArticleImage(title: string, genre: Genre): Promise<string | null> {
  try {
    if (!FREEPIK_API_KEY) {
      console.log('FREEPIK_API not configured, skipping image generation');
      return null;
    }

    // Create a prompt for the image based on title and genre
    const imagePrompts: Record<Genre, string> = {
      education: 'minimalist illustration, books and knowledge, soft colors, modern design',
      finance: 'abstract financial visualization, charts and growth, professional, blue and green tones',
      entertainment: 'vibrant pop art style, dynamic and colorful, entertainment media collage',
      technology: 'futuristic tech visualization, circuits and innovation, sleek modern design, blue neon',
      ai: 'artificial intelligence visualization, neural networks, digital brain, purple and blue gradients'
    };

    const prompt = `${title}, ${imagePrompts[genre]}, high quality, professional newsletter cover art, no text`;

    console.log(`Generating image for: "${title.slice(0, 50)}..."`);

    // Submit image generation task to Freepik
    const response = await fetch(`${FREEPIK_BASE_URL}/v1/ai/text-to-image/z-image`, {
      method: 'POST',
      headers: {
        'x-freepik-api-key': FREEPIK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'landscape_16_9', // Perfect for newsletter covers
        num_inference_steps: 8, // Optimal for Z-Image turbo
        output_format: 'png',
        enable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Freepik API error: ${response.statusText}`);
    }

    const result = await response.json() as { data: FreepikTask };
    const taskData = result.data;

    console.log(`Task created: ${taskData.task_id}, polling for completion...`);

    // Poll for task completion
    const imageUrls = await pollFreepikTask(taskData.task_id);

    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('No images generated');
    }

    // Download the generated image
    const imageResponse = await fetch(imageUrls[0]);
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image');
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Ensure bucket exists
    await ensureImagesBucket();

    // Upload to Supabase Storage
    const filename = `article-${Date.now()}.png`;
    const { error } = await supabase.storage
      .from('images')
      .upload(filename, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filename);

    console.log(`Image generated and uploaded: ${filename}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error generating article image:', error);
    return null;
  }
}

// Genre-specific prompts and tone
const GENRE_PROMPTS: Record<Genre, { tone: string; focus: string; personality: string }> = {
  education: {
    tone: 'informative yet witty, like a brilliant friend explaining things over coffee',
    focus: 'learning opportunities, skill development, educational trends, and practical knowledge',
    personality: 'Think "cool professor who makes you actually want to learn" - use clever analogies, sprinkle in unexpected references, and make complex ideas feel like aha moments'
  },
  finance: {
    tone: 'sharp, clever, and refreshingly honest about money',
    focus: 'market trends, investment insights, fintech innovations, and personal finance tips',
    personality: 'Channel Morning Brew energy - make finance feel like gossip worth knowing. Use punchy one-liners, witty observations, and the occasional self-aware joke about spreadsheets'
  },
  entertainment: {
    tone: 'playfully snarky, culturally plugged-in, and genuinely enthusiastic',
    focus: 'streaming releases, gaming news, celebrity updates, and pop culture trends',
    personality: 'Write like you\'re texting your group chat about the latest drama - use tasteful snark, hot takes, and the perfect GIF-worthy moments (describe them vividly)'
  },
  technology: {
    tone: 'geeky-cool, insightful, with a healthy dose of Silicon Valley skepticism',
    focus: 'startup news, product launches, programming trends, and silicon valley updates',
    personality: 'Be the tech-savvy friend who cuts through the hype. Mix genuine excitement for innovation with witty commentary on buzzword bingo and VC theater'
  },
  ai: {
    tone: 'intellectually curious, slightly irreverent, and refreshingly honest about the hype',
    focus: 'AI research breakthroughs, LLM developments, machine learning applications, and industry implications',
    personality: 'Channel the energy of a researcher who\'s also terminally online - mix technical depth with memes-aware humor. Acknowledge both the magic and the chaos of AI'
  }
};

export interface GeneratedArticle {
  title: string;
  summary: string;
  content: string;
  keyInsights: string[];
  sources: string[];
  imageUrl?: string | null;
}

export async function generateArticle(
  scrapedContent: ScrapedContent[],
  genre: Genre,
  options?: { customTopic?: string }
): Promise<GeneratedArticle> {
  const { tone, focus, personality } = GENRE_PROMPTS[genre];

  // Extract relevant data from scraped content
  const contentSummary = scrapedContent.map(c => {
    const data = c.raw_data as { items?: unknown[]; source?: string };
    return {
      platform: c.platform,
      source: data.source,
      itemCount: data.items?.length || 0,
      sampleItems: (data.items || []).slice(0, 5),
    };
  });

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `You are a world-class newsletter writer with the wit of a late-night host and the insight of an industry expert. Your writing is the kind people screenshot and share.

GENRE: ${genre}
VOICE & TONE: ${tone}
FOCUS AREAS: ${focus}

YOUR WRITING PERSONALITY:
${personality}

WRITING STYLE GUIDELINES:
- Open with a hook that makes readers stop scrolling
- Use short, punchy paragraphs (this isn't academic writing)
- Sprinkle in clever wordplay, unexpected analogies, and cultural references
- Include at least one "lol that's so true" moment per section
- Balance substance with style - be smart AND entertaining
- Write like you're the smartest person at the party who's also the most fun
- Avoid corporate jargon like it's a disease
- Use em-dashes liberally—they're your friend
- End sections with zingers or thought-provoking questions

Create an engaging newsletter article based on these trending topics and sources:
${JSON.stringify(contentSummary, null, 2)}

${options?.customTopic ? `User requested topic: ${options.customTopic}` : ''}

ARTICLE STRUCTURE:
1. HEADLINE: Clever, click-worthy (but not clickbait), ideally with wordplay
2. SUMMARY: 2-3 sentences that make readers NEED to keep reading
3. CONTENT: Use markdown formatting with ## headers for sections
   - Opening hook (1 paragraph that grabs attention)
   - 3-4 key insights with witty section headers
   - Relevant quotes, stats, or data points woven naturally
   - Closing thought that sticks with readers
4. KEY INSIGHTS: The "too long; didn't read" bullet points
5. SOURCES: Relevant URLs from the scraped content

Format the response as JSON:
{
  "title": "Your Clever Headline Here",
  "summary": "The hook that makes them click...",
  "content": "## Section Header\\n\\nYour witty content here...",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "sources": ["url1", "url2"]
}

IMPORTANT: Return ONLY valid JSON, no other text. Make it genuinely fun to read.`
    }]
  });

  const textContent = response.content[0];
  if (textContent.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  let article: GeneratedArticle;

  try {
    // Try to parse the JSON response
    article = JSON.parse(textContent.text);
  } catch (error) {
    // If parsing fails, try to extract JSON from the response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      article = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse article generation response');
    }
  }

  // Generate cover image for the article
  console.log('Generating cover image...');
  const imageUrl = await generateArticleImage(article.title, genre);
  article.imageUrl = imageUrl;

  return article;
}

// Generate articles for all genres
export async function generateDailyArticles() {
  console.log('Starting daily article generation...');
  const articles: Array<{ genre: Genre } & GeneratedArticle> = [];

  for (const genre of GENRES) {
    try {
      // Get unprocessed scraped content for this genre
      const { data: scrapedContent, error } = await supabase
        .from('scraped_content')
        .select('*')
        .eq('genre', genre)
        .eq('processed', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error(`Error fetching scraped content for ${genre}:`, error);
        continue;
      }

      if (!scrapedContent || scrapedContent.length === 0) {
        console.log(`No unprocessed content for genre: ${genre}`);
        continue;
      }

      console.log(`Generating article for ${genre}...`);
      const article = await generateArticle(scrapedContent as ScrapedContent[], genre);
      articles.push({ genre, ...article });

      // Mark scraped content as processed
      await supabase
        .from('scraped_content')
        .update({ processed: true })
        .in('id', scrapedContent.map(c => c.id));

      console.log(`Article generated for ${genre}: ${article.title}`);
    } catch (error) {
      console.error(`Error generating article for ${genre}:`, error);
    }
  }

  console.log(`Daily article generation completed. Generated ${articles.length} articles.`);
  return articles;
}
