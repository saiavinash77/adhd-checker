// Supabase Edge Function — runs on Deno
// Deploy: supabase functions deploy analyze-adhd
// Set secret: supabase secrets set GROQ_API_KEY=your_key

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { answers, totalScore, demographics } = await req.json()

    const ANSWER_LABELS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often']
    const QUESTIONS = [
      'Trouble wrapping up final details of a project',
      'Difficulty getting things in order when organising',
      'Problems remembering appointments or obligations',
      'Avoiding or delaying tasks that require thought',
      'Fidgeting or squirming when sitting for a long time',
      'Feeling overly active, driven by a motor',
      'Making careless mistakes on boring or difficult work',
      'Difficulty keeping attention on repetitive work',
      'Difficulty concentrating on what people say',
      'Misplacing or difficulty finding things',
      'Distracted by activity or noise around you',
      'Leaving seat when expected to remain seated',
      'Feeling restless or fidgety',
      'Difficulty unwinding and relaxing',
      'Talking too much in social situations',
      'Finishing others\' sentences in conversation',
      'Difficulty waiting your turn',
      'Interrupting others when they are busy'
    ]

    const answerSummary = QUESTIONS.map((q, i) =>
      `Q${i + 1}: ${q} → ${ANSWER_LABELS[answers[i] ?? 0]}`
    ).join('\n')

    const demographicContext = demographics ? `
Demographics context (use this to contextualise — do NOT diagnose):
- Age group: ${demographics.age_group}
- Gender: ${demographics.gender}
- Recent sleep: ${demographics.sleep_quality}
- Stress level: ${demographics.stress_level}
- Daily caffeine: ${demographics.caffeine}
` : ''

    const prompt = `You are a clinical psychology assistant helping interpret an ADHD screening result. You are NOT diagnosing anyone. This is a screening tool only.

IMPORTANT RULES:
1. Never say the user "has ADHD" or "does not have ADHD"
2. Use language like "your responses suggest...", "the pattern indicates..."
3. Always recommend professional evaluation
4. Be compassionate, clear, and non-alarmist

Total ASRS v1.1 score: ${totalScore}/72
${demographicContext}

Responses:
${answerSummary}

Please provide a JSON response with this exact structure:
{
  "summary": "2-3 sentence plain English overview of the overall pattern",
  "sections": [
    { "title": "Inattention pattern", "content": "..." },
    { "title": "Hyperactivity & impulsivity pattern", "content": "..." },
    { "title": "Contextual factors", "content": "How demographics like sleep/stress may be influencing the scores" },
    { "title": "What to do next", "content": "Clear, empathetic next steps including when/how to seek professional evaluation" }
  ]
}

Return ONLY valid JSON. No markdown, no preamble.`

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 1000
      })
    })

    if (!groqResponse.ok) {
      const err = await groqResponse.text()
      throw new Error(`Groq error: ${err}`)
    }

    const groqData = await groqResponse.json()
    const content = groqData.choices[0].message.content.trim()
    const analysis = JSON.parse(content)

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
