import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { ASRS_QUESTIONS, ANSWER_OPTIONS, DEMOGRAPHICS_QUESTIONS } from '../lib/questions.js'
import { calculateASRSScore } from '../lib/scoring.js'
import { saveScreeningResult, hasUserPaid } from '../lib/storage.js'
import { generateAIAnalysis } from '../lib/insforge.js'


const STEPS = ['intro', 'demographics', 'screening', 'submitting']

export default function Screening() {
  const { user } = useAuth()
  const nav = useNavigate()

  const [step, setStep] = useState('intro')
  const [demographics, setDemographics] = useState({})
  const [answers, setAnswers] = useState(Array(18).fill(null))
  const [currentQ, setCurrentQ] = useState(0)
  const [saving, setSaving] = useState(false)
  const [autoSaved, setAutoSaved] = useState(false)

  // Auto-save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fl_screening_draft')
    if (saved) {
      const d = JSON.parse(saved)
      if (d.answers) setAnswers(d.answers)
      if (d.demographics) setDemographics(d.demographics)
      if (d.currentQ) setCurrentQ(d.currentQ)
      if (d.step && d.step !== 'submitting') setStep(d.step)
    }
  }, [])

  useEffect(() => {
    if (step === 'screening' || step === 'demographics') {
      localStorage.setItem('fl_screening_draft', JSON.stringify({ answers, demographics, currentQ, step }))
      setAutoSaved(true)
      const t = setTimeout(() => setAutoSaved(false), 1500)
      return () => clearTimeout(t)
    }
  }, [answers, demographics, currentQ, step])

  function answerQ(value) {
    const newAnswers = [...answers]
    newAnswers[currentQ] = value
    setAnswers(newAnswers)
    if (currentQ < 17) {
      setTimeout(() => setCurrentQ(q => q + 1), 280)
    }
  }

  async function handleSubmit() {
    setSaving(true)
    setStep('submitting')
    try {
      const score = calculateASRSScore(answers)
      
      // Check if user has paid for AI analysis
      const hasPaid = await hasUserPaid(user.id)
      let aiAnalysis = null
      
      if (hasPaid) {
        // Generate AI analysis using Insforge
        try {
          aiAnalysis = await generateAIAnalysis({
            answers,
            score,
            demographics
          })
        } catch (aiError) {
          console.error('AI analysis failed:', aiError)
          // Continue without AI analysis if it fails
        }
      }
      
      const { data, error } = await saveScreeningResult(user.id, answers, score.totalScore, aiAnalysis, score.riskLevel)
      if (error) throw error
      localStorage.removeItem('fl_screening_draft')
      nav(`/results/${data[0].id}`)
    } catch (err) {
      alert('Error saving results: ' + err.message)
      setSaving(false)
      setStep('screening')
    }
  }

  const answeredCount = answers.filter(a => a !== null).length
  const allAnswered = answeredCount === 18
  const progress = (answeredCount / 18) * 100

  if (step === 'intro') return <IntroStep onStart={() => setStep('demographics')} />
  if (step === 'demographics') return (
    <DemographicsStep
      values={demographics}
      onChange={setDemographics}
      onNext={() => setStep('screening')}
      onBack={() => setStep('intro')}
    />
  )
  if (step === 'submitting') return <SubmittingStep />

  const q = ASRS_QUESTIONS[currentQ]
  const partLabel = currentQ < 6 ? 'Part A — Core screening' : 'Part B — Extended assessment'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Brain size={19} color="var(--teal)" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>FocusLens</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {autoSaved && <span style={{ fontSize: 12, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 5 }}><Save size={12} /> Saved</span>}
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{answeredCount}/18 answered</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--border)' }}>
        <div style={{ height: '100%', background: 'var(--teal)', width: `${progress}%`, transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>
          {/* Part label */}
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            {partLabel}
          </div>

          {/* Question */}
          <div key={currentQ} className="animate-fade-up" style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 12 }}>Question {currentQ + 1} of 18</div>
            <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', lineHeight: 1.5, fontFamily: 'var(--font-display)' }}>{q.text}</h2>
            <div style={{ display: 'inline-block', marginTop: 10, padding: '3px 10px', background: 'var(--surface-2)', borderRadius: 99, fontSize: 12, color: 'var(--ink-3)', textTransform: 'capitalize' }}>
              {q.category}
            </div>
          </div>

          {/* Answer options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
            {ANSWER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => answerQ(opt.value)}
                style={{
                  padding: '14px 20px',
                  borderRadius: 10,
                  border: `2px solid ${answers[currentQ] === opt.value ? 'var(--teal)' : 'var(--border)'}`,
                  background: answers[currentQ] === opt.value ? 'var(--teal-light)' : 'white',
                  color: answers[currentQ] === opt.value ? 'var(--teal-dark)' : 'var(--ink)',
                  fontSize: 15,
                  fontWeight: answers[currentQ] === opt.value ? 600 : 400,
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn-outline"
              style={{ padding: '10px 20px' }}
              onClick={() => currentQ > 0 ? setCurrentQ(q => q - 1) : setStep('demographics')}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {currentQ < 17 ? (
              <button
                className="btn-primary"
                style={{ padding: '10px 20px' }}
                onClick={() => setCurrentQ(q => q + 1)}
                disabled={answers[currentQ] === null}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className="btn-primary"
                style={{ padding: '10px 24px', background: allAnswered ? 'var(--teal)' : undefined }}
                onClick={handleSubmit}
                disabled={!allAnswered || saving}
              >
                {saving ? 'Analysing…' : 'View results'}
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Jump to unanswered */}
          {!allAnswered && currentQ === 17 && (
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--amber)' }}>
              {18 - answeredCount} question{18 - answeredCount > 1 ? 's' : ''} still unanswered. Scroll back to complete them.
            </p>
          )}
        </div>
      </div>

      {/* Mini question nav */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', background: 'white' }}>
        {ASRS_QUESTIONS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            style={{
              width: 28, height: 28,
              borderRadius: 6,
              border: `1.5px solid ${i === currentQ ? 'var(--teal)' : answers[i] !== null ? 'var(--teal-light)' : 'var(--border)'}`,
              background: i === currentQ ? 'var(--teal)' : answers[i] !== null ? 'var(--teal-light)' : 'white',
              color: i === currentQ ? 'white' : answers[i] !== null ? 'var(--teal-dark)' : 'var(--ink-4)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

function IntroStep({ onStart }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--surface-2)' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <Brain size={40} color="var(--teal)" style={{ marginBottom: 20 }} />
          <h1 style={{ fontSize: 30, marginBottom: 14 }}>ADHD Screening</h1>
          <p style={{ color: 'var(--ink-2)', lineHeight: 1.8, marginBottom: 28 }}>
            This screening uses the <strong>WHO Adult ADHD Self-Report Scale (ASRS v1.1)</strong> — 18 questions across inattention, hyperactivity, and impulsivity.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 32 }}>
            {[['⏱', 'Takes about 5 minutes'], ['🔒', 'Your answers are private and encrypted'], ['🤖', 'AI analysis of your responses'], ['⚕️', 'Consult a professional for diagnosis']].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 14 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ color: 'var(--ink-2)' }}>{text}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16 }} onClick={onStart}>
            Begin screening <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}

function DemographicsStep({ values, onChange, onNext, onBack }) {
  const allFilled = DEMOGRAPHICS_QUESTIONS.every(q => values[q.id])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--surface)' }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Step 1 of 2</div>
          <h2 style={{ fontSize: 26, marginBottom: 8 }}>A few quick questions</h2>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 28 }}>This helps the AI filter temporary factors like sleep deprivation or stress from your results.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {DEMOGRAPHICS_QUESTIONS.map(q => (
              <div key={q.id}>
                <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>{q.label}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => onChange(v => ({ ...v, [q.id]: opt }))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: `1.5px solid ${values[q.id] === opt ? 'var(--teal)' : 'var(--border)'}`,
                        background: values[q.id] === opt ? 'var(--teal-light)' : 'white',
                        color: values[q.id] === opt ? 'var(--teal-dark)' : 'var(--ink)',
                        fontSize: 13,
                        fontWeight: values[q.id] === opt ? 600 : 400,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.12s'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            <button className="btn-outline" onClick={onBack} style={{ padding: '10px 20px' }}>
              <ChevronLeft size={16} /> Back
            </button>
            <button className="btn-primary" onClick={onNext} disabled={!allFilled} style={{ padding: '10px 24px' }}>
              Start test <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubmittingStep() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <Brain size={48} color="var(--teal)" style={{ animation: 'pulse 1.5s ease infinite' }} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>Analysing your responses…</h2>
      <p style={{ color: 'var(--ink-3)' }}>AI is generating your personalised report.</p>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}
