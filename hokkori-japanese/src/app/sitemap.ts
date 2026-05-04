import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hokkori-japanese.vercel.app'

const STATIC = [
  { url:'/',              priority:1.0,  changeFrequency:'weekly' },
  { url:'/login',         priority:0.5,  changeFrequency:'monthly' },
  { url:'/register',      priority:0.7,  changeFrequency:'monthly' },
  { url:'/dashboard',     priority:0.9,  changeFrequency:'daily' },
  { url:'/quiz',          priority:0.9,  changeFrequency:'daily' },
  { url:'/flashcards',    priority:0.9,  changeFrequency:'daily' },
  { url:'/chat',          priority:0.8,  changeFrequency:'daily' },
  { url:'/mistakes',      priority:0.8,  changeFrequency:'daily' },
  { url:'/progress',      priority:0.7,  changeFrequency:'daily' },
  { url:'/writing',       priority:0.7,  changeFrequency:'weekly' },
  { url:'/upload',        priority:0.7,  changeFrequency:'weekly' },
  { url:'/study-plan',    priority:0.7,  changeFrequency:'weekly' },
  { url:'/listening',     priority:0.8,  changeFrequency:'daily' },
  { url:'/shadowing',     priority:0.8,  changeFrequency:'daily' },
  { url:'/mock-exam',     priority:0.8,  changeFrequency:'weekly' },
  { url:'/settings',      priority:0.4,  changeFrequency:'monthly' },
] as const

const LEVELS = ['N5','N4','N3','N2','N1']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages = STATIC.map(({ url, priority, changeFrequency }) => ({
    url:             `${BASE}${url}`,
    lastModified:    now,
    changeFrequency: changeFrequency as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority,
  }))

  const levelPages = LEVELS.map(lv => ({
    url:             `${BASE}/learn/${lv}`,
    lastModified:    now,
    changeFrequency: 'weekly' as const,
    priority:        0.85,
  }))

  return [...staticPages, ...levelPages]
}
