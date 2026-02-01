import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { contentRouter } from './routes/content.js';
import { scrapingRouter } from './routes/scraping.js';
import { generationRouter } from './routes/generation.js';
import { initializeWorkers } from './jobs/queue.js';

const app = express();

// CORS configuration - allow frontend origins
app.use(cors({
  origin: [
    'http://localhost:3000',  // Next.js dev server
    'http://localhost:3001',  // Alternative port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    ...(env.FRONTEND_URL ? [env.FRONTEND_URL] : []),
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/content', contentRouter);
app.use('/api/scraping', scrapingRouter);
app.use('/api/generation', generationRouter);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);

  // Initialize background workers
  initializeWorkers().then(() => {
    console.log('✅ Background workers initialized');
  }).catch((err) => {
    console.error('❌ Failed to initialize workers:', err);
  });
});

export default app;
