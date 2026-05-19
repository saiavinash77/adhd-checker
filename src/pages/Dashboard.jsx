import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Plus, Clock, TrendingUp, LogOut, ChevronRight, AlertCircle, ArrowUp, ArrowDown, Lightbulb, BookOpen } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'
import { signOut, getUserHistory, hasUserPaid } from '../lib/storage.js'
import { RISK_LABELS } from '../lib/scoring.js'

const MOODS = [
  { emoji: '\u{1F60A}', label: 'Great', value: 5 },
  { emoji: '\u{1F642}', label: 'Good', value: 4 },
  { emoji: '\u{1F610}', label: 'Okay', value: 3 },
  { emoji: '\u{1F641}', label: 'Low', value: 2 },
  { emoji: '\u{1F62B}', label: 'Struggling', value: 1 }
]

const TIPS_BY_RISK = {
  low: [
    'Your screening suggests low symptom indicators. Keep maintaining healthy routines — they\'re working for you.',
    'Stay mindful of stress triggers. Even small disruptions can temporarily impact focus.',
    'Exercise and good sleep hygiene are protective factors. Keep at it.'
  ],
  moderate: [
    'Try the "Pomodoro Technique": 25 min focus, 5 min break. It helps bridge attention gaps.',
    'External structure helps. Try visual checklists or body-doubling (working alongside someone).',
    'Reduce decision fatigue — plan your next day\'s priorities the night before.',
    'Consider tracking your energy levels across the day. You might spot focus patterns you never noticed.'
  ],
  high: [
    'Consider sharing these results with a healthcare professional. You deserve proper support.',
    'Break tasks into absurdly small steps. "Open laptop" is a valid first step.',
    'Use the "2-minute rule": if it takes under 2 minutes, do it immediately. It reduces mental clutter.',
    'Fidget tools, background noise (brown/grey noise), or standing desks can help channel hyperactivity.'
  ]
}

const RESOURCES = [
  { title: 'ADHD & the Scattered Mind', desc: 'Understanding the neuroscience behind inattention and executive dysfunction.', icon: <Brain size={18} /> },
  { title: 'Sleep & Focus Connection', desc: 'How sleep quality directly impacts attention, impulse control, and emotional regulation.', icon: <Clock size={18} /> },
  { title: 'Managing Task Paralysis', desc: 'Practical techniques to break the freeze-response when facing overwhelming tasks.', icon: <Lightbulb size={18} /> },
  { title: 'When to See a Professional', desc: 'A guide to finding the right psychiatrist or psychologist for an ADHD evaluation.', icon: <Star size={18} /> }
]

const CHECKIN_KEY = 'fl_checkin_log'

function getCheckinLog() {
  try { return JSON.parse(localStorage.getItem(CHECKIN_KEY) || '[]') } catch { return [] }
}

function saveCheckinLog(log) {
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(log))
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function computeStreak(log) {
  if (!log.length) return 0
  const sorted = [...new Set(log.map(e => e.date))].sort().reverse()
  let streak = 0
  const today = todayStr()
  const check = sorted[0] === today ? 0 : sorted[0] === getYesterday() ? 1 : 99
  if (check === 99) return 0
  for (let i = check; i < sorted.length; i++) {
    const expected = new Date()
    expected.setDate(expected.getDate() - (i - check))
    const expStr = expected.toISOString().split('T')[0]
    if (sorted[i] === expStr) streak++
    else break
  }
  return streak
}

function getYesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function RiskBadge({ level }) {
  const r = RISK_LABELS[level] || RISK_LABELS.low
  return (
    <span style={{ background: r.bg, color: r.color, padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
      {r.label}
    </span>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkin, setCheckin] = useState(null)
  const [streak, setStreak] = useState(0)
  const [moodToday, setMoodToday] = useState(null)
  const [showCheckin, setShowCheckin] = useState(true)
  const [hasPaid, setHasPaid] = useState(false)

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  useEffect(() => {
    // Check payment status
    hasUserPaid(user.id).then(paid => {
      setHasPaid(paid)
    })
    
    getUserHistory(user.id).then(({ data }) => {
      setHistory(data || [])
      setLoading(false)
    })
    const log = getCheckinLog()
    const today = todayStr()
    const todayEntry = log.find(e => e.date === today)
    if (todayEntry) {
      setMoodToday(todayEntry.mood)
      setShowCheckin(false)
    }
    setStreak(computeStreak(log))
  }, [user.id])

  function handleMood(mood) {
    const log = getCheckinLog()
    const today = todayStr()
    const filtered = log.filter(e => e.date !== today)
    const updated = [...filtered, { date: today, mood }]
    saveCheckinLog(updated)
    setMoodToday(mood)
    setShowCheckin(false)
    setStreak(computeStreak(updated))
  }

  function handleDismissCheckin() {
    setShowCheckin(false)
  }

  async function handleSignOut() {
    await signOut()
    nav('/')
  }

  const latest = history[0]
  const chartData = [...history].reverse().map((r, i) => ({
    date: new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    score: r.total_score,
    risk: r.risk_level,
    id: r.id
  }))

  const avgScore = history.length > 0 ? Math.round(history.reduce((sum, r) => sum + r.total_score, 0) / history.length) : 0
  const highestScore = history.length > 0 ? Math.max(...history.map(r => r.total_score)) : 0
  const lowestScore = history.length > 0 ? Math.min(...history.map(r => r.total_score)) : 0
  const scoreChange = history.length > 1 ? latest.total_score - history[1].total_score : 0
  const isImproving = scoreChange < 0

  const monthlyStats = {}
  history.forEach(r => {
    const month = new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    if (!monthlyStats[month]) monthlyStats[month] = { count: 0, scores: [], avgRisk: {} }
    monthlyStats[month].count++
    monthlyStats[month].scores.push(r.total_score)
    monthlyStats[month].avgRisk[r.risk_level] = (monthlyStats[month].avgRisk[r.risk_level] || 0) + 1
  })

  const monthlyData = Object.entries(monthlyStats).map(([month, data]) => ({
    month,
    avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
    count: data.count,
    riskBreakdown: data.avgRisk
  })).reverse()

  const tips = latest ? TIPS_BY_RISK[latest.risk_level] || TIPS_BY_RISK.low : []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Nav */}
      <nav style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Brain size={20} color="var(--teal)" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 19 }}>FocusLens</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>{user?.email}</span>
          <button onClick={handleSignOut} style={{ background: 'none', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', fontSize: 14 }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 36, marginBottom: 6 }}>Hello, {name}.</h1>
            <p style={{ color: 'var(--ink-3)', fontSize: 16 }}>
              {history.length === 0 ? 'Ready for your first screening?' : `You have ${history.length} completed screening${history.length > 1 ? 's' : ''}.`}
            </p>
          </div>
          <button className="btn-primary" onClick={() => nav(hasPaid ? '/screening' : '/payment')}>
            <Plus size={18} />
            New screening
          </button>
        </div>

        {/* Daily check-in */}
        {showCheckin && (
          <div className="checkin-card">
            <div>
              <h3>How are you feeling today?</h3>
              <p>A quick check-in builds your personal insights over time.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="checkin-options">
                {MOODS.map(m => (
                  <button key={m.value} className={`checkin-mood ${moodToday === m.value ? 'selected' : ''}`}
                    onClick={() => handleMood(m.value)}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
              <button className="checkin-dismiss" onClick={handleDismissCheckin}>Skip</button>
            </div>
          </div>
        )}

        {/* Streak */}
        {streak > 0 && (
          <div className="streak-bar">
            <span className="streak-fire">{'\u{1F525}'}</span>
            <span className="streak-count">{streak}</span>
            <div>
              <div className="streak-label">day streak</div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Keep showing up for yourself</div>
            </div>
          </div>
        )}

        {/* Stats row */}
        {history.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 36 }}>
            {[
              { label: 'Screenings completed', value: history.length, icon: <Brain size={18} color="var(--teal)" /> },
              { label: 'Latest score', value: `${latest.total_score}/72`, icon: <TrendingUp size={18} color="var(--teal)" /> },
              { label: 'Average score', value: `${avgScore}/72`, icon: <Brain size={18} color="var(--teal)" /> },
              { label: 'Last screening', value: new Date(latest.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), icon: <Clock size={18} color="var(--teal)" /> },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--ink-3)', fontSize: 13 }}>
                  {s.icon} {s.label}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {history.length > 0 && tips.length > 0 && (
          <div className="tips-card">
            <h3><Lightbulb size={18} color="var(--teal)" /> Tips based on your results</h3>
            {tips.map((tip, i) => (
              <div key={i} className="tip-item">
                <div className="tip-bullet" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ background: 'var(--amber-light)', border: '1px solid #fcd34d', borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 36 }}>
          <AlertCircle size={18} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
            <strong>Important:</strong> FocusLens is a screening tool for informational purposes only. If you have concerns about ADHD, please consult a qualified healthcare professional.
          </p>
        </div>

        {/* Progress tracking chart */}
        {history.length > 1 && (
          <div className="card" style={{ padding: 32, marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, marginBottom: 20 }}>Your progress over time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--teal)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--ink-3)' }} />
                <YAxis domain={[0, 72]} tick={{ fontSize: 12, fill: 'var(--ink-3)' }} />
                <Tooltip 
                  contentStyle={{ fontFamily: 'var(--font-body)', fontSize: 13, borderRadius: 8, background: 'white', border: '1px solid var(--border)' }}
                  formatter={(value) => [`${value}/72`, 'Score']}
                />
                <Area type="monotone" dataKey="score" stroke="var(--teal)" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 24 }}>
              <div style={{ padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 4 }}>Highest score</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)' }}>{highestScore}</div>
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 4 }}>Lowest score</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)' }}>{lowestScore}</div>
              </div>
              <div style={{ padding: '12px 16px', background: isImproving ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 4 }}>Latest change</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isImproving ? <ArrowDown size={18} color="#10b981" /> : <ArrowUp size={18} color="#ef4444" />}
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: isImproving ? '#10b981' : '#ef4444' }}>
                    {Math.abs(scoreChange)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly stats */}
        {monthlyData.length > 0 && (
          <div className="card" style={{ padding: 32, marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, marginBottom: 20 }}>Monthly insights</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--ink-3)' }} />
                <YAxis domain={[0, 72]} tick={{ fontSize: 12, fill: 'var(--ink-3)' }} />
                <Tooltip 
                  contentStyle={{ fontFamily: 'var(--font-body)', fontSize: 13, borderRadius: 8, background: 'white', border: '1px solid var(--border)' }}
                  formatter={(value) => [`${value}/72`, 'Avg Score']}
                />
                <Bar dataKey="avgScore" fill="var(--teal)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 20 }}>
              {monthlyData.map((m, i) => (
                <div key={i} style={{ padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', marginBottom: 6 }}>{m.month}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 8 }}>
                    {m.count} screening{m.count > 1 ? 's' : ''} • Avg: {m.avgScore}/72
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {Object.entries(m.riskBreakdown).map(([risk, count]) => {
                      const r = RISK_LABELS[risk]
                      return (
                        <span key={risk} style={{ fontSize: 11, padding: '2px 8px', background: r.bg, color: r.color, borderRadius: 4, fontWeight: 600 }}>
                          {count} {risk}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison view */}
        {history.length > 1 && (
          <div className="card" style={{ padding: 32, marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, marginBottom: 20 }}>Latest vs previous screening</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ padding: 20, background: 'var(--surface-2)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Latest</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--ink)', marginBottom: 8 }}>{latest.total_score}</div>
                <RiskBadge level={latest.risk_level} />
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
                  {new Date(latest.created_at).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div style={{ padding: 20, background: 'var(--surface-2)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Previous</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--ink)', marginBottom: 8 }}>{history[1].total_score}</div>
                <RiskBadge level={history[1].risk_level} />
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
                  {new Date(history[1].created_at).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
            {scoreChange !== 0 && (
              <div style={{ marginTop: 20, padding: '12px 16px', background: isImproving ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                {isImproving ? <ArrowDown size={20} color="#10b981" /> : <ArrowUp size={20} color="#ef4444" />}
                <div>
                  <div style={{ fontWeight: 600, color: isImproving ? '#10b981' : '#ef4444', fontSize: 14 }}>
                    {isImproving ? 'Improving' : 'Increased'} by {Math.abs(scoreChange)} points
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    {isImproving ? 'Lower scores indicate fewer symptoms.' : 'Higher scores indicate more symptoms.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resources */}
        {history.length > 0 && (
          <div className="card" style={{ padding: 32, marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={20} color="var(--teal)" /> Resources
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {RESOURCES.map((r, i) => (
                <div key={i} style={{ padding: '18px 20px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid transparent', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal-light)'; e.currentTarget.style.borderColor = 'var(--teal)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'transparent' }}
                  onClick={() => window.open('https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd', '_blank')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--teal)' }}>
                    {r.icon}
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {loading ? (
          <p style={{ color: 'var(--ink-4)', textAlign: 'center', padding: 40 }}>Loading history…</p>
        ) : history.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <Brain size={40} color="var(--teal-light)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 22, marginBottom: 10 }}>No screenings yet</h3>
            <p style={{ color: 'var(--ink-3)', marginBottom: 24 }}>Your first screening takes about 5 minutes.</p>
            <button className="btn-primary" onClick={() => nav(hasPaid ? '/screening' : '/payment')}>
              <Plus size={16} /> Start screening
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 16 }}>Screening history</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {history.map(r => (
                <div key={r.id} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  onClick={() => nav(`/results/${r.id}`)}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1 }}>{r.total_score}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>/ 72</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {new Date(r.created_at).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <RiskBadge level={r.risk_level} />
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--ink-4)" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
