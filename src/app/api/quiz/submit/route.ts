import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { QuizQuestion } from '@/types'

interface SubmitBody {
  sessionId: string
  answers: { question: QuizQuestion; userAnswer: string; isCorrect: boolean; timeSec: number }[]
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId, answers }: SubmitBody = await req.json()
  const correctCount = answers.filter(a => a.isCorrect).length
  const totalTime = answers.reduce((s, a) => s + (a.timeSec ?? 0), 0)

  // Update session
  await supabase.from('quiz_sessions').update({
    correct_count: correctCount,
    score: Math.round((correctCount / answers.length) * 100),
    time_spent_sec: totalTime,
    completed_at: new Date().toISOString(),
  }).eq('id', sessionId)

  // Bulk insert answers
  await supabase.from('quiz_answers').insert(
    answers.map(a => ({
      session_id:     sessionId,
      user_id:        user.id,
      level:          a.question.level,
      quiz_type:      a.question.type,
      question:       a.question.question,
      correct_answer: a.question.correct_answer,
      user_answer:    a.userAnswer,
      is_correct:     a.isCorrect,
      time_spent_sec: a.timeSec,
      question_data:  a.question,
    }))
  )

  // Upsert wrong answers into mistake_book
  const wrong = answers.filter(a => !a.isCorrect)
  for (const a of wrong) {
    await supabase.from('mistake_book')
      .upsert({
        user_id:        user.id,
        level:          a.question.level,
        quiz_type:      a.question.type,
        question:       a.question.question,
        correct_answer: a.question.correct_answer,
        user_answer:    a.userAnswer,
        question_data:  a.question,
        last_wrong_at:  new Date().toISOString(),
        review_due:     new Date().toISOString().split('T')[0],
      }, {
        onConflict: 'user_id,question',
        ignoreDuplicates: false,
      })
    // Increment wrong_count separately
    await supabase.rpc('increment_mistake_count', {
      p_user_id: user.id,
      p_question: a.question.question,
    })
  }

  // Update daily progress
  await supabase.rpc('upsert_daily_progress', {
    p_user_id:  user.id,
    p_words:    0,
    p_quizzes:  answers.length,
    p_minutes:  Math.ceil(totalTime / 60),
  })

  return NextResponse.json({
    score: Math.round((correctCount / answers.length) * 100),
    correctCount,
    total: answers.length,
  })
}
