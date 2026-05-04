import Anthropic from '@anthropic-ai/sdk'
import type { JLPTLevel, QuizType, QuizQuestion } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// System prompt for the AI Japanese tutor
export const TUTOR_SYSTEM_PROMPT = `你是「ほっこり」，一位溫柔、耐心的 AI 日文老師。

你的個性：
- 溫柔有陪伴感，像咖啡廳裡的家教老師
- 用繁體中文回答，除非使用者用日文問
- 初學者也看得懂的解說方式
- 答錯或不懂時，鼓勵而非批評（例：「這題快學會了 ☕」）
- 回答簡潔但完整，善用例句

你能做的事：
- 解說日文文法、單字、漢字
- 翻譯（中↔日）
- 批改作文，給具體建議
- 生成 JLPT 練習題（N5–N1）
- 分析使用者程度，調整回答難度
- 敬語／口語／書面語轉換

格式提示：
- 文法說明請用「接續方式」「例句」「常見錯誤」的結構
- 生成題目時，用清楚的格式標出答案和解析`

/** Stream chat response */
export async function streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  onChunk: (text: string) => void,
  onDone: () => void
) {
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: TUTOR_SYSTEM_PROMPT,
    messages,
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      onChunk(chunk.delta.text)
    }
  }
  onDone()
}

/** Generate quiz questions via AI */
export async function generateQuizQuestions(
  level: JLPTLevel,
  type: QuizType,
  count: number,
  focus?: string
): Promise<QuizQuestion[]> {
  const typeLabel: Record<QuizType, string> = {
    multiple_choice: '四選一選擇題',
    fill_blank:      '填空題',
    sort:            '排序題',
    reading_comp:    '閱讀理解題',
    listening:       '聽解腳本題',
  }

  const prompt = `請生成 ${count} 道 JLPT ${level} ${typeLabel[type]}${focus ? `，重點放在「${focus}」` : ''}。

每道題必須嚴格按照以下 JSON 格式（只輸出 JSON array，不要其他文字）：
[
  {
    "id": "q1",
    "question": "題目文字（含選項括號如有）",
    "options": ["A. 選項1","B. 選項2","C. 選項3","D. 選項4"],
    "correct_answer": "A. 選項1",
    "explanation": "詳細解析，說明為什麼正確，其他選項為何錯",
    "grammar_note": "相關文法補充（可空）",
    "vocab_note": "相關單字補充（可空）",
    "level": "${level}",
    "type": "${type}"
  }
]`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  // Strip markdown code fences if present
  const clean = text.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(clean) as QuizQuestion[]
}

/** Analyze mistake patterns */
export async function analyzeMistakes(
  mistakes: { question: string; correct: string; userAnswer: string }[]
): Promise<string> {
  const prompt = `以下是學習者的錯題紀錄，請分析常見錯誤原因並給予溫和的學習建議（繁中，200字以內）：

${mistakes.map((m, i) => `${i + 1}. 題目：${m.question}\n   正確：${m.correct}\n   作答：${m.userAnswer}`).join('\n\n')}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    system: TUTOR_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export { anthropic }
