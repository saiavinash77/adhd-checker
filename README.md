# FocusLens — ADHD Screening App

**No backend required.** Runs entirely in your browser with localStorage.

---

## 🚀 Quick Start

### **Local Development**
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

### **Deploy to Vercel**
```bash
npm run build
npx vercel
```

That's it. No environment variables, no database setup, no API keys.

---

## ✨ Features

- ✅ **18-question WHO ASRS v1.1 screening** — Validated ADHD assessment
- ✅ **Progress tracking** — Charts showing score trends over time
- ✅ **Monthly insights** — Average scores and risk breakdown by month
- ✅ **Comparison view** — Latest vs previous screening side-by-side
- ✅ **Auto-save** — Resume screening mid-test
- ✅ **Completely private** — All data stored locally in your browser
- ✅ **No signup required** — Just create a local account (stored in localStorage)
- ✅ **Smooth Material Design UI** — Flutter-inspired design system

---

## 📊 How It Works

1. **Sign up** — Creates a local account (no server, just localStorage)
2. **Take screening** — Answer 18 questions (5 minutes)
3. **Get results** — See your score, risk level, and detailed breakdown
4. **Track progress** — Take multiple screenings to see trends over time

All data stays in your browser. Nothing is sent to any server.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| Storage | localStorage (no backend) |
| Styling | CSS with Material Design principles |

---

## 📁 Project Structure

```
src/
  pages/
    Landing.jsx       # Public landing page
    Auth.jsx          # Sign up / Sign in (localStorage)
    Dashboard.jsx     # User home with history, charts, stats
    Screening.jsx     # 18-question test + demographics
    Results.jsx       # Full results with charts
  lib/
    storage.js        # localStorage-based auth and data persistence
    scoring.js        # ASRS v1.1 scoring algorithm
    questions.js      # WHO ASRS question bank
  context/
    AuthContext.jsx   # Global auth state
```

---

## 🔐 Privacy & Security

- ✅ **No server** — Everything runs in your browser
- ✅ **No tracking** — No analytics, no cookies, no external requests
- ✅ **No data collection** — Your data never leaves your device
- ✅ **Export/delete** — Clear localStorage to delete all data

---

## ⚠️ Important Disclaimer

**FocusLens is a screening tool only.** It is not a medical diagnosis. Results should be discussed with a qualified healthcare professional for proper evaluation.

---

## 📝 License

MIT License - feel free to use, modify, and distribute.

---

## 🎯 Roadmap

- [ ] Export results as PDF
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Offline PWA support
- [ ] Data export/import (JSON)

---

**Built with ❤️ for better mental health awareness**
