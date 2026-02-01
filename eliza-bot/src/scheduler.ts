import cron from 'node-cron';
import type { IAgentRuntime } from '@elizaos/core';

type PostAction = (runtime: IAgentRuntime) => Promise<unknown>;

export function setupScheduler(runtime: IAgentRuntime, postAction: PostAction) {
  console.log('Setting up tweet scheduler...');
  
  // Post article thread (testing at 6:50pm, then change back to '0 9,13,18 * * *' for 9am, 1pm, 6pm)
  cron.schedule('50 18 * * *', async () => {
    console.log('Scheduled post triggered');
    await postAction(runtime);
  });
  
  // Engage with mentions every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    console.log('Checking mentions...');
    // ElizaOS handles this automatically via plugin-twitter
    // This is just for logging
  });
  
  // Clear old posted article IDs daily at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('Clearing posted article cache');
    postedArticleIds.clear();
  });
  
  console.log('Tweet scheduler initialized');
}

export function stopScheduler() {
  // Stop all scheduled jobs
  cron.getTasks().forEach(task => task.stop());
  console.log('Scheduler stopped');
}
