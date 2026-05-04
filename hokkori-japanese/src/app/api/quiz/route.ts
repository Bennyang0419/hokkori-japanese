import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQuizQuestions } from '@/lib/ai'
import type { JLPTLevel, QuizType } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { level, type, count = 5, focus } = await req.json()

  try {
    const questions = await generateQuizQuestions(
      level as JLPTLevel,
      type as QuizType,
      Math.min(count, 10), // cap at 10
      focus
    )

    // Create quiz session
    const { data: session } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: user.id,
        level,
        quiz_type: type,
        total_questions: questions.length,
      })
      .select()
      .single()

    return NextResponse.json({ questions, sessionId: session?.id })
  } catch (err) {
    console.error('Quiz generation error:', err)
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 })
  }
}
