import { supabase } from './supabase.js'

// Calls Supabase Edge Function → Groq API (key stays server-side)
export async function getAIAnalysis(answers, totalScore, demographics) {
  const { data, error } = await supabase.functions.invoke('analyze-adhd', {
    body: { answers, totalScore, demographics }
  })
  if (error) throw new Error(error.message)
  return data
}
