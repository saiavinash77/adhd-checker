import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Check, Sparkles, Lock, ArrowRight, CreditCard } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { savePayment, hasUserPaid } from '../lib/storage.js'

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

export default function Payment() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(true)

  useEffect(() => {
    // Check if user has already paid
    hasUserPaid(user.id).then(paid => {
      if (paid) {
        nav('/screening', { replace: true })
      } else {
        setCheckingPayment(false)
      }
    })
  }, [user.id, nav])

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  async function handlePayment() {
    if (!RAZORPAY_KEY_ID) {
      alert('Payment gateway not configured')
      return
    }

    setLoading(true)

    try {
      // In production, you'd create an order on your backend
      // For now, we'll use Razorpay's test mode directly
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: 29900, // ₹299 in paise (smallest currency unit)
        currency: 'INR',
        name: 'FocusLens',
        description: 'ADHD Screening with AI Analysis',
        image: '/logo.png', // Add your logo
        handler: async function (response) {
          // Payment successful
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response
          
          // Save payment to localStorage
          await savePayment(
            user.id,
            razorpay_payment_id,
            razorpay_order_id || 'test_order_' + Date.now(),
            299,
            'success'
          )
          
          // Redirect to screening
          nav('/screening', { replace: true })
        },
        prefill: {
          name: user.full_name,
          email: user.email
        },
        theme: {
          color: '#00897b'
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
      setLoading(false)
    }
  }

  if (checkingPayment) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Lock size={32} color="var(--ink-4)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--ink-3)' }}>Checking payment status…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
            <Brain size={28} color="var(--teal)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600 }}>FocusLens</span>
          </div>
          <h1 style={{ fontSize: 32, marginBottom: 12 }}>Unlock AI Insights</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 16 }}>Get personalized analysis of your ADHD screening</p>
        </div>

        {/* Pricing card */}
        <div className="card" style={{ padding: 40, marginBottom: 24, border: '2px solid var(--teal)', position: 'relative', overflow: 'hidden' }}>
          {/* Badge */}
          <div style={{ position: 'absolute', top: 16, right: 16, background: 'var(--teal)', color: 'white', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> One-time payment
          </div>

          {/* Price */}
          <div style={{ marginBottom: 28, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--teal)' }}>₹299</span>
              <span style={{ fontSize: 18, color: 'var(--ink-4)', textDecoration: 'line-through' }}>₹999</span>
            </div>
            <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Limited time offer • 70% off</p>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {[
              'Complete WHO ASRS v1.1 screening',
              'AI-powered personalized analysis',
              'Detailed symptom breakdown',
              'Track progress over time',
              'Secure & private data storage',
              'Lifetime access to your results'
            ].map(feature => (
              <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} color="var(--teal-dark)" strokeWidth={3} />
                </div>
                <span style={{ fontSize: 15, color: 'var(--ink-2)' }}>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            className="btn-primary"
            onClick={handlePayment}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px 24px', background: 'var(--teal)' }}
          >
            {loading ? (
              'Processing…'
            ) : (
              <>
                <CreditCard size={18} />
                Pay ₹299 & Start Screening
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Trust badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-4)' }}>
              <Lock size={14} />
              Secure payment
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>•</div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Powered by Razorpay</div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-4)', lineHeight: 1.6 }}>
          This is a screening tool only. Results should be discussed with a qualified healthcare professional for proper evaluation.
        </div>
      </div>
    </div>
  )
}
