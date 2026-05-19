// Insforge AI backend integration for ADHD screening analysis
import axios from 'axios'

const API_KEY = import.meta.env.VITE_INSFORGE_API_KEY
const API_BASE_URL = import.meta.env.VITE_INSFORGE_API_BASE_URL

if (!API_KEY || !API_BASE_URL) {
  console.warn('Insforge API credentials not configured')
}

/**
 * Generate AI analysis for ADHD screening results
 * @param {Object} params - Analysis parameters
 * @param {Array} params.answers - Array of 18 answer values (0-4)
 * @param {Object} params.score - Score object from calculateASRSScore
 * @param {Object} params.demographics - User demographics (age, sleep, stress, etc.)
 * @returns {Promise<Object>} AI analysis with summary and sections
 */
export async function generateAIAnalysis({ answers, score, demographics }) {
  if (!API_KEY || !API_BASE_URL) {
    throw new Error('Insforge AI is not configured')
  }

  try {
    // Build the prompt for AI analysis
    const prompt = buildAnalysisPrompt(answers, score, demographics)

    // Call Insforge AI API
    const response = await axios.post(
      `${API_BASE_URL}/v1/chat/completions`,
      {
        model: 'gpt-4o-mini', // or whatever model Insforge supports
        messages: [
          {
            role: 'system',
            content: 'You are a clinical psychologist specializing in ADHD assessment. Provide empathetic, evidence-based analysis of screening results. Be supportive but clear about the need for professional diagnosis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const aiText = response.data.choices[0].message.content
    
    // Parse the AI response into structured format
    return parseAIResponse(aiText)
  } catch (error) {
    console.error('Insforge AI error:', error)
    
    // Return fallback analysis if API fails
    return getFallbackAnalysis(score)
  }
}

/**
 * Build the analysis prompt from screening data
 */
function buildAnalysisPrompt(answers, score, demographics) {
  const { partAScore, partBScore, totalScore, partAPositive, riskLevel } = score
  
  // Map answers to question categories
  const categories = {
    inattention: [],
    hyperactivity: [],
    impulsivity: []
  }
  
  const questionCategories = [
    'inattention', 'inattention', 'hyperactivity', 'inattention', 'inattention', 'inattention',
    'inattention', 'hyperactivity', 'inattention', 'hyperactivity', 'inattention', 'hyperactivity',
    'impulsivity', 'impulsivity', 'hyperactivity', 'impulsivity', 'impulsivity', 'hyperactivity'
  ]
  
  answers.forEach((ans, i) => {
    categories[questionCategories[i]].push(ans)
  })
  
  const avgScores = {
    inattention: (categories.inattention.reduce((a, b) => a + b, 0) / categories.inattention.length).toFixed(1),
    hyperactivity: (categories.hyperactivity.reduce((a, b) => a + b, 0) / categories.hyperactivity.length).toFixed(1),
    impulsivity: (categories.impulsivity.reduce((a, b) => a + b, 0) / categories.impulsivity.length).toFixed(1)
  }

  return `Analyze this ADHD screening (WHO ASRS v1.1):

**Scores:**
- Total: ${totalScore}/72
- Part A (core): ${partAScore}/24 (${partAPositive}/6 above threshold)
- Part B (extended): ${partBScore}/48
- Risk level: ${riskLevel}

**Category averages (0-4 scale):**
- Inattention: ${avgScores.inattention}
- Hyperactivity: ${avgScores.hyperactivity}
- Impulsivity: ${avgScores.impulsivity}

**Demographics:**
- Age: ${demographics.age || 'Not provided'}
- Sleep quality: ${demographics.sleep || 'Not provided'}
- Stress level: ${demographics.stress || 'Not provided'}
- Previous diagnosis: ${demographics.previousDiagnosis || 'Not provided'}

Provide a personalized analysis in this format:

**SUMMARY:** (2-3 sentences overview)

**KEY PATTERNS:** (What stands out in their responses)

**CONTEXTUAL FACTORS:** (How demographics might influence results)

**NEXT STEPS:** (Specific, actionable recommendations)

Keep it empathetic, clear, and emphasize this is a screening tool, not a diagnosis.`
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(text) {
  const sections = []
  
  // Extract summary (first paragraph or section)
  const summaryMatch = text.match(/\*\*SUMMARY:\*\*\s*(.+?)(?=\*\*|$)/s)
  const summary = summaryMatch ? summaryMatch[1].trim() : text.split('\n\n')[0]
  
  // Extract sections
  const sectionMatches = text.matchAll(/\*\*([A-Z\s]+):\*\*\s*(.+?)(?=\*\*[A-Z\s]+:|$)/gs)
  
  for (const match of sectionMatches) {
    const title = match[1].trim()
    const content = match[2].trim()
    
    if (title !== 'SUMMARY') {
      sections.push({
        title: title.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' '),
        content
      })
    }
  }
  
  // If no sections found, create default structure
  if (sections.length === 0) {
    const paragraphs = text.split('\n\n').filter(p => p.trim())
    if (paragraphs.length > 1) {
      sections.push({
        title: 'Analysis',
        content: paragraphs.slice(1).join('\n\n')
      })
    }
  }
  
  return { summary, sections }
}

/**
 * Fallback analysis if AI API fails
 */
function getFallbackAnalysis(score) {
  const { riskLevel, totalScore, partAPositive } = score
  
  let summary = ''
  let sections = []
  
  if (riskLevel === 'high') {
    summary = 'Your screening shows significant indicators consistent with ADHD. These results suggest that a professional evaluation would be valuable.'
    sections = [
      {
        title: 'Key Patterns',
        content: `You scored ${totalScore}/72 overall, with ${partAPositive}/6 core questions above the clinical threshold. This pattern is commonly seen in individuals with ADHD.`
      },
      {
        title: 'Next Steps',
        content: 'We recommend scheduling an appointment with a psychiatrist or clinical psychologist who specializes in ADHD. They can provide a comprehensive evaluation and discuss treatment options if appropriate.'
      }
    ]
  } else if (riskLevel === 'moderate') {
    summary = 'Your screening shows some indicators that may be consistent with ADHD. A professional evaluation could help clarify whether these symptoms warrant further attention.'
    sections = [
      {
        title: 'Key Patterns',
        content: `You scored ${totalScore}/72 overall. Some symptoms are present, but the pattern is less clear-cut than typical ADHD presentations.`
      },
      {
        title: 'Next Steps',
        content: 'Consider discussing these results with your primary care physician or a mental health professional. They can help determine if further evaluation is needed.'
      }
    ]
  } else {
    summary = 'Your screening shows relatively few indicators typically associated with ADHD. However, if you\'re experiencing difficulties in daily life, it\'s still worth discussing with a healthcare provider.'
    sections = [
      {
        title: 'Key Patterns',
        content: `You scored ${totalScore}/72 overall, which is below the typical threshold for ADHD. Your responses suggest that ADHD symptoms are not significantly impacting your daily functioning.`
      },
      {
        title: 'Next Steps',
        content: 'If you\'re still concerned about attention or focus issues, consider factors like sleep, stress, or other conditions that can mimic ADHD symptoms. A healthcare provider can help explore these possibilities.'
      }
    ]
  }
  
  return { summary, sections }
}
