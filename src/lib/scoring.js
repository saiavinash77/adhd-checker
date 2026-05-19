// Local ASRS v1.1 scoring — runs entirely on-device, no API needed
export function calculateASRSScore(answers) {
  // Part A: Questions 1-6 (higher sensitivity for screening)
  // Part B: Questions 7-18 (additional symptom detail)
  const partA = answers.slice(0, 6)
  const partB = answers.slice(6, 18)

  // ASRS v1.1 Part A threshold scoring
  // Q1,Q2,Q3: threshold is "Sometimes" (2) or higher
  // Q4,Q5,Q6: threshold is "Often" (3) or higher
  const partAThresholds = [2, 2, 2, 3, 3, 3]
  const partAPositive = partA.filter((ans, i) => ans >= partAThresholds[i]).length

  const partAScore = partA.reduce((sum, v) => sum + v, 0)
  const partBScore = partB.reduce((sum, v) => sum + v, 0)
  const totalScore = partAScore + partBScore

  // Part A: 4+ positive = highly consistent with ADHD
  const screenPositive = partAPositive >= 4

  let riskLevel = 'low'
  if (screenPositive && totalScore >= 24) riskLevel = 'high'
  else if (screenPositive || totalScore >= 17) riskLevel = 'moderate'

  return {
    partAScore,
    partBScore,
    totalScore,
    partAPositive,
    screenPositive,
    riskLevel,
    maxScore: 72
  }
}

export const RISK_LABELS = {
  low: { label: 'Low indicators', color: '#22c55e', bg: '#f0fdf4', desc: 'Your responses show few indicators associated with ADHD.' },
  moderate: { label: 'Moderate indicators', color: '#f59e0b', bg: '#fffbeb', desc: 'Some indicators are present. A professional evaluation may provide clarity.' },
  high: { label: 'Significant indicators', color: '#ef4444', bg: '#fef2f2', desc: 'Your responses show significant indicators. We strongly recommend speaking with a healthcare professional.' }
}
