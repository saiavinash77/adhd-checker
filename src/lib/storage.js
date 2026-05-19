// Local storage-based auth and data persistence (no backend needed)

const STORAGE_KEYS = {
  USER: 'focuslens_user',
  SCREENINGS: 'focuslens_screenings',
  SESSION: 'focuslens_session',
  PAYMENTS: 'focuslens_payments'
}

// Simple user management
export function getCurrentUser() {
  const session = localStorage.getItem(STORAGE_KEYS.SESSION)
  if (!session) return null
  
  const { userId, expiresAt } = JSON.parse(session)
  if (Date.now() > expiresAt) {
    signOut()
    return null
  }
  
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '[]')
  return users.find(u => u.id === userId) || null
}

export async function signUp(email, password, fullName) {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '[]')
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
    return { error: { message: 'This email is already registered. Please sign in.' }, data: null }
  }
  
  const newUser = {
    id: crypto.randomUUID(),
    email,
    full_name: fullName,
    created_at: new Date().toISOString()
  }
  
  users.push({ ...newUser, password }) // In real app, hash password
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(users))
  
  // Create session
  const session = {
    userId: newUser.id,
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  }
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
  
  return { data: { user: newUser }, error: null }
}

export async function signIn(email, password) {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '[]')
  const user = users.find(u => u.email === email && u.password === password)
  
  if (!user) {
    return { error: { message: 'Invalid email or password. Please try again.' }, data: null }
  }
  
  // Create session
  const session = {
    userId: user.id,
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  }
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
  
  const { password: _, ...userWithoutPassword } = user
  return { data: { user: userWithoutPassword }, error: null }
}

export async function signOut() {
  localStorage.removeItem(STORAGE_KEYS.SESSION)
  return { error: null }
}

// Screening results management
export async function saveScreeningResult(userId, answers, score, aiAnalysis, riskLevel) {
  const screenings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCREENINGS) || '[]')
  
  const newScreening = {
    id: crypto.randomUUID(),
    user_id: userId,
    answers,
    total_score: score,
    ai_analysis: aiAnalysis,
    risk_level: riskLevel,
    created_at: new Date().toISOString()
  }
  
  screenings.push(newScreening)
  localStorage.setItem(STORAGE_KEYS.SCREENINGS, JSON.stringify(screenings))
  
  return { data: [newScreening], error: null }
}

export async function getUserHistory(userId) {
  const screenings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCREENINGS) || '[]')
  const userScreenings = screenings
    .filter(s => s.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
  
  return { data: userScreenings, error: null }
}

export async function getScreeningById(id) {
  const screenings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCREENINGS) || '[]')
  const screening = screenings.find(s => s.id === id)
  return { data: screening, error: screening ? null : { message: 'Not found' } }
}

// Payment management
export async function savePayment(userId, paymentId, orderId, amount, status = 'success') {
  const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]')
  
  const newPayment = {
    id: crypto.randomUUID(),
    user_id: userId,
    payment_id: paymentId,
    order_id: orderId,
    amount,
    status,
    created_at: new Date().toISOString()
  }
  
  payments.push(newPayment)
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments))
  
  return { data: newPayment, error: null }
}

export async function hasUserPaid(userId) {
  const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]')
  const userPayments = payments.filter(p => p.user_id === userId && p.status === 'success')
  return userPayments.length > 0
}

export async function getUserPayments(userId) {
  const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]')
  return payments.filter(p => p.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}
