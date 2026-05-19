# FocusLens Deployment Guide

## 🚀 Quick Deployment to Vercel

### Step 1: Prepare Environment Variables

You'll need these credentials:

**Insforge AI:**
- API Key: `ik_356b4ac68987bfec5a08d78bb6c68f3e`
- API Base URL: `https://t7scwxfq.ap-southeast.insforge.app`

**Razorpay (Test Mode):**
- Key ID: `rzp_test_SrFU1RLyW6LA4g`
- Key Secret: `RiyPfzdMyz95wdeLeDNZtkOB`

### Step 2: Deploy to Vercel

```bash
# Build the project
npm run build

# Deploy to Vercel
npx vercel

# Follow the prompts:
# - Link to existing project or create new
# - Select the project directory
# - Accept default settings
```

### Step 3: Add Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable Name | Value |
|--------------|-------|
| `VITE_INSFORGE_API_KEY` | `ik_356b4ac68987bfec5a08d78bb6c68f3e` |
| `VITE_INSFORGE_API_BASE_URL` | `https://t7scwxfq.ap-southeast.insforge.app` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_test_SrFU1RLyW6LA4g` |
| `VITE_RAZORPAY_KEY_SECRET` | `RiyPfzdMyz95wdeLeDNZtkOB` |

5. Select **Production**, **Preview**, and **Development** for each variable
6. Click **Save**

### Step 4: Redeploy

After adding environment variables, trigger a new deployment:

```bash
npx vercel --prod
```

Or go to Vercel dashboard → Deployments → Redeploy

---

## 🧪 Testing Payment Flow

### Test Mode (Development)

Use Razorpay test cards:

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**Failure:**
- Card: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Production Mode

To enable live payments:

1. Get production Razorpay keys from https://dashboard.razorpay.com/
2. Update environment variables in Vercel:
   - `VITE_RAZORPAY_KEY_ID` → Your live key
   - `VITE_RAZORPAY_KEY_SECRET` → Your live secret
3. Redeploy

---

## 🔧 Local Development

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/saiavinash77/adhd-checker.git
cd adhd-checker

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your credentials
# (Use the credentials from Step 1 above)

# 5. Run development server
npm run dev
```

### Testing Locally

1. Open http://localhost:5173
2. Sign up with any email/password (stored in localStorage)
3. Click "New screening" → redirects to payment page
4. Use test card to complete payment
5. Take the screening
6. View AI-powered results

---

## 🐛 Troubleshooting

### White Screen on Vercel

**Cause:** Environment variables not set or build failed

**Fix:**
1. Check Vercel build logs for errors
2. Verify all environment variables are set correctly
3. Redeploy after fixing

### Payment Not Working

**Cause:** Razorpay script not loaded or invalid keys

**Fix:**
1. Check browser console for errors
2. Verify `VITE_RAZORPAY_KEY_ID` is set correctly
3. Ensure you're using test keys for test mode
4. Check Razorpay dashboard for payment logs

### AI Analysis Not Showing

**Cause:** Insforge API error or invalid credentials

**Fix:**
1. Check browser console for API errors
2. Verify `VITE_INSFORGE_API_KEY` and `VITE_INSFORGE_API_BASE_URL` are correct
3. Test API endpoint manually:
   ```bash
   curl -X POST https://t7scwxfq.ap-southeast.insforge.app/v1/chat/completions \
     -H "Authorization: Bearer ik_356b4ac68987bfec5a08d78bb6c68f3e" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'
   ```
4. If API fails, the app will show fallback analysis (no error to user)

### localStorage Data Lost

**Cause:** Browser cleared cache or incognito mode

**Fix:**
- localStorage is browser-specific and cleared when cache is cleared
- Consider implementing data export/import feature (future roadmap)
- For production, consider adding optional cloud backup

---

## 📊 Monitoring

### Check Payment Status

Payments are stored in localStorage under `focuslens_payments`:

```javascript
// Open browser console
JSON.parse(localStorage.getItem('focuslens_payments'))
```

### Check User Data

```javascript
// Users
JSON.parse(localStorage.getItem('focuslens_user'))

// Screenings
JSON.parse(localStorage.getItem('focuslens_screenings'))

// Session
JSON.parse(localStorage.getItem('focuslens_session'))
```

### Clear All Data (Reset)

```javascript
localStorage.clear()
location.reload()
```

---

## 🔐 Security Notes

1. **API Keys in Frontend:**
   - Insforge API key is exposed in frontend (necessary for client-side calls)
   - Razorpay key ID is public (key secret should never be exposed)
   - Consider implementing a backend proxy for production

2. **Payment Verification:**
   - Current implementation trusts client-side payment confirmation
   - For production, implement server-side payment verification using Razorpay webhooks

3. **Data Privacy:**
   - All user data stored in localStorage (client-side only)
   - No server-side storage or tracking
   - Users can clear data anytime by clearing browser cache

---

## 📈 Production Checklist

Before going live:

- [ ] Replace test Razorpay keys with production keys
- [ ] Implement server-side payment verification
- [ ] Add backend proxy for Insforge API calls
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Add analytics (optional, respect user privacy)
- [ ] Implement data export feature
- [ ] Add terms of service and privacy policy
- [ ] Test on multiple browsers and devices
- [ ] Set up custom domain
- [ ] Enable HTTPS (automatic on Vercel)

---

## 🆘 Support

For issues or questions:
- GitHub Issues: https://github.com/saiavinash77/adhd-checker/issues
- Email: your-email@example.com

---

**Happy deploying! 🚀**
