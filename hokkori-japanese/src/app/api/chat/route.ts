import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { TUTOR_SYSTEM_PROMPT } from '@/lib/ai'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages, sessionId } = await req.json()

  // Save user message
  if (sessionId) {
    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.role === 'user') {
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        role: 'user',
        content: lastMsg.content,
      })
    }
  }

  // Stream from Claude
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: TUTOR_SYSTEM_PROMPT,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })

  // Collect full response to save
  let fullText = ''

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text
          fullText += text
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()

      // Save assistant reply
      if (sessionId && fullText) {
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          user_id: user.id,
          role: 'assistant',
          content: fullText,
        })
        await supabase.from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sessionId)
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
