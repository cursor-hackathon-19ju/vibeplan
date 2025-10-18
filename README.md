# VibePlan

AI that plans your weekend in Singapore 🎉

## Overview

VibePlan is an AI-powered activity recommendation tool that helps you discover the perfect things to do in Singapore. Whether you're planning a budget date, a family weekend, or just looking for something fun to do, VibePlan personalizes recommendations based on your preferences, budget, and vibe.

## Features

- 🤖 **AI-Powered Recommendations** - Get personalized activity suggestions based on your preferences
- 💰 **Budget-Aware** - Filter activities from "Broke Student" to "Atas Boss" budgets
- 🎨 **Multiple Activity Types** - Outdoor, Sports, Shopping, Food, Museums, Thrift Stores, Artsy venues, and Games
- 👥 **Group Size Support** - Plan for solo adventures or group activities
- 🧠 **MBTI Matching** - Optional personality-based recommendations
- 🌶️ **Spicy Option** - Include nightlife and drinks recommendations
- 📅 **Date Range Selection** - Plan activities for specific dates
- 📱 **Responsive Design** - Optimized for both desktop and mobile
- 🔐 **Google Authentication** - Sign in with your Google account via Supabase
- 📜 **Search History** - Keep track of your past searches

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Fonts**: Instrument Sans (body) & Instrument Serif (emphasis)
- **Icons**: Lucide React

### Backend & AI
- **Database**: Supabase (PostgreSQL)
- **Vector Database**: ChromaDB for RAG (Retrieval-Augmented Generation)
- **AI/LLM**: OpenAI GPT models for activity recommendations
- **Search Engine**: Exa API for real-time content discovery
- **Web Scraping**: Selenium for automated data collection
- **Telegram Integration**: Telethon for social media data extraction

### APIs & Services
- **Maps**: Google Maps API for location services
- **Authentication**: Google OAuth via Supabase
- **Real-time Data**: Exa API for current activity information
- **Social Media**: Telegram API integration for trending activities

### Data Pipeline
- **RAG System**: ChromaDB + OpenAI for intelligent activity matching
- **Web Scraping**: Selenium for automated venue data collection
- **Social Monitoring**: Telethon for real-time social media trends
- **Content Curation**: AI-powered activity database management

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Python 3.9+ installed
- pip (Python package manager)
- A Supabase account (free tier works!)
- OpenAI API key
- Exa API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vibeplan.git
cd vibeplan
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
pip3 install -r requirements.txt
```

4. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI & Search APIs
EXA_API_KEY=your_exa_api_key
OPENAI_API_KEY=your_openai_api_key

# Google Services (Optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Social Media & Scraping (Optional)
TELEGRAM_API_ID=your_telegram_api_id
TELEGRAM_API_HASH=your_telegram_api_hash
```

See the [Supabase Setup](#supabase-setup) section below for detailed instructions.

### Running the Application

VibePlan requires **two servers** to run:

1. **ChromaDB FastAPI Bridge** (Port 8001) - Handles vector database queries
2. **Next.js Development Server** (Port 3000) - Main web application

#### Option 1: Run in Separate Terminals (Recommended)

**Terminal 1 - ChromaDB FastAPI Bridge:**
```bash
python3 chromadb_api.py
```

**Terminal 2 - Next.js Server:**
```bash
npm run dev
```

#### Option 2: Run in Background

**Start ChromaDB Bridge in background:**
```bash
python3 chromadb_api.py &
```

**Start Next.js:**
```bash
npm run dev
```

Once both servers are running, open [http://localhost:3000](http://localhost:3000) in your browser.

**Health Check:**
- Next.js: http://localhost:3000
- ChromaDB API: http://localhost:8001/health

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in your project details:
   - Project name: `vibeplan` (or any name you prefer)
   - Database password: Create a strong password
   - Region: Choose the closest to your users (e.g., Singapore)
4. Click "Create new project"

### 2. Get Your API Credentials

1. Once your project is created, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
3. Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Configure Google OAuth

To enable Google sign-in:

1. Go to **Authentication** > **Providers** in your Supabase dashboard
2. Find "Google" in the list and click to configure
3. Toggle "Enable Google provider" to ON
4. You'll need to create OAuth credentials in Google Cloud Console:

#### Setting up Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. Choose **Web application** as the application type
7. Add the following to **Authorized redirect URIs**:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
8. Copy the **Client ID** and **Client Secret**
9. Paste them into the Supabase Google provider settings
10. Click "Save"

### 4. Configure Auth Settings

1. Go to **Authentication** > **URL Configuration**
2. Add your site URL (for development: `http://localhost:3000`)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (for development)
   - Add your production URL when deploying

## ChromaDB Integration

VibePlan uses a **FastAPI bridge** to access ChromaDB from Next.js, bypassing webpack compatibility issues.

### Architecture

```
User Request → Next.js API → FastAPI Bridge → ChromaDB → OpenAI Embeddings
                     ↓                              ↓
                Exa Search                    Vector Search
                     ↓                              ↓
                     └──────── LLM Curator ────────┘
                                  ↓
                            Final Itinerary
```

### How It Works

1. **Semantic Keywords**: User preferences (MBTI, budget, group size) are enriched into semantic keywords
2. **Dual Data Sources**:
   - **ChromaDB**: 381 curated activities from Telegram scraping (15 results)
   - **Exa API**: Real-time web search for fresh content (5 results)
3. **LLM Curation**: GPT-4o selects 4-6 best activities and creates timeline
4. **Enhancement**: AI estimates prices and generates engaging summaries

### Files

- `chromadb_api.py` - FastAPI bridge server (port 8001)
- `src/app/api/generate/utils/chromaClient.ts` - HTTP client for ChromaDB API
- `src/app/api/generate/utils/keywords.ts` - Semantic keyword builder
- `src/app/api/generate/utils/llmCurator.ts` - GPT-4o activity curation
- `test_chroma_api.py` - Test script for semantic search
- `requirements.txt` - Python dependencies

## Project Structure

```
vibeplan/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── about/             # About page
│   │   ├── api/               # API routes
│   │   │   └── generate/      # Activity generation endpoint
│   │   │       └── utils/     # ChromaDB, LLM, keywords utilities
│   │   ├── auth/              # Auth callback
│   │   ├── history/           # Search history page
│   │   ├── loading/           # Loading page with animation
│   │   ├── login/             # Login page
│   │   ├── profile/           # User profile page
│   │   ├── results/           # Activity results page
│   │   ├── signup/            # Signup page
│   │   ├── layout.tsx         # Root layout with fonts
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── ActivityCard.tsx   # Activity display card
│   │   ├── FilterOptions.tsx  # Search filters component
│   │   ├── MobileNav.tsx      # Mobile navigation
│   │   └── Sidebar.tsx        # Desktop sidebar
│   └── lib/
│       ├── supabase.ts        # Supabase client
│       ├── supabase-server.ts # Supabase server client
│       └── utils.ts           # Utility functions
├── data/
│   └── chroma_db/             # ChromaDB persistent storage
├── chromadb_api.py            # FastAPI bridge for ChromaDB
├── requirements.txt           # Python dependencies
├── test_chroma_api.py         # ChromaDB query testing
├── test_chroma_queries.ipynb  # Jupyter notebook for analysis
├── middleware.ts              # Auth middleware
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Node.js dependencies
```

## Usage

### Planning an Activity

1. Navigate to the home page
2. **Optional filters**:
   - Select activity types (Outdoor, Food, Artsy, etc.)
   - Choose number of people
   - Set your budget using the slider
   - Select your MBTI type
   - Toggle spicy option for nightlife
   - Pick a date range
3. **Required**: Describe what you're looking for in the search box
4. Click the arrow button or press Enter
5. Watch the cooking animation while AI generates recommendations
6. Browse personalized activity cards with details

### Sample Prompts

Try these prompts to get started:
- "Plan a date under $50 with food, something artsy, and outdoors."
- "Weekend brunch spots with good vibes for 4 people."
- "Chill activities for introverts under $30."
- "Adventurous outdoor activities with a spicy nightlife twist."

## AI & Data Pipeline

VibePlan uses a sophisticated AI pipeline to deliver personalized recommendations:

### RAG (Retrieval-Augmented Generation) System
- **Vector Database**: ChromaDB stores embeddings of activities and venues
- **Semantic Search**: Find similar activities based on user preferences
- **Context-Aware**: AI considers user's MBTI, budget, and activity history

### Real-time Data Collection
- **Web Scraping**: Selenium automates data collection from venue websites
- **Social Monitoring**: Telethon extracts trending activities from Telegram channels
- **Content Discovery**: Exa API finds fresh content and reviews
- **Maps Integration**: Google Maps API provides location data and directions

### AI Processing Pipeline
1. **User Input Analysis**: Parse preferences, budget, and natural language query
2. **Vector Search**: Query ChromaDB for semantically similar activities
3. **Content Enrichment**: Combine with real-time data from Exa and social media
4. **LLM Generation**: OpenAI GPT creates personalized recommendations
5. **Ranking & Filtering**: AI ranks activities by relevance and user preferences

Example API response format:
```json
{
  "activities": [
    {
      "id": 1,
      "name": "Activity Name",
      "description": "Activity description",
      "category": "Food",
      "price": "$20 per person",
      "duration": "2-3 hours",
      "location": "Location name",
      "pax": "2 people",
      "tags": ["Tag1", "Tag2"],
      "imageUrl": "https://image-url.com"
    }
  ],
  "query": "user search query"
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

Don't forget to update your Supabase auth settings with your production URL.

## Development

### Build for Production

```bash
npm run build
```

### Run Production Build Locally

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

## Environment Variables

Required environment variables:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ Yes | `eyJhbGc...` |
| `EXA_API_KEY` | Exa API key for content search | ✅ Yes | `c7f153...` |
| `OPENAI_API_KEY` | OpenAI API key for AI processing | ✅ Yes | `sk-...` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | ❌ No | `AIza...` |
| `TELEGRAM_API_ID` | Telegram API ID | ❌ No | `12345678` |
| `TELEGRAM_API_HASH` | Telegram API hash | ❌ No | `abcdef...` |

**Note**: The ChromaDB connection is handled automatically by the FastAPI bridge on `localhost:8001`. No separate configuration needed.

## Future Enhancements

- [ ] Save activities to favorites
- [ ] Share activity plans with friends
- [ ] Export plans to calendar
- [ ] More detailed activity information
- [ ] User reviews and ratings
- [ ] Real-time availability checking
- [ ] Weather-based recommendations
- [ ] Map integration
- [ ] Mobile app (React Native)

## Troubleshooting

### ChromaDB API Connection Issues

**Problem**: `Connection refused` or `fetch failed` errors

**Solutions**:
1. Make sure the FastAPI bridge is running: `python3 chromadb_api.py`
2. Check if port 8001 is available: `lsof -i :8001`
3. Verify the health endpoint: `curl http://localhost:8001/health`

### Python Import Errors

**Problem**: `ModuleNotFoundError` for fastapi, chromadb, etc.

**Solution**:
```bash
pip3 install -r requirements.txt
```

### OpenAI API Key Not Found

**Problem**: `OPENAI_API_KEY not found` error

**Solutions**:
1. Make sure `.env.local` exists in the root directory
2. Verify the key is set correctly in `.env.local`
3. Restart both servers after updating `.env.local`

### ChromaDB Collection Not Found

**Problem**: `Collection 'telegram_activities' not found`

**Solution**: You need the pre-populated ChromaDB database. Contact the repo maintainers or populate it using the Telegram scraping scripts.

### Port Already in Use

**Problem**: `Port 3000 is already in use` or `Port 8001 is already in use`

**Solutions**:
```bash
# For Next.js (port 3000)
lsof -ti:3000 | xargs kill -9

# For FastAPI (port 8001)
lsof -ti:8001 | xargs kill -9
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)

---

Made with ❤️ for the Singapore community
