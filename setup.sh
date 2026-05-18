#!/bin/bash
# FocusLens — Full setup script
# Run: chmod +x setup.sh && ./setup.sh

set -e

SUPABASE_URL="https://cpvdvvncwlqcbdwzgwmh.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwdmR2dm5jd2xxY2Jkd3pnd21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNzg1MzUsImV4cCI6MjA5NDY1NDUzNX0.c446Zam12wKnV4_EmudPw5T3j5rACmAGJvc0M5tm5Ck"
GROQ_API_KEY="your_groq_api_key_here"
SUPABASE_PROJECT_REF="cpvdvvncwlqcbdwzgwmh"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FocusLens Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Write .env
echo "VITE_SUPABASE_URL=$SUPABASE_URL" > .env
echo "VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> .env
echo "✓ .env written"

# 2. Install dependencies
echo "→ Installing npm packages..."
npm install --silent
echo "✓ Dependencies installed"

# 3. Supabase CLI setup
if ! command -v supabase &> /dev/null; then
  echo "→ Installing Supabase CLI..."
  npm install -g supabase --silent
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  MANUAL STEPS REQUIRED:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Run the database schema:"
echo "   → Open: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/sql/new"
echo "   → Paste contents of: supabase/schema.sql"
echo "   → Click Run"
echo ""
echo "2. Deploy the AI edge function:"
echo "   supabase login"
echo "   supabase link --project-ref $SUPABASE_PROJECT_REF"
echo "   supabase secrets set GROQ_API_KEY=$GROQ_API_KEY"
echo "   supabase functions deploy analyze-adhd"
echo ""
echo "3. Start dev server:"
echo "   npm run dev"
echo ""
echo "4. Deploy to Vercel:"
echo "   npx vercel"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Your app will be live at the Vercel URL!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
