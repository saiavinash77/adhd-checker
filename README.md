# FocusLens — ADHD Screening App

Production-grade ADHD screening web app built with React, Supabase, and Groq AI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Auth + Database | Supabase (Postgres + RLS) |
| AI Analysis | Groq API (llama-3.3-70b) via Edge Function |
| Screening Framework | WHO ASRS v1.1 (18 questions) |
| Charts | Recharts |
| Hosting | Vercel (frontend) + Supabase (backend) |

---

## Setup — Step by Step

### 1. Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Dashboard → **SQL Editor** → paste contents of `supabase/schema.sql` → Run
3. Dashboard → **Settings → API** → copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
4. Dashboard → **Authentication → Email** → Enable email signups

### 2. Environment variables

```bash
cp .env.example .env
# Fill in your Supabase URL and anon key
```

### 3. Groq API key

1. Get your key at [console.groq.com](https://console.groq.com)
2. Install Supabase CLI: `npm install -g supabase`
3. Login: `supabase login`
4. Link project: `supabase link --project-ref YOUR_PROJECT_REF`
5. Set the secret (NEVER put this in .env):
   ```bash
   supabase secrets set GROQ_API_KEY=your_groq_api_key_here
   ```
6. Deploy the edge function:
   ```bash
   supabase functions deploy analyze-adhd
   ```

### 4. Run locally

```bash
npm install
npm run dev
# Open http://localhost:5173
```

### 5. Deploy to production (Vercel)

```bash
npm install -g vercel
vercel
# Follow prompts — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as env vars
```

Or push to GitHub and connect repo to Vercel dashboard.

---

## Project Structure

```
src/
  pages/
    Landing.jsx       # Public landing page
    Auth.jsx          # Sign up / Sign in
    Dashboard.jsx     # User home — history and stats
    Screening.jsx     # The 18-question test + demographics
    Results.jsx       # Full results with charts and AI report
  lib/
    supabase.js       # Supabase client + DB helpers
    scoring.js        # ASRS v1.1 local scoring algorithm
    questions.js      # WHO ASRS question bank + demographics
  context/
    AuthContext.jsx   # Global auth state
supabase/
  schema.sql          # Run once in Supabase SQL editor
  functions/
    analyze-adhd/     # Groq API edge function (secure)
```

---

## Security Model

- **Groq API key** lives ONLY in Supabase Edge Function secrets — never in frontend
- **Row Level Security** on Supabase means users can only read their own data
- **No raw audio/video** stored — only questionnaire answers (JSONB)
- **Anonymized aggregate view** available for research without exposing any user data
- Auth uses Supabase JWT — tokens auto-refresh

---

## Compliance Notes

- ⚕️ Screener only — "not a medical diagnosis" disclaimer shown at multiple points
- 🇮🇳 DPDP Act (India) aligned — no unnecessary data collection
- 🇪🇺 GDPR aligned — user can delete account (cascades to results)
- 🇺🇸 HIPAA-aligned practices — but app is not a HIPAA-covered entity

---

## Adding Payments Later (Razorpay)

```bash
npm install razorpay
```

Add to Supabase: `user_plan` column on a `profiles` table.
Gate `/results` page — free users see Part A only; paid users see full AI report.

---

## Roadmap

- [ ] Razorpay subscription (freemium → paid AI report)
- [ ] React Native mobile app (Expo)
- [ ] Progress tracking charts across multiple screenings
- [ ] B2B white-label mode (custom branding via URL param)
- [ ] PDF report export
- [ ] Clinician dashboard (separate admin role in Supabase)
