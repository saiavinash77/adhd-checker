# FocusLens — ADHD Screening App

**AI-powered ADHD screening with personalized insights.**

---

## 🚀 Quick Start

### **Local Development**
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your Insforge AI and Razorpay credentials

# 3. Run development server
npm run dev
# Opens at http://localhost:5173
```

### **Deploy to Vercel**
```bash
npm run build
npx vercel

# Add environment variables in Vercel dashboard:
# - VITE_INSFORGE_API_KEY
# - VITE_INSFORGE_API_BASE_URL
# - VITE_RAZORPAY_KEY_ID
# - VITE_RAZORPAY_KEY_SECRET
```

---

## ✨ Features

- ✅ **18-question WHO ASRS v1.1 screening** — Validated ADHD assessment
- ✅ **AI-powered analysis** — Personalized insights using Insforge AI
- ✅ **Secure payments** — Razorpay integration (₹299 one-time payment)
- ✅ **Progress tracking** — Charts showing score trends over time
- ✅ **Monthly insights** — Average scores and risk breakdown by month
- ✅ **Comparison view** — Latest vs previous screening side-by-side
- ✅ **Auto-save** — Resume screening mid-test
- ✅ **Private & secure** — Data stored locally with optional cloud backup
- ✅ **Smooth Material Design UI** — Flutter-inspired design system

---

## 💳 Payment Flow

1. **Sign up** — Create a free account (localStorage-based)
2. **Payment** — One-time ₹299 payment via Razorpay (test mode supported)
3. **Screening** — Access unlocked after successful payment
4. **AI Analysis** — Get personalized insights with your results

**Test Mode:** Use Razorpay test cards for development:
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

---

## 🤖 AI Integration

FocusLens uses **Insforge AI** to generate personalized analysis:

- **Contextual insights** — Analysis considers demographics (age, sleep, stress)
- **Risk-based recommendations** — Tailored tips based on your score
- **Empathetic tone** — Supportive, evidence-based guidance
- **Fallback support** — Graceful degradation if AI API fails

---

## 📊 How It Works

1. **Sign up** — Create a local account (stored in localStorage)
2. **Pay once** — ₹299 one-time payment (lifetime access)
3. **Take screening** — Answer 18 questions + demographics (5 minutes)
4. **Get AI insights** — Personalized analysis of your results
5. **Track progress** — Take multiple screenings to see trends over time

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| AI Backend | Insforge AI (GPT-4o-mini) |
| Payments | Razorpay |
| HTTP Client | Axios |
| Storage | localStorage |
| Styling | CSS with Material Design principles |

---

## 📁 Project Structure

```
src/
  pages/
    Landing.jsx       # Public landing page
    Auth.jsx          # Sign up / Sign in (localStorage)
    Payment.jsx       # Razorpay payment gateway
    Dashboard.jsx     # User home with history, charts, stats
    Screening.jsx     # 18-question test + demographics
    Results.jsx       # Full results with AI insights
  lib/
    storage.js        # localStorage-based auth, data, and payment tracking
    scoring.js        # ASRS v1.1 scoring algorithm
    questions.js      # WHO ASRS question bank
    insforge.js       # Insforge AI integration
  context/
    AuthContext.jsx   # Global auth state
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Insforge AI Backend
VITE_INSFORGE_API_KEY=your_insforge_api_key_here
VITE_INSFORGE_API_BASE_URL=https://t7scwxfq.ap-southeast.insforge.app

# Razorpay Payment Gateway (Test Mode)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
VITE_RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

**Production:** Add these same variables in your Vercel dashboard under Settings → Environment Variables.

---

## 🔐 Privacy & Security

- ✅ **Local-first** — Core data stored in browser localStorage
- ✅ **Secure payments** — PCI-compliant Razorpay integration
- ✅ **No tracking** — No analytics, no cookies (except payment session)
- ✅ **API security** — Environment variables for sensitive keys
- ✅ **HTTPS only** — All API calls over secure connections

---

## ⚠️ Important Disclaimer

**FocusLens is a screening tool only.** It is not a medical diagnosis. Results should be discussed with a qualified healthcare professional for proper evaluation.

---

## 📝 License

MIT License - feel free to use, modify, and distribute.

---

## 🎯 Roadmap

- [x] Insforge AI integration
- [x] Razorpay payment gateway
- [ ] Export results as PDF
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Offline PWA support
- [ ] Data export/import (JSON)
- [ ] Email notifications for screening reminders

---

**Built with ❤️ for better mental health awareness**
