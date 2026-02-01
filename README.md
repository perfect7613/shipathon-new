# AI Newsletter Platform

An AI-powered newsletter platform with subscription tiers, content scraping from Twitter/Reddit/Instagram, AI content generation using Claude/Gemini, audio narration via ElevenLabs, and a Twitter bot using ElizaOS as a marketing funnel.

## Project Structure

```
├── ai-newsletter/          # Next.js frontend
├── backend/                # Express.js API server
├── eliza-bot/             # ElizaOS Twitter bot
└── supabase/              # Database migrations
```

## Features

- **5 Content Genres**: Education, Finance, Entertainment, Technology, AI
- **AI Content Generation**: Claude and Gemini for article creation
- **Audio Narration**: ElevenLabs text-to-speech
- **Content Scraping**: Apify integration for Twitter, Reddit, Instagram
- **Subscription Management**: Dodo Payments integration
- **Twitter Bot**: ElizaOS-powered marketing funnel

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm or npm
- Redis (for job queue)
- Supabase account
- API keys for: Anthropic, Google AI, ElevenLabs, Apify, Dodo Payments, Twitter

### 1. Set up Supabase

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/`
3. Enable Email auth in Authentication settings

### 2. Configure Environment Variables

Copy the example env files:

```bash
cp ai-newsletter/.env.local.example ai-newsletter/.env.local
cp backend/.env.example backend/.env
cp eliza-bot/.env.example eliza-bot/.env
```

Fill in your API keys.

### 3. Install Dependencies

```bash
# Frontend
cd ai-newsletter && npm install

# Backend
cd ../backend && npm install

# ElizaOS Bot
cd ../eliza-bot && npm install
```

### 4. Run Development Servers

```bash
# Terminal 1: Frontend
cd ai-newsletter && npm run dev

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: ElizaOS Bot (optional)
cd eliza-bot && npm run dev
```

## Deployment

### Frontend (Vercel)

```bash
cd ai-newsletter
vercel
```

### Backend (Railway)

1. Connect your GitHub repo to Railway
2. Set environment variables
3. Deploy

### ElizaOS Bot (Railway/VPS)

The bot needs persistent connection, deploy to Railway or a dedicated VPS.

## API Endpoints

### Backend API

- `GET /api/content/articles` - List articles
- `GET /api/content/articles/latest` - Get latest articles
- `POST /api/content/articles` - Create article
- `POST /api/scraping/scrape/:genre` - Trigger scraping
- `POST /api/generation/article/:genre` - Generate article
- `POST /api/generation/narration/:articleId` - Generate audio

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, TypeScript
- **Backend**: Express.js, BullMQ, Redis
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude (Anthropic), Gemini (Google)
- **Audio**: ElevenLabs
- **Scraping**: Apify
- **Payments**: Dodo Payments
- **Bot**: ElizaOS

## License

MIT
