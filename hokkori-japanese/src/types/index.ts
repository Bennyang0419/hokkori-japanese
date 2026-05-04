// ====================================================
// ほっこり日語 — Shared TypeScript Types
// ====================================================

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
export type ContentType = 'grammar' | 'vocabulary' | 'kanji' | 'reading' | 'listening'
export type QuizType = 'multiple_choice' | 'fill_blank' | 'sort' | 'reading_comp' | 'listening'
export type MasteryLevel = 'new' | 'learning' | 'review' | 'mastered'
export type PlanType = 'free' | 'pro'
export type MessageRole = 'user' | 'assistant'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// User / Profile
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  current_level: JLPTLevel
  target_level: JLPTLevel
  target_date: string | null
  plan: PlanType
  daily_goal_words: number
  daily_goal_quizzes: number
  timezone: string
  ui_language: string
  created_at: string
  updated_at: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Content
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface Example {
  jp: string
  zh: string
}

export interface GrammarPoint {
  id: string
  level: JLPTLevel
  pattern: string
  meaning_zh: string
  meaning_ja: string | null
  structure: string | null
  examples: Example[]
  common_errors: string | null
  similar_to: string[]
  tags: string[]
  sort_order: number
  created_at: string
}

export interface Vocabulary {
  id: string
  level: JLPTLevel
  word: string
  reading: string
  meaning_zh: string
  meaning_ja: string | null
  part_of_speech: string | null
  examples: Example[]
  memory_tip: string | null
  tags: string[]
  frequency: number
  created_at: string
}

export interface Kanji {
  id: string
  level: JLPTLevel
  character: string
  on_readings: string[]
  kun_readings: string[]
  meaning_zh: string
  stroke_count: number | null
  examples: { word: string; reading: string; zh: string }[]
  created_at: string
}

export interface QuizQuestion {
  id: string
  question: string
  options?: string[]
  correct_answer: string
  explanation: string
  grammar_note?: string
  vocab_note?: string
  level: JLPTLevel
  type: QuizType
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Flashcards
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface UserFlashcard {
  id: string
  user_id: string
  vocab_id: string | null
  word: string | null
  reading: string | null
  meaning_zh: string | null
  level: JLPTLevel | null
  mastery: MasteryLevel
  ease_factor: number
  interval_days: number
  due_date: string
  review_count: number
  correct_count: number
  last_reviewed: string | null
  is_starred: boolean
  created_at: string
  // joined
  vocabulary?: Vocabulary
}

export type SRSQuality = 0 | 1 | 2 | 3 | 4 | 5

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Quiz
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface QuizSession {
  id: string
  user_id: string
  level: JLPTLevel | null
  quiz_type: QuizType | null
  total_questions: number
  correct_count: number
  score: number | null
  time_spent_sec: number | null
  completed_at: string | null
  created_at: string
}

export interface QuizAnswer {
  id: string
  session_id: string
  user_id: string
  level: JLPTLevel | null
  quiz_type: QuizType | null
  question: string
  correct_answer: string
  user_answer: string | null
  is_correct: boolean
  time_spent_sec: number | null
  question_data: QuizQuestion | null
  created_at: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Mistake Book
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface MistakeEntry {
  id: string
  user_id: string
  level: JLPTLevel | null
  quiz_type: QuizType | null
  question: string
  correct_answer: string
  user_answer: string | null
  question_data: QuizQuestion | null
  wrong_count: number
  last_wrong_at: string
  is_resolved: boolean
  ai_analysis: string | null
  review_due: string
  created_at: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Progress
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface DailyProgress {
  id: string
  user_id: string
  date: string
  words_studied: number
  quizzes_done: number
  correct_rate: number | null
  study_minutes: number
  streak_day: number
  created_at: string
}

export interface WeeklyStats {
  totalWords: number
  totalQuizzes: number
  avgCorrectRate: number
  studyDays: number
  currentStreak: number
  bestStreak: number
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Chat
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface ChatSession {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  user_id: string
  role: MessageRole
  content: string
  created_at: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API Request / Response
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface GenerateQuizRequest {
  level: JLPTLevel
  type: QuizType
  count: number
  focus?: ContentType
  fromMistakes?: boolean
}

export interface GenerateQuizResponse {
  questions: QuizQuestion[]
  sessionId: string
}

export interface ChatRequest {
  sessionId?: string
  message: string
  userLevel?: JLPTLevel
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
