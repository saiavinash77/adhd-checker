import { useNavigate } from 'react-router-dom'
import { Brain, ShieldCheck, Clock, ChevronRight, Sparkles, Heart, Star, ArrowRight, ChevronDown, FileText, BarChart3, Lightbulb } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  { q: 'What is ADHD and is this a diagnosis?', a: 'ADHD (Attention Deficit Hyperactivity Disorder) is a neurodevelopmental condition affecting focus, impulse control, and restlessness. This is a screening tool, not a diagnosis. Only a qualified healthcare professional can diagnose ADHD. Think of this as a first step toward understanding your patterns.' },
  { q: 'How accurate is the ASRS v1.1 screening?', a: 'The WHO Adult ADHD Self-Report Scale v1.1 is the most widely validated ADHD screening instrument globally. Part A alone has 93.7% sensitivity and 90% specificity in clinical studies. Combined with our AI analysis, it gives you a comprehensive picture.' },
  { q: 'Is my data private?', a: 'Yes. Your responses are stored encrypted in a HIPAA-aligned Supabase database with Row-Level Security — only you can access your results. We never share, sell, or analyse your data. The AI analysis uses anonymised scores only.' },
  { q: 'What if my results show significant indicators?', a: 'The screening suggests you may have symptoms consistent with ADHD, but many conditions (anxiety, sleep disorders, thyroid issues) can mimic ADHD symptoms. We strongly recommend sharing these results with a healthcare professional for a proper evaluation.' },
  { q: 'How long does it take?', a: 'The full screening takes about 5 minutes — 18 questions with simple frequency-based answers. You can also pause and resume anytime; your progress is auto-saved.' }
]

const symptoms = [
  'Struggle to finish tasks even when you really want to?',
  'Feel restless or fidgety when you need to sit still?',
  'Get distracted by every little thing around you?',
  'Have thoughts racing so fast you can\'t catch them?',
  'Feel like you\'re always running five minutes behind?',
  'Re-read the same paragraph three times without absorbing it?'
]

export default function Landing() {
  const nav = useNavigate()
  const [faqOpen, setFaqOpen] = useState(null)

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <Brain size={24} color="var(--teal)" />
          <span>FocusLens</span>
        </div>
        <div className="landing-nav-actions">
          <button className="btn-ghost" onClick={() => nav('/auth?mode=login')}>Sign in</button>
          <button className="btn-primary" onClick={() => nav('/auth?mode=signup')}>
            Start screening <ChevronRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={13} />
          Based on the WHO ASRS v1.1 — <strong>93.7% sensitivity</strong>
        </div>
        <h1 className="hero-title">
          Your mind doesn't have to feel<br />
          <span className="gradient-text">like a storm.</span>
        </h1>
        <p className="hero-desc">
          If you've ever felt like your brain is working against you — scattered, restless, 
          always overthinking — you're not alone. FocusLens helps you understand your patterns 
          with a clinically validated screening and clear AI-powered insights, all in 5 minutes.
        </p>
        <button className="btn-primary btn-hero" onClick={() => nav('/auth?mode=signup')}>
          Start free screening <ArrowRight size={18} />
        </button>
        <div className="hero-stats">
          <span><ShieldCheck size={14} /> Private & secure</span>
          <span><Clock size={14} /> Takes 5 minutes</span>
          <span><Brain size={14} /> AI-powered analysis</span>
        </div>
      </section>

      {/* Relatable symptoms */}
      <section className="section">
        <div className="section-label">Does this sound familiar?</div>
        <h2 className="section-title">You're not broken. <br />Your brain just works differently.</h2>
        <div className="symptom-grid">
          {symptoms.map((s, i) => (
            <div key={i} className="symptom-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="symptom-num">{String(i + 1).padStart(2, '0')}</div>
              <p>{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section section-alt">
        <div className="section-label">How it works</div>
        <h2 className="section-title">Three steps to clarity</h2>
        <div className="steps-grid">
          {[
            { icon: <FileText size={24} />, step: '01', title: 'Answer 18 questions', desc: 'Simple frequency-based questions from the WHO ASRS v1.1. Takes about 5 minutes, auto-saves if you need a break.' },
            { icon: <Brain size={24} />, step: '02', title: 'AI analyses your pattern', desc: 'Our AI interprets your responses against clinical patterns — factoring in sleep, stress, and lifestyle context you provide.' },
            { icon: <BarChart3 size={24} />, step: '03', title: 'Get your personal report', desc: 'A detailed breakdown of your inattention, hyperactivity, and impulsivity patterns with clear, compassionate explanations.' }
          ].map((s, i) => (
            <div key={i} className="step-card" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="step-icon">{s.icon}</div>
              <div className="step-num">{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="section-label">Why FocusLens</div>
        <h2 className="section-title">Built with care, backed by science</h2>
        <div className="features-grid">
          {[
            { icon: <Heart size={22} />, title: 'Compassionate by design', body: 'No clinical jargon. No judgment. Just clear, human language that helps you understand yourself better.' },
            { icon: <ShieldCheck size={22} />, title: 'Your data stays yours', body: 'Row-Level Security means only you can see your results. We follow DPDP, GDPR, and HIPAA-aligned practices.' },
            { icon: <Brain size={22} />, title: 'AI that contextualises', body: 'The AI factors in your sleep, stress, and lifestyle — giving you insights that account for your real life.' },
            { icon: <BarChart3 size={22} />, title: 'Track over time', body: 'Take the screening periodically and see how your patterns evolve with rich charts and comparison views.' },
            { icon: <Lightbulb size={22} />, title: 'Actionable insights', body: 'Not just scores. You get specific patterns and context-aware recommendations for what to do next.' },
            { icon: <Clock size={22} />, title: '5 minutes, no friction', body: '18 questions, simple answers. Auto-saves your progress. Start and finish on your own time.' }
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section section-alt">
        <div className="section-label">Real experiences</div>
        <h2 className="section-title">What people are saying</h2>
        <div className="testimonial-grid">
          {[
            { quote: 'I\'ve been wondering if I have ADHD for years but was too scared to ask. This gave me the clarity and confidence to talk to my doctor.', name: 'Arun', role: 'Software developer, 28' },
            { quote: 'The AI report described my exact struggles — things I couldn\'t put into words. I actually cried reading it because I felt seen.', name: 'Priya', role: 'Designer, 34' },
            { quote: 'I always thought I was just lazy or undisciplined. Seeing my results showed me there\'s a real pattern to it. Life-changing perspective.', name: 'Rahul', role: 'Student, 22' }
          ].map((t, i) => (
            <div key={i} className="testimonial-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="testimonial-stars">
                {[...Array(5)].map((_, si) => <Star key={si} size={14} fill="var(--amber)" color="var(--amber)" />)}
              </div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="section-label">Common questions</div>
        <h2 className="section-title">Everything you need to know</h2>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${faqOpen === i ? 'faq-open' : ''}`} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
              <div className="faq-question">
                <span>{faq.q}</span>
                <ChevronDown size={18} className="faq-chevron" />
              </div>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="section cta-section">
        <div className="cta-card">
          <h2>Ready to understand your mind better?</h2>
          <p>5 minutes. Private. Free. You deserve clarity.</p>
          <button className="btn-primary btn-hero" onClick={() => nav('/auth?mode=signup')}>
            Start screening <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Brain size={20} color="var(--teal)" />
            <span>FocusLens</span>
          </div>
          <p className="footer-disclaimer">
            FocusLens is a screening tool for informational purposes only. It is not a diagnostic instrument. 
            Always consult a qualified healthcare professional for a proper evaluation. If you are in crisis, 
            please contact your local mental health helpline immediately.
          </p>
        </div>
      </footer>
    </div>
  )
}
