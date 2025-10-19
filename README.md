# VibePlan

AI that plans your weekend in Singapore 🎉

**🌐 Live App:** [https://vibeplan-app.vercel.app/](https://vibeplan-app.vercel.app/login)  
**🔌 API Endpoint:** [https://vibeplan-chromadb-api.onrender.com](https://vibeplan-chromadb-api.onrender.com)

## Overview

VibePlan is an AI-powered activity recommendation tool that helps you discover the perfect things to do in Singapore. Whether you're planning a budget date, a family weekend, or just looking for something fun to do, VibePlan personalizes recommendations based on your preferences, budget, and vibe.

**🔥 What sets VibePlan apart:** Unlike other AI planners that rely on Google or outdated listings, VibePlan taps directly into **live social media feeds** (Telegram, Instagram) to catch Singapore's hottest deals, hidden gems, and viral spots **as they appear**. Our automated data ingestion pipeline continuously scrapes, normalizes, and vectorizes trending content, so new pop-ups, 1-for-1 promos, or café launches surface within hours, not weeks.

## ✨ Try It Now

Visit the live app at **[vibeplan-app.vercel.app](https://vibeplan-app.vercel.app/)** and try these sample prompts:
- "Plan a date under $50 with food, something artsy, and outdoors."
- "Weekend brunch spots with good vibes for 4 people."
- "Chill activities for introverts under $30."
- "Adventurous outdoor activities with a spicy nightlife twist."

The app pulls from **500+ live activities** scraped from Singapore's social channels and combines them with real-time web search for the freshest recommendations!

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

- **Database**: Supabase (PostgreSQL) for user data
- **Vector Database**: ChromaDB for RAG (Retrieval-Augmented Generation)
- **AI/LLM**: OpenAI GPT-4o for curation, GPT-3.5-turbo for normalization
- **Search Engine**: Exa API for real-time content discovery
- **Embeddings**: OpenAI text-embedding-3-small for vector search

### Data Ingestion Pipeline

- **Telegram Scraping**: Telethon (asyncio-based Telegram API client)
- **Instagram Scraping**: Selenium + ChromeDriver for post content extraction
- **Content Normalization**: OpenAI GPT-3.5-turbo for LLM-based structuring
- **URL Processing**: Parallel URL expansion and link classification
- **Data Storage**: SQLAlchemy + SQLite for staging, ChromaDB for vector storage
- **Automation**: APScheduler for weekly batch scraping and daily processing

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

**🚀 Quick Start:** Try the live app at [vibeplan-app.vercel.app](https://vibeplan-app.vercel.app/) - no setup required!

**👨‍💻 For Developers:** Follow the instructions below to set up a local development environment.

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

- **Local Development:**
  - Next.js: http://localhost:3000
  - ChromaDB API: http://localhost:8001/health
- **Production:**
  - Website: https://vibeplan-app.vercel.app/
  - ChromaDB API: https://vibeplan-chromadb-api.onrender.com/health

### Running the Data Ingestion Pipeline

The data ingestion pipeline scrapes Telegram channels and Instagram posts to populate the ChromaDB with fresh activities.

#### One-Time Setup

```bash
cd data_ingestion

# Install Python dependencies
pip3 install -r requirements.txt

# Initialize database tables
python main.py setup

# Add Telegram channels to scrape
python main.py add-channel sgdeals
python main.py add-channel sgfoodie
python main.py add-channel sgcafehopping

# Or load channels from environment variable
# Set TELEGRAM_CHANNELS in .env first
python main.py load-channels
```

#### Manual Scraping (Testing)

```bash
# Run the scraping pipeline once
python main.py run-once

# Test specific components
python main.py test-telegram          # Test Telegram connection
python main.py test-instagram <url>   # Test Instagram scraping

# View statistics
python main.py stats                  # Show scraping statistics
python main.py list-channels          # List configured channels
```

#### Automated Scraping (Production)

```bash
# Start the automated scheduler (runs weekly)
python main.py start-scheduler

# This will:
# 1. Scrape Telegram channels every 168 hours (weekly)
# 2. Process and normalize content daily
# 3. Update ChromaDB with new activities
```

**Note**: The data ingestion pipeline requires:

- Valid Telegram API credentials (get from https://my.telegram.org)
- OpenAI API key for content normalization
- ChromeDriver for Instagram scraping (automatically managed)

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

### Full System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  DATA INGESTION (Background)                     │
├─────────────────────────────────────────────────────────────────┤
│  Telegram → Instagram → LLM Normalize → Embed → ChromaDB        │
│  (Daily batch scraping + daily processing)                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │    ChromaDB      │
                    │  500+ Activities │
                    │  Vector Storage  │
                    └────────┬─────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│              RECOMMENDATION ENGINE (Real-time)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Request → Next.js API → FastAPI Bridge → ChromaDB Search  │
│                      ↓                              ↓            │
│                 Exa Search                    Vector Search      │
│                   (5 results)                  (15 results)      │
│                      ↓                              ↓            │
│                      └───────── GPT-4o Curator ────┘            │
│                                   ↓                              │
│                          4-6 Final Activities                    │
│                           with Timeline                          │
└─────────────────────────────────────────────────────────────────┘
```

### How It Works

1. **Data Population** (Background):

   - Weekly: Scrape Telegram channels → Extract Instagram links → Scrape posts
   - Daily: Normalize content with GPT-3.5 → Generate embeddings → Store in ChromaDB
   - Result: Always-fresh database of 381+ activities from social sources

2. **User Query** (Real-time):
   - **Semantic Keywords**: User preferences (MBTI, budget, group size) enriched into semantic keywords
   - **Dual Data Sources**:
     - **ChromaDB**: 15 curated activities from social data (Telegram + Instagram)
     - **Exa API**: 5 real-time web results for fresh content
   - **LLM Curation**: GPT-4o selects 4-6 best activities and creates timeline
   - **Enhancement**: AI estimates prices and generates engaging summaries

### Files

- `chromadb_api.py` - FastAPI bridge server (port 8001 locally, deployed on Render)
- `src/app/api/generate/utils/chromaClient.ts` - HTTP client for ChromaDB API
- `src/app/api/generate/utils/keywords.ts` - Semantic keyword builder
- `src/app/api/generate/utils/llmCurator.ts` - GPT-4o activity curation
- `test_chroma_api.py` - Test script for semantic search
- `requirements.txt` - Python dependencies

### Production Endpoints

- **Frontend**: [https://vibeplan-app.vercel.app/](https://vibeplan-app.vercel.app/)
- **ChromaDB API**: [https://vibeplan-chromadb-api.onrender.com](https://vibeplan-chromadb-api.onrender.com)
  - Health Check: [https://vibeplan-chromadb-api.onrender.com/health](https://vibeplan-chromadb-api.onrender.com/health)
  - API Docs: [https://vibeplan-chromadb-api.onrender.com/docs](https://vibeplan-chromadb-api.onrender.com/docs) (FastAPI Swagger UI)

### Using the Production API

You can query the ChromaDB API directly for semantic search:

```bash
# Check API health
curl https://vibeplan-chromadb-api.onrender.com/health

# Search for activities
curl -X POST https://vibeplan-chromadb-api.onrender.com/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "romantic date night with good food",
    "n_results": 10
  }'
```

**Response Example:**
```json
{
  "activities": [
    {
      "title": "1-for-1 Dinner at Mellower Coffee",
      "description": "Cozy cafe atmosphere with specialty coffee drinks",
      "location": "Singapore",
      "price": 25.0,
      "tags": ["food", "coffee", "promotion"],
      "source_channel": "@sgdeals",
      "source_type": "instagram"
    }
  ],
  "query": "romantic date night with good food",
  "count": 10
}
```

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
├── data_ingestion/            # Data scraping and ingestion pipeline
│   ├── src/
│   │   ├── scrapers/          # Data source scrapers
│   │   │   ├── base.py        # Abstract scraper interface
│   │   │   ├── telegram_scraper.py  # Telegram channel scraper
│   │   │   └── insta_normaliser.py  # Instagram post scraper
│   │   ├── storage/           # Data storage layer
│   │   │   └── database.py    # SQLAlchemy models & DB manager
│   │   ├── processing/        # Content processing
│   │   │   └── normalizer.py  # LLM-based content normalizer
│   │   ├── scheduler.py       # Automated scraping scheduler
│   │   └── config.py          # Configuration management
│   ├── main.py                # CLI interface for scraping
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Data ingestion documentation
├── chromadb_api.py            # FastAPI bridge for ChromaDB
├── requirements.txt           # Python dependencies (main)
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

## Data Ingestion Layer

### What Makes VibePlan Different

**VibePlan's secret sauce is live, social, and trending data.**

While other AI planners rely on Google or outdated listings, VibePlan taps directly into:

- **Telegram** - Singapore deal channels, pop-ups, and promotions
- **Instagram** - Visual content from trending posts and reels
- **Exa.ai** - Real-time web search for fresh content
- **Social feeds** - Catch hottest deals, hidden gems, and viral spots as they appear

We continuously scrape and structure these feeds so new pop-ups, 1-for-1 promos, or café launches surface within hours, not weeks.

### Data Ingestion Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA INGESTION PIPELINE                       │
└─────────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │  Telegram    │
     │  Channels    │ (Batch: 100 messages/channel)
     │ (Telethon)   │
     └──────┬───────┘
            │
            ▼
     ┌──────────────────┐
     │  Link Extraction │ (Regex + URL Expansion)
     │  & Classification│
     └──────┬───────────┘
            │
            ├─────────────────────┬──────────────────┐
            ▼                     ▼                  ▼
     ┌─────────────┐      ┌─────────────┐    ┌─────────────┐
     │  Instagram  │      │  Shortened  │    │   Direct    │
     │    Links    │      │    URLs     │    │   Storage   │
     │  Detected   │      │  Expanded   │    │  (Telegram) │
     └──────┬──────┘      └─────────────┘    └──────┬──────┘
            │                                         │
            ▼                                         │
     ┌──────────────────┐                            │
     │  Instagram       │ (Selenium + ChromeDriver)  │
     │  Post Scraper    │                            │
     │  - Caption       │                            │
     │  - Author        │                            │
     │  - Images/Videos │                            │
     │  - Metadata      │                            │
     └──────┬───────────┘                            │
            │                                         │
            └─────────────────┬───────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │   LLM Normalizer │
                    │   (GPT-3.5-turbo)│
                    │                  │
                    │  - Extracts key  │
                    │    information   │
                    │  - Structures    │
                    │    content       │
                    │  - Removes noise │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Vector Embedding│
                    │  (OpenAI Ada-002)│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    ChromaDB      │
                    │  Vector Storage  │
                    │  (500+ activities)│
                    └──────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  FastAPI Bridge  │
                    │                  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Next.js API    │
                    │  /api/generate   │
                    └──────────────────┘
```

### Technical Components

#### 1. Telegram Batch Scraper (`telegram_scraper.py`)

- **Technology**: Telethon (Telegram API client)
- **Scraping Strategy**:
  - Parallel channel scraping (up to 5 concurrent channels)
  - 100 messages per channel per batch
  - Automatic retry logic with exponential backoff
  - Rate limiting to respect Telegram API limits
- **Features**:
  - URL extraction using regex patterns
  - Shortened URL expansion (bit.ly, t.co, etc.) with parallel processing
  - Instagram link detection and classification
  - Message deduplication

#### 2. Instagram Content Scraper (`insta_normaliser.py`)

- **Technology**: Selenium + ChromeDriver
- **Scraping Approach**:
  - Headless browser automation
  - OpenGraph metadata extraction
  - JSON-LD structured data parsing
- **Data Extracted**:
  - Post caption and description
  - Author username and name
  - Upload date
  - Image and video URLs
  - Like and comment counts (when available)
- **Anti-Detection**:
  - User-agent rotation
  - Automation fingerprint removal
  - CDP commands for stealth

#### 3. LLM Content Normalizer (`normalizer.py`)

- **Model**: GPT-3.5-turbo
- **Purpose**: Transform raw social media content into structured, searchable format
- **Normalization Process**:
  1. Extract main topic/subject
  2. Identify key facts and information
  3. Remove redundant details
  4. Structure information consistently
  5. Preserve important context
- **Output**: Clean, information-dense text optimized for vector search

#### 4. Database Layer (`database.py`)

- **Technology**: SQLAlchemy + SQLite
- **Schema**:

  ```
  messages
  ├── id (Primary Key)
  ├── channel_username (String)
  ├── message_id (String, unique per channel)
  ├── text (Raw content)
  ├── normalized_text (LLM-processed)
  ├── links (JSON array)
  ├── source ("telegram" | "instagram")
  ├── date (Timestamp)
  ├── has_links (Boolean)
  ├── processed (Boolean)
  └── created_at (Timestamp)

  scraped_content
  ├── id (Primary Key)
  ├── message_id (Foreign Key)
  ├── url (Source URL)
  ├── content (Raw scraped content)
  ├── normalized_text (LLM-processed)
  └── scraped_at (Timestamp)
  ```

#### 5. Vector Storage (ChromaDB)

- **Collection**: `telegram_activities`
- **Embedding Model**: OpenAI `text-embedding-3-small`
- **Storage**: Persistent on-disk storage at `./data/chroma_db`
- **Metadata Structure**:
  ```json
  {
    "full_data": {
      "title": "Activity Title",
      "description": "Normalized description",
      "location": "Singapore",
      "venue_name": "Venue Name",
      "price": 25.0,
      "tags": ["food", "cafe", "aesthetic"],
      "duration_hours": 2.0,
      "offer_type": "promotion",
      "validity_end": "2025-12-31",
      "source_channel": "@sgdeals",
      "source_type": "instagram",
      "source_link": ["https://instagram.com/p/..."]
    }
  }
  ```

#### 6. Automated Scheduler (`scheduler.py`)

- **Technology**: APScheduler (AsyncIO-compatible)
- **Schedule**:
  - **Weekly Scraping**: Every 168 hours (configurable)
  - **Daily Processing**: Every 24 hours for normalization
- **Pipeline Flow**:
  1. Scrape configured Telegram channels in parallel
  2. Extract and expand URLs
  3. Scrape Instagram posts from detected links
  4. Store raw content in SQLite
  5. Normalize content with LLM
  6. Generate embeddings and store in ChromaDB

### Data Flow Example

```
1. Telegram Message Scraped:
   "@sgdeals: 🔥 1-for-1 coffee at Mellower Coffee!
    Valid till Dec 31. Check: https://instagram.com/p/xyz"

2. Link Detected & Expanded:
   URL: https://instagram.com/p/xyz
   Type: Instagram Post

3. Instagram Post Scraped:
   Caption: "Our December special! Show this post for 1-for-1
            on any coffee. Valid Mon-Fri 2-5pm."
   Author: @mellowercoffeesg
   Images: [coffee_photo_1.jpg, cafe_interior.jpg]

4. LLM Normalization:
   "1-for-1 coffee promotion at Mellower Coffee in Singapore.
    Valid December 2025, Monday to Friday 2-5pm. Show
    Instagram post for redemption. Cozy cafe atmosphere,
    specialty coffee drinks available."

5. Vector Embedding Generated:
   [0.023, -0.041, 0.089, ...] (1536 dimensions)

6. Stored in ChromaDB:
   {
     "title": "1-for-1 Coffee at Mellower Coffee",
     "description": "...",
     "tags": ["food", "coffee", "promotion", "1-for-1"],
     "price": 6.50,
     "source_channel": "@sgdeals",
     "source_type": "instagram",
     "source_link": "https://instagram.com/p/xyz"
   }
```

### Key Features

- **Parallel Processing**: Scrapes multiple channels and expands URLs concurrently
- **Robust Error Handling**: Automatic retries, exponential backoff, graceful degradation
- **Rate Limiting**: Respects API limits for Telegram, Instagram, and OpenAI
- **Deduplication**: Prevents duplicate entries using message IDs
- **Incremental Updates**: Only processes new content since last scrape
- **Extensible Architecture**: Easy to add new scrapers (TikTok, Lemon8, etc.)

### Configuration

Environment variables for data ingestion:

```env
# Telegram API
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_PHONE=+65xxxxxxxx
TELEGRAM_CHANNELS=sgdeals,sgfoodie,sgcafehopping

# OpenAI for normalization and embeddings
OPENAI_API_KEY=sk-...

# Scraping configuration
MAX_MESSAGES_PER_CHANNEL=100
SCRAPING_INTERVAL_HOURS=168

# Database
DATABASE_URL=sqlite:///data_ingestion.db
```

## AI & Recommendation Pipeline

VibePlan uses a sophisticated AI pipeline to deliver personalized recommendations:

### RAG (Retrieval-Augmented Generation) System

- **Vector Database**: ChromaDB stores embeddings of 381+ activities and venues
- **Semantic Search**: Find similar activities based on user preferences
- **Context-Aware**: AI considers user's MBTI, budget, and activity history
- **Real-time Augmentation**: Combines ChromaDB results with Exa.ai live web search

### Recommendation Flow

1. **User Input Analysis**: Parse preferences, budget, and natural language query
2. **Semantic Keywords**: Enrich query with MBTI traits, budget signals, activity types
3. **Dual Data Sources**:
   - **ChromaDB**: 15 curated activities from social data (Telegram + Instagram)
   - **Exa API**: 5 real-time web results for fresh content
4. **LLM Curation**: GPT-4o selects 4-6 best activities and creates timeline
5. **Enhancement**: AI estimates prices and generates engaging summaries
6. **Ranking & Filtering**: Activities ranked by relevance and user preferences

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

VibePlan is deployed using a two-service architecture:

### Frontend Deployment (Vercel)

**Live Site:** [https://vibeplan-app.vercel.app/](https://vibeplan-app.vercel.app/)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXA_API_KEY=your_exa_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```
5. Deploy!

**Important:** Update the ChromaDB API endpoint in `src/app/api/generate/utils/chromaClient.ts` to point to your Render deployment:
```typescript
const CHROMA_API_URL = process.env.CHROMA_API_URL || 'https://vibeplan-chromadb-api.onrender.com';
```

### Backend Deployment (Render.com)

**Live API:** [https://vibeplan-chromadb-api.onrender.com](https://vibeplan-chromadb-api.onrender.com)

1. Go to [render.com](https://render.com) and create a new Web Service
2. Connect your GitHub repository
3. Configure the service:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python chromadb_api.py`
   - **Environment:** Python 3
4. Add environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ALLOWED_ORIGINS=https://vibeplan-app.vercel.app,http://localhost:3000
   PORT=10000
   ```
5. Deploy!

**Note:** Render uses port 10000 by default. The FastAPI server automatically uses `PORT` environment variable.

### Post-Deployment Checklist

- ✅ Update Supabase auth settings with production URL: `https://vibeplan-app.vercel.app`
- ✅ Add redirect URL in Supabase: `https://vibeplan-app.vercel.app/auth/callback`
- ✅ Test ChromaDB API health endpoint: [https://vibeplan-chromadb-api.onrender.com/health](https://vibeplan-chromadb-api.onrender.com/health)
- ✅ Verify CORS settings in `chromadb_api.py` include production domain
- ✅ Test activity generation with production data

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

### Main Application (.env.local)

Required for the Next.js frontend and recommendation engine:

| Variable                        | Description                          | Required | Example                     |
| ------------------------------- | ------------------------------------ | -------- | --------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL            | ✅ Yes   | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key          | ✅ Yes   | `eyJhbGc...`                |
| `EXA_API_KEY`                   | Exa API key for real-time web search | ✅ Yes   | `c7f153...`                 |
| `OPENAI_API_KEY`                | OpenAI API key for AI processing     | ✅ Yes   | `sk-...`                    |
| `GOOGLE_MAPS_API_KEY`           | Google Maps API key                  | ❌ No    | `AIza...`                   |

### Data Ingestion Pipeline (data_ingestion/.env)

Required for scraping Telegram channels and Instagram posts:

| Variable                   | Description                                    | Required | Example                       |
| -------------------------- | ---------------------------------------------- | -------- | ----------------------------- |
| `TELEGRAM_API_ID`          | Telegram API ID from https://my.telegram.org   | ✅ Yes   | `12345678`                    |
| `TELEGRAM_API_HASH`        | Telegram API hash from https://my.telegram.org | ✅ Yes   | `abcdef123...`                |
| `TELEGRAM_PHONE`           | Your Telegram phone number                     | ✅ Yes   | `+6591234567`                 |
| `TELEGRAM_CHANNELS`        | Comma-separated channel list                   | ✅ Yes   | `sgdeals,sgfoodie`            |
| `OPENAI_API_KEY`           | OpenAI API key for normalization               | ✅ Yes   | `sk-...`                      |
| `MAX_MESSAGES_PER_CHANNEL` | Messages to scrape per channel                 | ❌ No    | `100`                         |
| `SCRAPING_INTERVAL_HOURS`  | Hours between scraping runs                    | ❌ No    | `168`                         |
| `DATABASE_URL`             | SQLite database path                           | ❌ No    | `sqlite:///data_ingestion.db` |

**Note**: 
- **Local Development**: ChromaDB runs on `localhost:8001`
- **Production**: ChromaDB API deployed at [https://vibeplan-chromadb-api.onrender.com](https://vibeplan-chromadb-api.onrender.com)
- No additional configuration needed - the API automatically detects the environment

## Future Enhancements

### User Features

- [ ] Save activities to favorites
- [ ] Share activity plans with friends
- [ ] Export plans to calendar
- [ ] More detailed activity information
- [ ] User reviews and ratings
- [ ] Real-time availability checking
- [ ] Weather-based recommendations
- [ ] Interactive map integration
- [ ] Mobile app (React Native)

### Data Ingestion Expansion

- [ ] **TikTok Scraper** - Capture trending food and cafe videos
- [ ] **Lemon8 Scraper** - Extract aesthetic spots and lifestyle content
- [ ] **Reddit Integration** - r/singapore recommendations and discussions
- [ ] **Google Reviews API** - Real-time ratings and reviews
- [ ] **Event Platforms** - Eventbrite, Peatix for upcoming events
- [ ] **Food Delivery APIs** - GrabFood, Deliveroo for restaurant data
- [ ] **Real-time Availability** - Integration with booking systems
- [ ] **Price Monitoring** - Track price changes and deal expiry
- [ ] **Image Recognition** - Classify venue types from photos
- [ ] **Sentiment Analysis** - Gauge popularity from social sentiment

## Troubleshooting

### ChromaDB API Connection Issues

**Problem**: `Connection refused` or `fetch failed` errors

**Solutions for Local Development**:

1. Make sure the FastAPI bridge is running: `python3 chromadb_api.py`
2. Check if port 8001 is available: `lsof -i :8001`
3. Verify the health endpoint: `curl http://localhost:8001/health`

**Solutions for Production**:

1. Check if Render service is running: Visit [https://vibeplan-chromadb-api.onrender.com/health](https://vibeplan-chromadb-api.onrender.com/health)
2. Verify environment variables are set in Render dashboard
3. Check Render logs for errors in the service dashboard
4. Ensure CORS origins include your Vercel domain: `https://vibeplan-app.vercel.app`

**Note**: Render free tier services may spin down after inactivity. First request may take 30-60 seconds to wake up the service.

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

**Solution**: You need the pre-populated ChromaDB database. Populate it using the data ingestion pipeline:

```bash
cd data_ingestion
python main.py setup
python main.py load-channels
python main.py run-once
```

### Port Already in Use

**Problem**: `Port 3000 is already in use` or `Port 8001 is already in use`

**Solutions**:

```bash
# For Next.js (port 3000)
lsof -ti:3000 | xargs kill -9

# For FastAPI (port 8001)
lsof -ti:8001 | xargs kill -9
```

### Data Ingestion Issues

#### Telegram Authentication Failed

**Problem**: `Authentication failed` or `Phone number not authorized`

**Solutions**:

1. Verify API credentials from https://my.telegram.org
2. Ensure phone number includes country code (e.g., `+6591234567`)
3. First run requires SMS verification - check your phone
4. Session file `telegram_session.session` stores auth - delete if corrupted

#### Instagram Scraping Failed

**Problem**: `Instagram redirected to login` or `Selenium timeout`

**Solutions**:

1. Instagram requires ChromeDriver - ensure it's installed: `brew install chromedriver` (macOS)
2. For private posts, set environment variables:
   ```bash
   export IG_USERNAME=your_instagram_username
   export IG_PASSWORD=your_instagram_password
   ```
3. Increase timeout in `insta_normaliser.py` if network is slow

#### LLM Normalization Timeout

**Problem**: `OpenAI API timeout` or `Rate limit exceeded`

**Solutions**:

1. Check OpenAI API key is valid and has credits
2. Rate limiting built-in (0.5s delay) - don't modify
3. For large batches, increase `time.sleep()` in `normalizer.py`

#### ChromeDriver Not Found

**Problem**: `chromedriver not found` or `SessionNotCreatedException`

**Solutions**:

```bash
# macOS
brew install chromedriver

# Linux
sudo apt-get install chromium-chromedriver

# Or download manually from:
# https://chromedriver.chromium.org/downloads
```

#### Database Lock Error

**Problem**: `database is locked` in SQLite

**Solutions**:

1. Only run one scraping process at a time
2. Check for zombie processes: `ps aux | grep python`
3. Delete lock file if needed: `rm data_ingestion.db-journal`

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
