import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
 
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
 
const PROMPTS: Record<string, string> = {
  summary: `請整理以下日文內容的重點。輸出格式：
## 📋 重點整理
列出最重要的 5-10 個文法或概念，每點附說明和例句。
 
## 📇 重要單字
列出出現的重要單字（假名、中文意思、詞性、JLPT等級）
 
## ⭐ 學習建議
給 2-3 個針對這份內容的學習建議`,
 
  vocab: `請從以下日文內容提取所有重要單字，以 Markdown 表格輸出：
| 單字 | 假名 | 中文意思 | 詞性 | JLPT 等級 |
|------|------|----------|------|-----------|`,
 
  grammar: `請分析以下日文內容的文法，對每個出現的重要文法句型說明意思和用法。`,
 
  quiz: `請根據以下日文內容生成 5 道 JLPT 風格練習題（四選一選擇題），每題附正確答案和解析。`,
}
 
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const pastedText = formData.get('text') as string || ''
  const outputType = (formData.get('outputType') as string) || 'summary'
 
  let content = pastedText
 
  if (file) {
    if (file.type === 'text/plain') {
      content = await file.text()
    } else if (file.type.startsWith('image/')) {
      // Handle image with Claude Vision
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'
 
      const stream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: `請先 OCR 辨識圖片中的日文文字，然後${PROMPTS[outputType]}` }
          ]
        }]
      })
      return streamResponse(stream)
    } else {
      // For PDF and other files, ask user to paste text
      content = '（請直接貼上文字內容，目前不支援 PDF 直接上傳）'
    }
  }
 
  if (!content.trim()) {
    return new Response('沒有可分析的內容', { status: 400 })
  }
 
  const prompt = `${PROMPTS[outputType]}\n\n---\n\n${content.slice(0, 6000)}`
 
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: '你是一位日文老師，請用繁體中文回答，格式清楚易讀。',
    messages: [{ role: 'user', content: prompt }]
  })
 
  return streamResponse(stream)
}
 
async function streamResponse(stream: ReturnType<Anthropic['messages']['stream']>) {
  const readable = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`))
        }
      }
      controller.enqueue(enc.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })
  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }
  })
}
