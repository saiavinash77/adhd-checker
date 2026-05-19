import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Brain, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { signIn, signUp } from '../lib/storage.js'

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'login' ? 'login' : 'signup')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const nav = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (mode === 'signup' && !form.name) {
      setError('Please enter your name')
      setLoading(false)
      return
    }

    try {
      if (mode === 'signup') {
        const { error, data } = await signUp(form.email, form.password, form.name)
        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }
        // Immediately sign in after signup (localStorage-based, no email verification)
        nav('/dashboard')
      } else {
        const { error } = await signIn(form.email, form.password)
        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }
        nav('/dashboard')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    
    try {
      // For localStorage version, we'll simulate Google OAuth
      // In production, you'd integrate with Google OAuth properly
      const googleEmail = prompt('Enter your Google email (demo):')
      if (!googleEmail) {
        setLoading(false)
        return
      }
      
      const googleName = googleEmail.split('@')[0]
      
      // Check if user exists
      const users = JSON.parse(localStorage.getItem('focuslens_user') || '[]')
      const existingUser = users.find(u => u.email === googleEmail)
      
      if (existingUser) {
        // Sign in existing user
        const session = {
          userId: existingUser.id,
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
        }
        localStorage.setItem('focuslens_session', JSON.stringify(session))
        nav('/dashboard')
      } else {
        // Create new user
        const { error } = await signUp(googleEmail, 'google_oauth_' + Date.now(), googleName)
        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }
        nav('/dashboard')
      }
    } catch (err) {
      console.error('Google sign in error:', err)
      setError('Google sign in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--surface-2)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Brain size={26} color="var(--teal)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>FocusLens</span>
          </Link>
        </div>

        <div className="card" style={{ padding: 36 }}>
          <h2 style={{ fontSize: 26, marginBottom: 6, textAlign: 'center' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 14, marginBottom: 28 }}>
            {mode === 'login' ? 'Sign in to access your screening history' : 'Your data is private and encrypted'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Full name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
            )}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--ink-4)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '12px 16px', borderRadius: 8, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={18} />{error}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 13, color: 'var(--ink-4)' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Google Sign In */}
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 10,
              border: '2px solid var(--border)',
              background: 'white',
              color: 'var(--ink)',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'all 0.2s',
              fontFamily: 'var(--font-body)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--ink-3)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ background: 'none', color: 'var(--teal)', fontWeight: 600, textDecoration: 'underline' }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
