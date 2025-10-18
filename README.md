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

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Fonts**: Instrument Sans (body) & Instrument Serif (emphasis)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works!)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vibeplan.git
cd vibeplan
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See the [Supabase Setup](#supabase-setup) section below for detailed instructions.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Project Structure

```
vibeplan/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── about/             # About page
│   │   ├── api/               # API routes
│   │   │   └── generate/      # Activity generation endpoint
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
├── middleware.ts              # Auth middleware
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
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

## API Integration

The current implementation uses placeholder mock data. To integrate with your AI/LLM pipeline and activity database:

1. Locate `/src/app/api/generate/route.ts`
2. Replace the TODO section with your actual implementation:
   - Parse user preferences and query
   - Query your activities database
   - Use AI/LLM to rank and personalize recommendations
   - Return customized activity suggestions

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

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGc...` |

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
