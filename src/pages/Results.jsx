import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Brain, ArrowLeft, Download, RefreshCw, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { supabase } from '../lib/supabase.js'
import { ASRS_QUESTIONS, ANSWER_OPTIONS } from '../lib/questions.js'
import { RISK_LABELS } from '../lib/scoring.js'

export default function Results() {
  const { id } = useParams()
  const nav = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('screening_results').select('*').eq('id', id).single().then(({ data }) => {
      setResult(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--ink-3)' }}>Loading results…</p>
    </div>
  )
  if (!result) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--ink-3)' }}>Result not found.</p>
    </div>
  )

  const risk = RISK_LABELS[result.risk_level]
  const answers = result.answers

  // Compute category scores
  const byCategory = { inattention: [], hyperactivity: [], impulsivity: [] }
  ASRS_QUESTIONS.forEach((q, i) => byCategory[q.category].push(answers[i] || 0))
  const catScores = Object.entries(byCategory).map(([cat, vals]) => ({
    category: cat.charAt(0).toUpperCase() + cat.slice(1),
    score: vals.reduce((a, b) => a + b, 0),
    max: vals.length * 4,
    avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  }))

  const radarData = catScores.map(c => ({ subject: c.category, A: Math.round((c.score / c.max) * 100) }))

  const partAScore = answers.slice(0, 6).reduce((a, b) => a + b, 0)
  const partBScore = answers.slice(6).reduce((a, b) => a + b, 0)

  const ai = result.ai_analysis || {}

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Nav */}
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow)' }}>
        <button onClick={() => nav('/dashboard')} style={{ background: 'none', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-3)', fontSize: 15, fontWeight: 500, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--teal)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}>
          <ArrowLeft size={18} /> Dashboard
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Brain size={20} color="var(--teal)" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.5px' }}>FocusLens</span>
        </div>
        <button onClick={() => nav('/screening')} style={{ background: 'none', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--teal)', fontSize: 15, fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <RefreshCw size={16} /> Retest
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 32px' }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 14, color: 'var(--ink-4)', marginBottom: 8, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {new Date(result.created_at).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 40, marginBottom: 24, color: 'var(--ink)' }}>Your screening results</h1>

          {/* Risk banner */}
          <div style={{ background: risk.bg, border: `2px solid ${risk.color}`, borderRadius: 'var(--radius)', padding: '24px 28px', display: 'flex', alignItems: 'flex-start', gap: 16, boxShadow: `0 4px 12px ${risk.color}20` }}>
            {result.risk_level === 'low' ? <CheckCircle size={24} color={risk.color} style={{ flexShrink: 0, marginTop: 2 }} /> : <AlertCircle size={24} color={risk.color} style={{ flexShrink: 0, marginTop: 2 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: risk.color, marginBottom: 6, fontSize: 18 }}>{risk.label}</div>
              <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.7 }}>{risk.desc}</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, color: risk.color, lineHeight: 1, fontWeight: 700 }}>{result.total_score}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 4, fontWeight: 500 }}>out of 72</div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ background: 'var(--surface-2)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', display: 'flex', gap: 12, marginBottom: 40, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7 }}>
          <Info size={18} style={{ flexShrink: 0, marginTop: 2, color: 'var(--teal)' }} />
          This is a screening tool only. Please consult a qualified healthcare professional for a proper evaluation.
        </div>

        {/* Score breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div className="card" style={{ padding: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>Part A — Core (Q1–6)</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--ink)', lineHeight: 1, marginBottom: 4, fontWeight: 700 }}>{partAScore}<span style={{ fontSize: 20, color: 'var(--ink-4)', fontWeight: 500 }}>/24</span></div>
            <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Primary diagnostic sensitivity questions</p>
            <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ height: '100%', background: 'var(--teal)', width: `${(partAScore / 24) * 100}%`, borderRadius: 'var(--radius-sm)', transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </div>
          </div>
          <div className="card" style={{ padding: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>Part B — Extended (Q7–18)</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--ink)', lineHeight: 1, marginBottom: 4, fontWeight: 700 }}>{partBScore}<span style={{ fontSize: 20, color: 'var(--ink-4)', fontWeight: 500 }}>/48</span></div>
            <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Detailed symptom pattern questions</p>
            <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ height: '100%', background: 'var(--ink-3)', width: `${(partBScore / 48) * 100}%`, borderRadius: 'var(--radius-sm)', transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Category breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontFamily: 'var(--font-body)', fill: 'var(--ink-3)' }} />
                <Radar name="Score" dataKey="A" stroke="var(--teal)" fill="var(--teal)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Average response per category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catScores} barSize={36}>
                <XAxis dataKey="category" tick={{ fontSize: 12, fontFamily: 'var(--font-body)', fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [v, 'Avg score']} contentStyle={{ fontFamily: 'var(--font-body)', fontSize: 13, borderRadius: 8 }} />
                <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                  {catScores.map((_, i) => <Cell key={i} fill={['#0d9488', '#f59e0b', '#ef4444'][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Analysis */}
        {ai.summary && (
          <div className="card" style={{ padding: 40, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <Brain size={24} color="var(--teal)" />
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>AI insights</h2>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-4)', background: 'var(--surface-2)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontWeight: 600, letterSpacing: '0.5px' }}>Personalized analysis</span>
            </div>
            <p style={{ color: 'var(--ink-2)', lineHeight: 1.8, fontSize: 16, marginBottom: 28, fontWeight: 500 }}>{ai.summary}</p>
            {ai.sections?.map((s, i) => (
              <div key={i} style={{ marginBottom: 24, paddingLeft: 20, borderLeft: '3px solid var(--teal)' }}>
                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 16, color: 'var(--ink)' }}>{s.title}</div>
                <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.8 }}>{s.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Full answer review */}
        <div className="card" style={{ padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, marginBottom: 20 }}>Your responses</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ASRS_QUESTIONS.map((q, i) => {
              const ans = answers[i]
              const opt = ANSWER_OPTIONS.find(o => o.value === ans)
              const intensity = ans / 4
              return (
                <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 0', borderBottom: i < 17 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ minWidth: 28, height: 28, borderRadius: 6, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 6 }}>{q.text}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 99,
                        background: `rgba(13,148,136,${0.1 + intensity * 0.3})`,
                        color: intensity > 0.5 ? 'var(--teal-dark)' : 'var(--teal)'
                      }}>
                        {opt?.label || 'No answer'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'capitalize' }}>{q.category}</span>
                      {q.part === 'A' && <span style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 600 }}>Part A</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 16 }}>Want to track changes over time?</p>
          <button className="btn-primary" onClick={() => nav('/dashboard')}>
            View dashboard
          </button>
        </div>

      </div>
    </div>
  )
}
