#!/bin/bash

# VibePlan Setup Script
# This script helps you set up the VibePlan application quickly

echo "🎉 Welcome to VibePlan Setup!"
echo "=============================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚙️  Setting up environment variables..."
    echo ""
    echo "Choose setup option:"
    echo "1) Quick test with placeholder values (auth won't work)"
    echo "2) I have Supabase credentials (full functionality)"
    echo ""
    read -p "Enter choice (1 or 2): " choice
    echo ""

    if [ "$choice" = "1" ]; then
        echo "NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co" > .env.local
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder" >> .env.local
        echo "✅ Placeholder environment variables created!"
        echo "⚠️  Note: Authentication will not work with placeholder values"
    elif [ "$choice" = "2" ]; then
        echo "Enter your Supabase project URL:"
        read -p "URL: " supabase_url
        echo "Enter your Supabase anon key:"
        read -p "Key: " supabase_key
        echo "NEXT_PUBLIC_SUPABASE_URL=$supabase_url" > .env.local
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_key" >> .env.local
        echo "✅ Environment variables configured!"
    else
        echo "❌ Invalid choice. Please run the script again."
        exit 1
    fi
    echo ""
else
    echo "✅ Environment variables already configured"
    echo ""
fi

echo "🚀 Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information:"
echo "  - Quick start: Read QUICKSTART.md"
echo "  - Full docs: Read README.md"
echo "  - Supabase setup: Read env-setup.md"
echo ""
echo "Happy planning! 🎉"

