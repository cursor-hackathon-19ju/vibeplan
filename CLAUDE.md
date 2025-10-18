# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VibePlan is an AI-powered activity recommendation tool for Singapore built with Next.js 14. It helps users discover personalized weekend activities based on preferences, budget, and vibe using AI and real-time web search.

## Development Commands

### Setup & Development
```bash
npm install              # Install dependencies
npm run dev             # Start dev server on http://localhost:3000
npm run build           # Build for production
npm start               # Run production build
npm run lint            # Lint code with ESLint
```

### Environment Setup
Required environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `EXA_API_KEY` - Exa API for web search
- `OPENAI_API_KEY` - OpenAI API (planned integration)
- `GOOGLE_MAPS_API_KEY` - Google Maps API
- `CHROMA_DB_URL` - ChromaDB connection (planned RAG system)
- `TELEGRAM_API_ID` - Telegram API (planned social media integration)
- `TELEGRAM_API_HASH` - Telegram API hash

## Architecture

### Tech Stack
- **Framework**: Next.js 14+ App Router with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth**: Supabase Auth with Google OAuth
- **Database**: Supabase (PostgreSQL)
- **State Management**: Jotai for client-side state
- **Search**: Exa.ai API for real-time activity discovery
- **Maps**: Google Maps API (@vis.gl/react-google-maps)
- **Future**: ChromaDB RAG, OpenAI, Telegram integration

### Authentication Flow
- **Client**: `createClient()` from `@/lib/supabase.ts` for browser components
- **Server**: `createServerSupabaseClient()` from `@/lib/supabase-server.ts` for Server Components and API routes
- **Middleware**: `middleware.ts` handles session refresh on all routes (except static assets)
- Auth is managed through Supabase Auth with Google OAuth provider

### State Management with Jotai
Key atoms in `src/lib/atoms.ts`:
- `historyItemsAtom` - Recent 3 searches (sidebar)
- `fullHistoryAtom` - Complete search history (history page)
- `userAtom` - Current authenticated user
- `fetchHistoryAtom` - Async action to fetch user's history
- `fetchFullHistoryAtom` - Async action for full history
- `addHistoryItemAtom` - Add new history item

### Database Schema
Table: `public.itineraries`
- Stores user search parameters and generated itineraries
- RLS policies: users can only access their own itineraries OR public ones
- Key columns:
  - Search params: `query`, `activities[]`, `budget` (0-4), `num_pax`, `mbti`, `spicy`, `start_date`, `end_date`
  - Result: `itinerary_data` (JSONB containing title, summary, activities array)
  - Visibility: `public` (boolean for sharing)
- Run migration: Execute `supabase-migration-itineraries.sql` in Supabase SQL Editor

### API Routes

#### POST `/api/generate`
Generates activity recommendations and saves to database.

**Request Body:**
```typescript
{
  query: string           // User's natural language query
  activities: string[]    // Selected activity types (Outdoor, Food, Artsy, etc.)
  budget: number         // 0-4 (0=<$30, 4=$100+)
  numPax: string         // Number of people
  mbti?: string          // Optional MBTI personality type
  spicy?: boolean        // Include nightlife/drinks
  startDate?: string     // ISO date string
  endDate?: string       // ISO date string
}
```

**Response:**
```typescript
{
  itineraryId: string    // Database ID
  title: string
  summary: {
    intro: string
    description: string
    budget: string
    duration: string
    area: string
    perks: string
  }
  activities: Array<{
    id: number
    time: string
    title: string
    description: string
    location: string
    price: string
    discount?: string
    coordinates: { lat: number, lng: number }
  }>
}
```

**Current Implementation:**
- Uses Exa.ai API to search for Singapore activities (30-day window)
- Generates structured activity summaries via Exa's schema feature
- Currently returns mock itinerary data (lines 122-191)
- Saves to Supabase `itineraries` table
- TODO: Replace mock data with AI-generated recommendations using OpenAI + RAG

### Page Structure
- `/` - Home page with FilterOptions form
- `/login` - Login page with Google OAuth
- `/signup` - Signup page
- `/profile` - User profile page
- `/history` - Full search history (uses `fullHistoryAtom`)
- `/results` - Display generated itinerary with map
- `/loading` - Loading animation during generation
- `/about` - About page
- `/auth/callback` - OAuth callback handler

### Component Architecture
- `FilterOptions.tsx` - Main search form with all filters
- `Sidebar.tsx` - Desktop navigation with recent history
- `MobileNav.tsx` - Mobile responsive navigation
- `ActivityCard.tsx` - Individual activity display card
- `TimelineActivity.tsx` - Activity in timeline format
- `ItineraryMap.tsx` - Google Maps integration for showing activity locations
- `components/ui/*` - shadcn/ui component library

### Styling
- Uses custom color scheme defined in `tailwind.config.ts`
- Fonts: Instrument Sans (body) + Instrument Serif (emphasis)
- Custom gradients: `gradient-accent` and `gradient-accent-hover`
- Dark mode support via `class` strategy (not yet implemented)

## Important Patterns

### Supabase Client Usage
- **Client Components**: Use `createClient()` from `@/lib/supabase.ts`
- **Server Components/API Routes**: Use `createServerSupabaseClient()` from `@/lib/supabase-server.ts`
- Never use browser client in server contexts

### TypeScript Path Aliases
- `@/*` maps to `src/*` (configured in tsconfig.json)
- Use absolute imports: `import { createClient } from '@/lib/supabase'`

### Adding New Activity Sources
When extending the Exa search or adding data sources:
1. Refine the query in `/api/generate` (line 34)
2. Update the schema structure (lines 51-74)
3. Process and map results to itinerary format
4. Consider adding to RAG pipeline (ChromaDB) for semantic search

### Working with Itinerary Data
The `itinerary_data` JSONB column is flexible but should maintain structure:
- Top level: `{ title, summary, activities }`
- Activities must include: `id, time, title, description, location, price, coordinates`
- Optional fields: `discount, imageUrl`

## Future Development Notes

### Planned Features (from README)
- AI-generated recommendations using OpenAI GPT
- RAG system with ChromaDB for semantic activity matching
- Web scraping with Selenium for venue data
- Telegram integration (Telethon) for trending activities
- Save to favorites
- Share plans with friends
- Calendar export
- User reviews and ratings
- Weather-based recommendations

### Integration Points
- OpenAI API key is configured but not yet integrated (will replace mock data)
- ChromaDB URL configured for RAG system (not implemented)
- Telegram API credentials ready for social monitoring

## Common Issues

### Supabase RLS Policies
If queries fail with permission errors, check RLS policies in `supabase-migration-itineraries.sql`. Users must be authenticated to create/view their itineraries.

### Next.js Image Configuration
Remote images are allowed from all domains (`hostname: '**'`) in `next.config.js`. Be mindful of security if restricting in production.

### Middleware Execution
Middleware runs on all routes except static assets. If auth is failing, verify Supabase credentials in environment variables.
