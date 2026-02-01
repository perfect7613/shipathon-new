import type { Action, IAgentRuntime } from '@elizaos/core';

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  genre: string;
}

const GENRE_HASHTAGS: Record<string, string[]> = {
  education: ['#EdTech', '#OnlineLearning', '#Education'],
  finance: ['#Fintech', '#Investing', '#Finance'],
  entertainment: ['#Entertainment', '#Streaming', '#PopCulture'],
  technology: ['#Tech', '#Startups', '#Programming'],
  ai: ['#AI', '#MachineLearning', '#DeepLearning'],
};

export const postArticleThreadAction: Action = {
  name: 'POST_ARTICLE_THREAD',
  description: 'Creates and posts a Twitter thread from an article',
  similes: ['post thread', 'tweet article', 'share content'],
  
  async validate(runtime: IAgentRuntime): Promise<boolean> {
    return !!(
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET_KEY &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_TOKEN_SECRET
    );
  },

  async handler(runtime: IAgentRuntime, message: unknown, state: unknown, options?: { article: Article }): Promise<{ success: boolean; tweetCount: number }> {
    const article = options?.article;
    
    if (!article) {
      console.error('No article provided');
      return { success: false, tweetCount: 0 };
    }
    
    try {
      // Generate thread using Claude via runtime
      const threadPrompt = `Create a 4-5 tweet thread summarizing this article. 
Make it engaging and include a CTA to read more at the newsletter.

Article Title: ${article.title}
Summary: ${article.summary}
Genre: ${article.genre}

Requirements:
- Each tweet must be under 280 characters
- First tweet should be a hook that grabs attention
- Include relevant insights from the content
- Use 1-2 hashtags from: ${GENRE_HASHTAGS[article.genre]?.join(', ')}
- End with a clear CTA to subscribe to the newsletter

Format your response as a JSON array of strings, each string being one tweet.
Example: ["Tweet 1 content", "Tweet 2 content", "Tweet 3 content"]`;

      // Use the runtime's LLM to generate the thread
      const response = await runtime.completion({
        context: threadPrompt,
        stop: [],
      });
      
      // Parse the thread
      let tweets: string[] = [];
      try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          tweets = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Fallback: split by newlines if JSON parsing fails
        tweets = response.split('\n').filter(t => t.trim().length > 0 && t.length <= 280);
      }
      
      if (tweets.length === 0) {
        console.error('Failed to generate tweets');
        return { success: false, tweetCount: 0 };
      }
      
      // Check for dry run mode
      if (process.env.TWITTER_DRY_RUN === 'true') {
        console.log('DRY RUN - Would post thread:');
        tweets.forEach((tweet, i) => console.log(`  ${i + 1}. ${tweet}`));
        return { success: true, tweetCount: tweets.length };
      }
      
      // Post the thread via Twitter client
      // Note: This assumes the Twitter plugin handles threading
      const twitterClient = runtime.clients?.twitter;
      
      if (!twitterClient) {
        console.error('Twitter client not available');
        return { success: false, tweetCount: 0 };
      }
      
      // Post each tweet as a thread
      let previousTweetId: string | null = null;
      
      for (const tweet of tweets) {
        const posted = await twitterClient.post({
          text: tweet,
          reply: previousTweetId ? { in_reply_to_tweet_id: previousTweetId } : undefined,
        });
        
        previousTweetId = posted.id;
      }
      
      console.log(`Posted thread with ${tweets.length} tweets`);
      return { success: true, tweetCount: tweets.length };
    } catch (error) {
      console.error('Error posting thread:', error);
      return { success: false, tweetCount: 0 };
    }
  },
  
  examples: [
    [
      {
        user: 'system',
        content: { text: 'Post a thread about the latest AI article' },
      },
      {
        user: 'AINewsBot',
        content: { text: 'Creating and posting thread...', action: 'POST_ARTICLE_THREAD' },
      },
    ],
  ],
};

// Helper to generate a single promotional tweet
export async function generatePromotionalTweet(runtime: IAgentRuntime, genre: string): Promise<string> {
  const hashtags = GENRE_HASHTAGS[genre] || ['#Newsletter'];
  
  const prompt = `Generate a single promotional tweet for our AI-powered newsletter.
Genre focus: ${genre}
Hashtags to use: ${hashtags.slice(0, 2).join(' ')}

The tweet should:
- Be under 280 characters
- Encourage people to subscribe
- Be engaging and not too salesy
- Include the hashtags

Return ONLY the tweet text, nothing else.`;

  const response = await runtime.completion({
    context: prompt,
    stop: [],
  });
  
  return response.trim();
}
