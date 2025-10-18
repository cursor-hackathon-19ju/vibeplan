# Environment Setup Guide

This file provides instructions for setting up your environment variables.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following content:

```bash
# Supabase Configuration
# Get these values from https://supabase.com/dashboard -> Your Project -> Settings -> API

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Quick Setup Steps

1. Copy the template:
```bash
cp .env.local.template .env.local
```

2. Go to your Supabase project dashboard:
   - https://supabase.com/dashboard
   - Select your project
   - Go to Settings > API

3. Copy the values:
   - Project URL → Replace `your_supabase_project_url_here`
   - Project API Key (anon/public) → Replace `your_supabase_anon_key_here`

4. Save the `.env.local` file

5. Restart your development server:
```bash
npm run dev
```

## For Development Without Supabase

If you want to run the app without Supabase (authentication will not work):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key
```

Note: With placeholder values, authentication features won't work, but you can still test the activity search functionality.

