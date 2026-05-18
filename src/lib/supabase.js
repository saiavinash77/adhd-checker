import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if env vars are properly configured
const isConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl.includes('supabase') && 
  supabaseAnonKey.length > 20

if (!isConfigured) {
  console.error('❌ Supabase not configured correctly!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'NOT SET')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET (length: ' + supabaseAnonKey.length + ')' : 'NOT SET')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key'
)

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signUp(email, password, fullName) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  })
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function saveScreeningResult(userId, answers, score, aiAnalysis, riskLevel) {
  return supabase.from('screening_results').insert({
    user_id: userId,
    answers,
    total_score: score,
    ai_analysis: aiAnalysis,
    risk_level: riskLevel,
    created_at: new Date().toISOString()
  }).select()
}

export async function getUserHistory(userId) {
  return supabase
    .from('screening_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)
}
