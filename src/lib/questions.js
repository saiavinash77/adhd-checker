export const ASRS_QUESTIONS = [
  // Part A — Primary screening (Q1–6)
  {
    id: 1,
    part: 'A',
    text: 'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
    category: 'inattention'
  },
  {
    id: 2,
    part: 'A',
    text: 'How often do you have difficulty getting things in order when you have to do a task that requires organisation?',
    category: 'inattention'
  },
  {
    id: 3,
    part: 'A',
    text: 'How often do you have problems remembering appointments or obligations?',
    category: 'inattention'
  },
  {
    id: 4,
    part: 'A',
    text: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
    category: 'inattention'
  },
  {
    id: 5,
    part: 'A',
    text: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
    category: 'hyperactivity'
  },
  {
    id: 6,
    part: 'A',
    text: 'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
    category: 'hyperactivity'
  },
  // Part B — Extended assessment (Q7–18)
  {
    id: 7,
    part: 'B',
    text: 'How often do you make careless mistakes when you have to work on a boring or difficult project?',
    category: 'inattention'
  },
  {
    id: 8,
    part: 'B',
    text: 'How often do you have difficulty keeping your attention when you are doing boring or repetitive work?',
    category: 'inattention'
  },
  {
    id: 9,
    part: 'B',
    text: 'How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?',
    category: 'inattention'
  },
  {
    id: 10,
    part: 'B',
    text: 'How often do you misplace or have difficulty finding things at home or at work?',
    category: 'inattention'
  },
  {
    id: 11,
    part: 'B',
    text: 'How often are you distracted by activity or noise around you?',
    category: 'inattention'
  },
  {
    id: 12,
    part: 'B',
    text: 'How often do you leave your seat in meetings or other situations in which you are expected to remain seated?',
    category: 'hyperactivity'
  },
  {
    id: 13,
    part: 'B',
    text: 'How often do you feel restless or fidgety?',
    category: 'hyperactivity'
  },
  {
    id: 14,
    part: 'B',
    text: 'How often do you have difficulty unwinding and relaxing when you have time to yourself?',
    category: 'hyperactivity'
  },
  {
    id: 15,
    part: 'B',
    text: 'How often do you find yourself talking too much when you are in social situations?',
    category: 'hyperactivity'
  },
  {
    id: 16,
    part: 'B',
    text: 'When you\'re in a conversation, how often do you find yourself finishing the sentences of the people you are talking to?',
    category: 'impulsivity'
  },
  {
    id: 17,
    part: 'B',
    text: 'How often do you have difficulty waiting your turn in situations when turn taking is required?',
    category: 'impulsivity'
  },
  {
    id: 18,
    part: 'B',
    text: 'How often do you interrupt others when they are busy?',
    category: 'impulsivity'
  }
]

export const ANSWER_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Very often' }
]

export const DEMOGRAPHICS_QUESTIONS = [
  { id: 'age_group', label: 'Age group', options: ['Under 18', '18–25', '26–35', '36–45', '46–55', '55+'] },
  { id: 'gender', label: 'Gender', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
  { id: 'sleep_quality', label: 'How has your sleep been lately?', options: ['Good (7+ hrs)', 'Average (5–6 hrs)', 'Poor (under 5 hrs)'] },
  { id: 'stress_level', label: 'Current stress level', options: ['Low', 'Moderate', 'High', 'Very high'] },
  { id: 'caffeine', label: 'Daily caffeine intake', options: ['None', '1–2 cups', '3–4 cups', '5+ cups'] }
]
