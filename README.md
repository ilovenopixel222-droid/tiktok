# ClipViral — AI-Powered Viral Clip Generator

> Turn long-form streams, podcasts, and videos into viral TikTok, Reels, and Shorts clips automatically with AI.

![ClipViral](https://img.shields.io/badge/ClipViral-AI%20Powered-8b5cf6?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06b6d4?style=for-the-badge)

## Overview

ClipViral is a full-featured AI SaaS platform that automatically detects viral moments from long-form content (streams, podcasts, interviews, IRL videos) and generates optimized short-form clips for TikTok, Instagram Reels, YouTube Shorts, and Facebook Reels.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **UI**: Framer Motion, Lucide Icons, Glassmorphism Design
- **State Management**: Zustand
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL via Supabase (schema included)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Video Processing**: FFmpeg (serverless)
- **AI**: OpenAI, Google Gemini, Anthropic Claude
- **Storage**: Supabase Storage / AWS S3
- **Caching**: Redis
- **Deployment**: Vercel / AWS / Docker

## Features

### AI Clipping Engine
- Automatic moment detection (funny, emotional, shocking, arguments, viral hooks, etc.)
- Viral score prediction & retention scoring
- AI-generated hooks, titles, descriptions, hashtags, CTAs
- AI-generated thumbnails & social captions
- 18+ moment types detected automatically

### Video Editing Pipeline
- Automatic vertical reframing (9:16)
- Face tracking & speaker switching
- Auto zoom effects & dynamic camera movement
- Animated captions with 5+ viral presets
- Silence/dead-air removal
- Sound effects & background music
- B-roll, overlays, and meme-style edits
- Voice enhancement & noise removal

### Social Media Automation
- Auto-publish to TikTok, Instagram Reels, YouTube Shorts, Facebook Reels, X/Twitter
- Multi-account management
- Smart scheduling with AI-optimized posting times
- Content calendar with drag-and-drop
- Auto hashtag & title optimization

### Creator Dashboard
- Real-time analytics across all platforms
- Viral score tracking & retention analytics
- Video library & clip management
- Team collaboration with roles
- Storage management
- Billing & subscription management
- Dark/light mode

### SaaS Infrastructure
- Stripe subscription billing with credits
- Referral & affiliate system
- API keys & webhook support
- Rate limiting & security
- Admin dashboard
- Audit logging
- Two-factor authentication

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# AI APIs
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_anthropic_key

# Redis
REDIS_URL=your_redis_url

# Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Auth pages (login, signup, forgot-password)
│   ├── (dashboard)/         # Dashboard pages
│   │   └── dashboard/
│   │       ├── analytics/   # Analytics dashboard
│   │       ├── automation/  # Automation rules & integrations
│   │       ├── calendar/    # Content calendar & scheduling
│   │       ├── clips/       # Clip management
│   │       ├── library/     # Video library
│   │       ├── settings/    # Account settings
│   │       └── upload/      # Upload & create clips
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── clips/           # Clip CRUD & processing
│   │   └── upload/          # File upload handling
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── dashboard/           # Dashboard components
│   ├── landing/             # Landing page sections
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── database-schema.sql  # Complete PostgreSQL schema
│   └── utils.ts             # Utility functions
├── store/
│   └── app-store.ts         # Zustand state management
└── types/
    └── index.ts             # TypeScript type definitions
```

## Database Schema

The complete database schema is in `src/lib/database-schema.sql` and includes:
- Users & team management
- Source videos & clips
- Social media accounts & publishing
- Processing job queue
- Analytics tracking
- Automation rules
- Subscriptions & billing
- Notifications
- API keys & webhooks
- Branding presets
- Audit logging
- Row Level Security (RLS) policies
- Auto-updating timestamps

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App    │───▶│  API Routes      │───▶│  Supabase DB    │
│   (React/TS)     │    │  (Serverless)    │    │  (PostgreSQL)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              ┌──────────┐ ┌────────┐ ┌──────────┐
              │  AI APIs │ │ FFmpeg │ │  Storage │
              │ OpenAI   │ │ Cloud  │ │  S3/CDN  │
              │ Gemini   │ │ Worker │ │          │
              │ Claude   │ │        │ │          │
              └──────────┘ └────────┘ └──────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
              ┌──────────┐ ┌─────────┐ ┌──────────┐
              │  TikTok  │ │  Reels  │ │  Shorts  │
              │  API     │ │  API    │ │  API     │
              └──────────┘ └─────────┘ └──────────┘
```

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Docker
```bash
docker build -t clipviral .
docker run -p 3000:3000 clipviral
```

## License

MIT License - Built by ClipViral Team
