# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

The app requires Supabase for authentication. You have two options:

#### Option A: Use Placeholder Values (Auth Won't Work)

If you just want to test the activity search without auth:

```bash
# Create .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder" >> .env.local
```

#### Option B: Set Up Real Supabase (Recommended)

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (free tier)
3. Go to Settings > API
4. Create `.env.local` with your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

See [README.md](README.md#supabase-setup) for detailed Supabase setup instructions including Google OAuth.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

### 4. Try It Out

1. Navigate to the home page
2. Select some activity preferences (all optional)
3. Enter what you're looking for in the search box
   - Try: "Plan a date under $50 with food, something artsy, and outdoors"
4. Hit enter and watch the AI cook! 👨‍🍳
5. Browse your personalized activity recommendations

## 📱 Features to Test

- **Desktop View**: Expandable sidebar navigation
- **Mobile View**: Hamburger menu
- **Filter Options**: Activity types, budget slider, MBTI, date range
- **Sample Prompts**: Click to copy pre-made search queries
- **Loading Animation**: Fun cooking animation while generating
- **Results**: Beautiful card-based layout
- **Authentication**: Login/signup (if using real Supabase)
- **Profile**: View your account info
- **History**: See past searches
- **About**: Learn more about VibePlan

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## ⚠️ Important Notes

- The app uses **mock data** for activities. See [README.md](README.md#api-integration) to integrate with your real AI/database.
- Authentication requires a configured Supabase project with Google OAuth enabled.
- Mobile responsive design is optimized for all screen sizes.

## 🎨 Design Features

- **Fonts**: Instrument Sans (body) & Instrument Serif (emphasis)
- **Theme**: Light mode with blue accent (#3B82F6)
- **Background**: Soft white (#fcfcff)
- **Components**: shadcn/ui for beautiful, accessible UI

## 🐛 Troubleshooting

### Build errors about Supabase

Make sure you have environment variables set (even if placeholder values).

### "Invalid Supabase credentials"

If using placeholder values, authentication won't work - this is expected. Set up real Supabase credentials to enable auth.

### Port 3000 already in use

```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

## 📚 Next Steps

1. **Set up Supabase**: Follow the [detailed guide](README.md#supabase-setup) for full auth functionality
2. **Integrate Your AI**: Replace mock data in `/src/app/api/generate/route.ts`
3. **Add Your Activities Database**: Connect to your curated Singapore activities
4. **Customize**: Adjust colors, fonts, and branding to your liking
5. **Deploy**: Push to Vercel or your preferred platform

## 🤝 Need Help?

- Check the [full README](README.md) for detailed documentation
- Review the [env-setup.md](env-setup.md) for environment configuration
- The codebase is well-commented and organized for easy navigation

Happy planning! 🎉

