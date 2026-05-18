import { useNavigate } from 'react-router-dom'
import { Brain, ShieldCheck, Clock, ChevronRight, Sparkles } from 'lucide-react'

export default function Landing() {
  const nav = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Nav */}
      <nav style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Brain size={22} color="var(--teal)" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>FocusLens</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-outline" style={{ padding: '9px 20px' }} onClick={() => nav('/auth?mode=login')}>Sign in</button>
          <button className="btn-primary" style={{ padding: '9px 20px' }} onClick={() => nav('/auth?mode=signup')}>Get started</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--teal-light)', color: 'var(--teal-dark)', padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500, marginBottom: 32 }}>
          <Sparkles size={14} />
          Based on WHO ASRS v1.1 — the gold standard screening tool
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 7vw, 64px)', marginBottom: 24, letterSpacing: '-1px' }}>
          Understand your focus,<br />
          <span style={{ fontStyle: 'italic', color: 'var(--teal)' }}>clearly.</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
          A research-backed ADHD screening tool that takes 5 minutes and gives you a detailed, AI-powered report — private, secure, and designed for clarity.
        </p>
        <button className="btn-primary" style={{ fontSize: 17, padding: '14px 36px' }} onClick={() => nav('/auth?mode=signup')}>
          Start free screening
          <ChevronRight size={18} />
        </button>
        <p style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-4)' }}>Free to use. Your data stays private and secure.</p>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {[
          { icon: <Clock size={22} color="var(--teal)" />, title: '5 minutes', body: '18 validated questions from the WHO Adult ADHD Self-Report Scale — designed to be completed without fatigue.' },
          { icon: <Brain size={22} color="var(--teal)" />, title: 'AI-powered insight', body: 'Smart AI analysis breaks down your inattention, hyperactivity, and impulsivity patterns in plain language.' },
          { icon: <ShieldCheck size={22} color="var(--teal)" />, title: 'Private by design', body: 'Your raw responses never leave your device unencrypted. We follow DPDP, GDPR, and HIPAA-aligned practices.' },
        ].map(f => (
          <div key={f.title} className="card" style={{ padding: 28 }}>
            <div style={{ marginBottom: 14 }}>{f.icon}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 10 }}>{f.title}</h3>
            <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.7 }}>{f.body}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '24px 40px', textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>
        FocusLens is a screening tool only. Always consult a qualified healthcare professional for a proper evaluation.
      </div>
    </div>
  )
}
