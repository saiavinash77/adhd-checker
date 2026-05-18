import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Brain, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { signIn, signUp } from '../lib/supabase.js'

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
    
    try {
      if (mode === 'signup') {
        const { error, data } = await signUp(form.email, form.password, form.name)
        if (error) throw error
        // For signup, check if user needs email confirmation
        if (data?.user?.identities?.length === 0) {
          setError('This email is already registered. Try signing in.')
          setLoading(false)
          return
        }
        nav('/dashboard')
      } else {
        const { error } = await signIn(form.email, form.password)
        if (error) throw error
        nav('/dashboard')
      }
    } catch (err) {
      console.error('Auth error:', err)
      // Better error messages
      if (err.message?.includes('fetch') || err.message?.includes('network')) {
        setError('Network error. Check your connection and Supabase URL is configured.')
      } else if (err.message?.includes('Invalid login') || err.message?.includes('invalid credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (err.message?.includes('User already registered')) {
        setError('This email is already registered. Please sign in.')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--surface-2)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
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
