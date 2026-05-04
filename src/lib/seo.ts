import type { Metadata } from 'next'

const BASE   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hokkori-japanese.vercel.app'
const BRAND  = 'ほっこり日語'
const TAGLINE = 'AI 日文學習平台'

export function buildMeta(opts: {
  title: string
  description: string
  path?: string
  image?: string
  noIndex?: boolean
}): Metadata {
  const { title, description, path = '', image, noIndex } = opts
  const url = `${BASE}${path}`

  return {
    title:       `${title} | ${BRAND}`,
    description,
    metadataBase: new URL(BASE),
    alternates:  { canonical: url },
    robots:      noIndex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      title:       `${title} | ${BRAND} — ${TAGLINE}`,
      description,
      url,
      siteName:    BRAND,
      type:        'website',
      locale:      'zh_TW',
      images: image ? [{ url: image, width:1200, height:630, alt:title }] : [],
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${title} | ${BRAND}`,
      description,
    },
    keywords: [
      '日文學習', 'JLPT', '日語', 'N5', 'N4', 'N3', 'N2', 'N1',
      'AI日語', '日文練習', 'JLPT備考', '日語線上學習', title,
    ],
  }
}

// Pre-built metadata for common pages
export const PAGE_META = {
  home: buildMeta({
    title: '今天也想學一下日文吧 ☕',
    description: '用溫暖的方式學日文。AI 幫你出題、分析弱點、陪你對話。N5–N1 完整備考，每天進步一點點。',
    path: '/',
  }),
  quiz: buildMeta({
    title: 'AI 智慧出題',
    description: '根據 JLPT 等級和弱點，AI 即時生成個人化練習題，每題附詳細解析。',
    path: '/quiz',
  }),
  chat: buildMeta({
    title: 'AI 日文助教',
    description: '24 小時 AI 日文老師，文法解說、翻譯、作文批改，溫柔有耐心。',
    path: '/chat',
  }),
  flashcards: buildMeta({
    title: '間隔記憶單字卡',
    description: 'SM-2 科學記憶法，JLPT N5–N1 常用單字，每天 20 個單字輕鬆記住。',
    path: '/flashcards',
  }),
  mockExam: buildMeta({
    title: 'JLPT 模擬考',
    description: '完整仿真 JLPT 考試環境，計時作答、自動評分、成績分析。',
    path: '/mock-exam',
  }),
  listening: buildMeta({
    title: 'AI 聽解練習',
    description: 'AI 生成 JLPT 日文對話腳本，TTS 朗讀練習，配合理解測驗。',
    path: '/listening',
  }),
}

/** Structured data for homepage */
export function homeStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name:    BRAND,
        url:     BASE,
        description: 'AI 驅動的日文學習平台，JLPT N5–N1 全程備考',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'TWD',
          description: '免費版可用',
        },
        inLanguage: ['zh-TW','ja'],
        audience: { '@type':'EducationalAudience', educationalRole:'student' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type':'Question', name:'ほっこり日語 是什麼？',       acceptedAnswer:{ '@type':'Answer', text:'ほっこり日語 是一個 AI 驅動的日文學習平台，提供 JLPT N5–N1 完整備考功能，包含 AI 出題、智慧單字卡、聽解練習等。' } },
          { '@type':'Question', name:'免費版有哪些功能？',           acceptedAnswer:{ '@type':'Answer', text:'免費版可使用 N5 全部學習內容、每日 10 道 AI 練習題、每日 20 張單字卡、基本 AI 助教對話。' } },
          { '@type':'Question', name:'JLPT 考試需要準備多久？',      acceptedAnswer:{ '@type':'Answer', text:'因人而異。N5 通常需要 150–200 小時，N3 約 450 小時，N1 約 900 小時。配合 AI 個人學習計畫可更有效率。' } },
        ],
      },
    ],
  }
}
