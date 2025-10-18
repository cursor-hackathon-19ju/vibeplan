# VibePlan Deployment Guide

This guide covers deploying VibePlan to production using Render.com (Python API) and Vercel (Next.js frontend).

## Overview

VibePlan consists of two services:
1. **ChromaDB FastAPI** - Python backend for vector database queries
2. **Next.js Frontend** - Main web application

## Part 1: Deploy ChromaDB API to Render.com

### Prerequisites
- GitHub account with your VibePlan repository
- Render.com account (sign up at https://render.com)
- OpenAI API key

### Step 1: Push Code to GitHub

Make sure all your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Render.com deployment"
git push origin main
```

### Step 2: Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** button → **"Web Service"**
3. Connect your GitHub repository
4. Select your **vibeplan** repository

### Step 3: Configure Service Settings

**Basic Settings:**
- **Name**: `vibeplan-chromadb-api` (or any name you prefer)
- **Region**: Singapore (or closest to your users)
- **Branch**: `main`
- **Root Directory**: Leave blank (uses repo root)
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python chromadb_api.py`

**Plan:**
- Select **Free** plan (includes 512MB RAM, enough for ChromaDB)

### Step 4: Set Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `OPENAI_API_KEY` | `your-openai-api-key` | Required for embeddings |
| `ALLOWED_ORIGINS` | `http://localhost:3000,https://vibeplan.vercel.app` | Update with your Vercel domain |
| `PYTHON_VERSION` | `3.11.0` | Optional, Render auto-detects |

**Important:** Replace `https://vibeplan.vercel.app` with your actual Vercel domain once deployed.

### Step 5: Add Persistent Disk (Important!)

ChromaDB needs persistent storage for the vector database:

1. Scroll to **"Disks"** section
2. Click **"Add Disk"**
3. Configure:
   - **Name**: `chroma-data`
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: `1 GB` (free tier allows up to 1GB)

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying (takes 2-5 minutes)
3. Watch the logs for any errors
4. Once deployed, you'll see: **"Your service is live 🎉"**

### Step 7: Get Your API URL

1. Copy your service URL (e.g., `https://vibeplan-chromadb-api.onrender.com`)
2. Test the health endpoint:
   ```bash
   curl https://vibeplan-chromadb-api.onrender.com/health
   ```
3. You should see:
   ```json
   {
     "status": "healthy",
     "chroma_connected": true,
     "collection_name": "telegram_activities",
     "activity_count": 381
   }
   ```

### Step 8: Upload ChromaDB Data

⚠️ **Important:** You need to upload your `data/chroma_db` directory to the persistent disk.

**Option A: Manual Upload via Render Shell**
1. Go to your service → **Shell** tab
2. Upload files using the file manager
3. Place them in `/opt/render/project/src/data/chroma_db/`

**Option B: Include in Git (if data is not too large)**
1. Remove `data/` from `.gitignore` temporarily
2. Commit and push the data directory
3. Render will include it in the deployment

**Option C: Programmatic Upload**
- Use Render's API or SSH to copy files to the persistent disk

---

## Part 2: Deploy Next.js to Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository pushed
- ChromaDB API deployed and running on Render

### Step 1: Connect Repository to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your **vibeplan** GitHub repository
4. Click **"Import"**

### Step 2: Configure Project Settings

Vercel auto-detects Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-supabase-anon-key` | Production |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `your-google-maps-key` | Production |
| `OPENAI_API_KEY` | `your-openai-api-key` | Production |
| `EXA_API_KEY` | `your-exa-api-key` | Production |
| `CHROMADB_API_URL` | `https://vibeplan-chromadb-api.onrender.com` | Production |

**Important:** Use your actual Render.com URL for `CHROMADB_API_URL`

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy (takes 1-3 minutes)
3. Once complete, you'll get a production URL (e.g., `https://vibeplan.vercel.app`)

### Step 5: Update CORS Settings

Now that you have your Vercel URL, update the ChromaDB API CORS settings:

1. Go back to Render.com dashboard
2. Open your ChromaDB service
3. Go to **"Environment"** tab
4. Update `ALLOWED_ORIGINS` to include your Vercel domain:
   ```
   https://vibeplan.vercel.app
   ```
5. Save changes (this will trigger a redeploy)

### Step 6: Update Supabase Auth Settings

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel domain to **Site URL**:
   ```
   https://vibeplan.vercel.app
   ```
4. Add redirect URLs:
   ```
   https://vibeplan.vercel.app/auth/callback
   ```

---

## Testing Your Deployment

### 1. Test ChromaDB API
```bash
curl https://vibeplan-chromadb-api.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "chroma_connected": true,
  "collection_name": "telegram_activities",
  "activity_count": 381
}
```

### 2. Test Next.js Frontend
Visit your Vercel URL: `https://vibeplan.vercel.app`

1. Sign in with Google
2. Try a search query
3. Check that activities are returned

### 3. Monitor Logs

**Render Logs:**
- Go to Render dashboard → Your service → **Logs** tab
- Watch for incoming requests from Vercel

**Vercel Logs:**
- Go to Vercel dashboard → Your project → **Deployments** → Click deployment → **Functions** tab
- Check for API route logs

---

## Troubleshooting

### Issue: "Connection refused" or "fetch failed"

**Cause:** ChromaDB API is not accessible from Vercel

**Solutions:**
1. Verify Render service is running (check status in dashboard)
2. Check `CHROMADB_API_URL` environment variable in Vercel
3. Ensure CORS is configured correctly in `chromadb_api.py`
4. Check Render logs for errors

### Issue: "Collection not found"

**Cause:** ChromaDB data not uploaded to persistent disk

**Solutions:**
1. Verify persistent disk is mounted at `/opt/render/project/src/data`
2. Upload your `data/chroma_db` directory to the persistent disk
3. Check Render logs to see if ChromaDB files are being loaded

### Issue: "OPENAI_API_KEY not found"

**Cause:** Environment variable not set in Render

**Solutions:**
1. Go to Render dashboard → Environment tab
2. Add `OPENAI_API_KEY` with your OpenAI API key
3. Save (this will redeploy the service)

### Issue: Authentication not working on Vercel

**Cause:** Supabase redirect URLs not configured

**Solutions:**
1. Add your Vercel domain to Supabase **Site URL**
2. Add `/auth/callback` to redirect URLs
3. Clear browser cache and try again

### Issue: Render free tier sleep mode

**Note:** Render free tier services sleep after 15 minutes of inactivity and take 30-60 seconds to wake up.

**Solutions:**
1. Upgrade to paid plan ($7/month) for always-on service
2. Implement a ping service to keep it awake
3. Accept the cold start delay (show loading state in UI)

---

## Costs

### Render.com
- **Free Tier**:
  - 512 MB RAM
  - 1 GB persistent disk
  - Sleeps after 15 min inactivity
  - 750 hours/month free
- **Starter**: $7/month (always on, no sleep)

### Vercel
- **Hobby (Free)**:
  - Unlimited projects
  - 100 GB bandwidth/month
  - Serverless functions
  - Perfect for personal projects
- **Pro**: $20/month (for commercial use)

### Total: $0 - $27/month depending on your needs

---

## Next Steps

1. ✅ Deploy ChromaDB API to Render.com
2. ✅ Deploy Next.js to Vercel
3. ✅ Update CORS and auth settings
4. 🔄 Monitor logs for errors
5. 🔄 Test all features in production
6. 🔄 Set up custom domain (optional)
7. 🔄 Enable monitoring/analytics

---

## Environment Variables Reference

### Render (ChromaDB API)
```bash
OPENAI_API_KEY=sk-...
ALLOWED_ORIGINS=https://vibeplan.vercel.app
PYTHON_VERSION=3.11.0
```

### Vercel (Next.js)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
OPENAI_API_KEY=sk-...
EXA_API_KEY=c7f153...
CHROMADB_API_URL=https://vibeplan-chromadb-api.onrender.com
```

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Render and Vercel logs
3. Test API endpoints manually with curl
4. Verify all environment variables are set correctly

Good luck with your deployment! 🚀
