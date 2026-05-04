import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { JLPTLevel } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LEVEL_GUIDE: Record<JLPTLevel, string> = {
  N5: '極簡單日語，只用平假名和最基礎漢字，句子極短，2-3人對話共6-8句',
  N4: '基礎日語，適度使用漢字，句子較短，2人對話共8-10句',
  N3: '中級日語，自然對話節奏，包含一般慣用表達，2-3人對話共10-12句',
  N2: '中高級日語，自然流暢，包含敬語和慣用語，2人對話共12-14句',
  N1: '高級日語，近母語者速度，複雜句型和慣用表達，2-3人對話共14-16句',
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { level, topic } = await req.json() as { level: JLPTLevel; topic: string }

  const prompt = `請為 JLPT ${level} 學習者生成一個「${topic}」主題的日文聽力練習腳本。

難度要求：${LEVEL_GUIDE[level]}

請嚴格按照以下 JSON 格式輸出（只輸出 JSON，不要其他文字或 markdown）：
{
  "title": "腳本標題（日文）",
  "dialogue": [
    {
      "speaker": "說話者名字（A/B 或日文名）",
      "line": "日文台詞",
      "translation": "繁體中文翻譯"
    }
  ],
  "questions": [
    {
      "q": "理解測驗題目（繁中）",
      "options": ["選項A","選項B","選項C","選項D"],
      "answer": "正確選項文字",
      "explanation": "解析（繁中）"
    }
  ],
  "vocab": [
    {
      "word": "重要單字",
      "reading": "假名",
      "meaning": "繁中意思"
    }
  ]
}

要求：
- dialogue 中的台詞要符合 ${level} 難度
- 生成 3 道理解測驗題
- 提取 5-8 個重要單字
- 對話要自然，符合「${topic}」情境`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json\n?|```\n?/g, '').trim()
    const script = JSON.parse(clean)

    return NextResponse.json({ script })
  } catch (err) {
    console.error('Listening generation error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
