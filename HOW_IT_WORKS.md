# 🧠 FocusLens — How It Works

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER (React)                      │
│  Landing → Auth → Dashboard → Screening → Results            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (HTTPS)
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE (Backend + Database)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Authentication (Email/Password)                      │   │
│  │ - Generates JWT token                               │   │
│  │ - Stores user session                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ PostgreSQL Database                                  │   │
│  │ - screening_results table                           │   │
│  │ - Row-level security (users see only their data)    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Edge Function (Deno Runtime)                        │   │
│  │ - Receives screening answers                        │   │
│  │ - Calls AI AI API                                 │   │
│  │ - Returns AI analysis                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                     │
                     ↓ (API Call)
┌─────────────────────────────────────────────────────────────┐
│                  AI AI (External API)                      │
│  - Receives: Screening answers + demographics               │
│  - Model: llama-3.3-70b-versatile                           │
│  - Returns: JSON analysis with insights                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Journey (Step by Step)

### **Step 1: Landing Page**
```
User visits http://localhost:5173/
↓
If logged in → Redirect to Dashboard
If not logged in → Show Landing page with features
```

**What happens:**
- React Router checks `useAuth()` context
- If `user` exists → Navigate to `/dashboard`
- If no user → Show public landing page

---

### **Step 2: Sign Up / Sign In**
```
User clicks "Sign up" or "Sign in"
↓
Enters email + password
↓
Supabase Auth processes request
↓
If new user → Creates account
If existing user → Validates credentials
↓
Supabase returns JWT token
↓
Token stored in browser (localStorage)
↓
User redirected to Dashboard
```

**Code flow:**
```javascript
// src/context/AuthContext.jsx
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password
})
// Supabase returns JWT token
// Token auto-refreshes every 60 minutes
```

---

### **Step 3: Dashboard**
```
User lands on Dashboard
↓
App fetches user's screening history from Supabase
↓
Shows:
  - Stats (screenings completed, latest score, average)
  - Progress chart (if 2+ screenings)
  - Monthly insights (if multiple months)
  - Comparison view (if 2+ screenings)
  - Screening history list
```

**Data flow:**
```javascript
// src/pages/Dashboard.jsx
useEffect(() => {
  getUserHistory(user.id).then(({ data }) => {
    setHistory(data || [])  // Array of all screenings
  })
}, [user.id])

// Supabase query (with Row-Level Security)
supabase
  .from('screening_results')
  .select('*')
  .eq('user_id', user.id)  // Only their data
  .order('created_at', { ascending: false })
```

**What's displayed:**
- **Stats row**: 4 cards showing key metrics
- **Progress chart**: Area chart of scores over time
- **Monthly insights**: Bar chart + breakdown by month
- **Comparison**: Latest vs previous screening
- **History list**: Clickable list of all screenings

---

### **Step 4: Start Screening**
```
User clicks "New screening"
↓
Screening page loads with 3 steps:
  1. Intro (explanation)
  2. Demographics (age, gender, sleep, stress, caffeine)
  3. 18 questions (ASRS v1.1 test)
```

**Step 4a: Demographics Collection**
```
User answers 5 quick questions:
- Age group (18-25, 26-35, 36-45, 45+)
- Gender (Male, Female, Other)
- Sleep quality (Poor, Fair, Good, Excellent)
- Stress level (Low, Moderate, High, Very high)
- Daily caffeine (None, Low, Moderate, High)

↓
Stored in React state
↓
Sent to AI for context (not for diagnosis)
```

**Step 4b: 18-Question Test**
```
User answers each question:
  "Never" (0 points)
  "Rarely" (1 point)
  "Sometimes" (2 points)
  "Often" (3 points)
  "Very often" (4 points)

↓
Auto-saves to localStorage every 2 seconds
↓
User can pause and resume later
↓
Progress bar shows completion (X/18 answered)
```

**Questions are from WHO ASRS v1.1:**
- Part A (Q1-6): Core screening questions
- Part B (Q7-18): Extended assessment

---

### **Step 5: Calculate Score**
```
User clicks "View results"
↓
App calculates ASRS score:
  - Sum all 18 answers (0-4 each)
  - Total possible: 72 points
  - Determines risk level:
    * 0-30: Low risk
    * 31-49: Moderate risk
    * 50-72: High risk

↓
Score stored in database
```

**Scoring logic:**
```javascript
// src/lib/scoring.js
function calculateASRSScore(answers) {
  const totalScore = answers.reduce((sum, ans) => sum + ans, 0)
  
  let riskLevel = 'low'
  if (totalScore >= 50) riskLevel = 'high'
  else if (totalScore >= 31) riskLevel = 'moderate'
  
  return { totalScore, riskLevel }
}
```

---

### **Step 6: AI Analysis (Edge Function)**
```
App sends to Supabase Edge Function:
{
  answers: [0, 1, 2, 3, 4, ...],
  totalScore: 45,
  demographics: {
    age_group: "26-35",
    gender: "Male",
    sleep_quality: "Fair",
    stress_level: "High",
    caffeine: "Moderate"
  }
}

↓
Edge Function receives request
↓
Constructs prompt with:
  - All 18 answers + labels
  - Demographics context
  - Instructions (non-diagnostic language)

↓
Calls AI API with llama-3.3-70b model
↓
AI returns JSON with 4 sections:
  1. Summary (2-3 sentences)
  2. Inattention pattern
  3. Hyperactivity & impulsivity pattern
  4. Contextual factors
  5. What to do next

↓
Edge Function returns JSON to frontend
↓
Stored in database
```

**Edge Function code:**
```typescript
// supabase/functions/analyze-adhd/index.ts
const AIResponse = await fetch('https://api.AI.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${AI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 1000
  })
})
```

**Why Edge Function?**
- ✅ AI API key never exposed to frontend
- ✅ Secure server-to-server communication
- ✅ Runs on Supabase infrastructure
- ✅ Scales automatically

---

### **Step 7: Save to Database**
```
App saves screening result:
{
  id: "uuid-generated",
  user_id: "user-uuid",
  answers: [0, 1, 2, ...],
  total_score: 45,
  ai_analysis: { summary: "...", sections: [...] },
  risk_level: "moderate",
  created_at: "2024-01-15T10:30:00Z"
}

↓
Supabase Row-Level Security checks:
  - Is this user authenticated?
  - Does user_id match their JWT?
  
↓
If yes → Insert into screening_results table
If no → Reject (403 Forbidden)
```

**Database security:**
```sql
-- Only users can see their own results
CREATE POLICY "Users see own results" ON screening_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own results" ON screening_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

### **Step 8: Results Page**
```
User sees comprehensive report:

1. Risk Level Banner
   - Color-coded (green/yellow/red)
   - Score out of 72
   - Risk description

2. Score Breakdown
   - Part A (Q1-6): X/24
   - Part B (Q7-18): X/48
   - Progress bars

3. Charts
   - Radar chart: Category breakdown (inattention, hyperactivity, impulsivity)
   - Bar chart: Average response per category

4. AI Insights
   - Summary paragraph
   - 4 detailed sections
   - Non-diagnostic language

5. Full Answer Review
   - All 18 questions + user's answers
   - Color-coded by intensity
   - Category labels
```

---

### **Step 9: Dashboard Updates**
```
User returns to Dashboard
↓
App fetches updated history
↓
New screening appears in list
↓
Charts update with new data:
  - Progress chart shows new point
  - Monthly insights recalculate
  - Comparison view shows latest vs previous
  - Stats update (average, latest score)
```

---

## 📱 Data Flow Diagram

```
┌──────────────────┐
│   User Input     │
│  (18 answers +   │
│  demographics)   │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  React Component (Screening.jsx)     │
│  - Stores in state                   │
│  - Auto-saves to localStorage        │
│  - Validates all answered            │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Scoring Algorithm (scoring.js)      │
│  - Sum all answers                   │
│  - Determine risk level              │
│  - Return: { totalScore, riskLevel } │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Supabase Edge Function              │
│  - Receives answers + demographics   │
│  - Calls AI AI API                 │
│  - Returns JSON analysis             │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Supabase Database                   │
│  - Saves screening_results row       │
│  - Row-Level Security enforced       │
│  - Indexed for fast queries          │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Results Page (Results.jsx)          │
│  - Fetches from database             │
│  - Renders charts                    │
│  - Shows AI insights                 │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Dashboard (Dashboard.jsx)           │
│  - Fetches all screenings            │
│  - Calculates stats                  │
│  - Renders progress charts           │
│  - Shows comparison view             │
└──────────────────────────────────────┘
```

---

## 🔐 Security Model

### **Authentication**
- Email/password stored in Supabase Auth
- JWT token issued on login
- Token auto-refreshes every 60 minutes
- Token stored in browser (secure by default)

### **Database Security**
- Row-Level Security (RLS) enabled
- Users can only read/write their own data
- Policies enforced at database level
- No way to access other users' data

### **API Security**
- AI API key stored in Supabase secrets
- Never exposed to frontend
- Edge Function runs on Supabase servers
- CORS headers configured

### **Data Privacy**
- No raw audio/video stored
- Only questionnaire answers (JSONB)
- Anonymized aggregate view for research
- User can delete account (cascades to results)

---

## 📊 New Features Explained

### **1. Progress Tracking Chart**
```
Fetches all screenings ordered by date
↓
Extracts: date, score, risk_level
↓
Renders Area Chart with:
  - X-axis: Dates
  - Y-axis: Scores (0-72)
  - Gradient fill under line
  - Tooltip on hover

Shows stats:
  - Highest score
  - Lowest score
  - Latest change (with arrow indicator)
```

### **2. Monthly Insights**
```
Groups screenings by month
↓
For each month calculates:
  - Average score
  - Count of screenings
  - Risk breakdown (low/moderate/high)

Renders Bar Chart with:
  - X-axis: Months
  - Y-axis: Average scores
  - Cards below showing breakdown
```

### **3. Comparison View**
```
Takes latest and previous screening
↓
Displays side-by-side:
  - Score
  - Risk level
  - Date

Calculates change:
  - If score decreased → "Improving" (green)
  - If score increased → "Increased" (red)
  - Shows point difference
```

---

## 🚀 Deployment Flow

### **Local Development**
```
npm run dev
↓
Vite dev server starts on http://localhost:5173
↓
Hot module replacement (HMR) enabled
↓
Changes reflect instantly
```

### **Production (Vercel)**
```
npm run build
↓
Vite bundles React + dependencies
↓
Output: dist/ folder (static files)
↓
Push to GitHub
↓
Vercel detects push
↓
Runs build command
↓
Deploys to CDN
↓
Live at: focuslens.vercel.app
```

### **Edge Function Deployment**
```
supabase functions deploy analyze-adhd
↓
Deno code uploaded to Supabase
↓
Runs on Supabase infrastructure
↓
Accessible via HTTPS endpoint
↓
AI API key stored in secrets
```

---

## 📈 Performance Optimizations

1. **Auto-save to localStorage** — Resume screening mid-test
2. **Indexed database queries** — Fast history retrieval
3. **Lazy loading charts** — Only render when needed
4. **JWT caching** — Reduces auth requests
5. **CORS optimization** — Faster API calls

---

## 🎯 Key Technologies

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 | Component-based, fast rendering |
| Routing | React Router v6 | Client-side navigation |
| State | Context API | Global auth state |
| Database | Supabase (PostgreSQL) | Managed, secure, RLS support |
| Auth | Supabase Auth | Email/password, JWT tokens |
| AI | AI API | Fast LLM inference |
| Edge | Deno | Secure server-side code |
| Charts | Recharts | React-friendly charting |
| Icons | Lucide React | Lightweight SVG icons |
| Build | Vite | Fast bundling |
| Deploy | Vercel | Serverless hosting |

---

## 🔄 Real-Time Updates

Currently **not real-time** (polling-based):
- User takes screening
- Saves to database
- User navigates to dashboard
- App fetches history (fresh data)

**To add real-time:**
```javascript
// Listen for new screenings
supabase
  .from('screening_results')
  .on('*', payload => {
    // Update UI instantly
  })
  .subscribe()
```

---

## 📝 Summary

**FocusLens is a full-stack ADHD screening app that:**

1. ✅ Authenticates users securely
2. ✅ Collects 18-question screening data
3. ✅ Calculates ASRS v1.1 scores locally
4. ✅ Sends to AI for personalized insights
5. ✅ Stores results securely in database
6. ✅ Shows comprehensive results with charts
7. ✅ Tracks progress over multiple screenings
8. ✅ Provides monthly insights and comparisons
9. ✅ Maintains user privacy with RLS
10. ✅ Deploys to production with Vercel

**All data is encrypted, user-specific, and compliant with GDPR/DPDP.**
