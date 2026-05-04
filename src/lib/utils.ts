import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { JLPTLevel, MasteryLevel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Map JLPT level to badge class */
export function levelBadgeClass(level: JLPTLevel) {
  return {
    N5: 'badge-n5', N4: 'badge-n4', N3: 'badge-n3',
    N2: 'badge-n2', N1: 'badge-n1',
  }[level]
}

/** Map JLPT level to accent color hex */
export function levelColor(level: JLPTLevel) {
  return {
    N5: '#B8610A', N4: '#2E7D32', N3: '#1565C0',
    N2: '#6A1B9A', N1: '#880E4F',
  }[level]
}

/** Mastery level label in Chinese */
export function masteryLabel(m: MasteryLevel) {
  return { new: '新單字', learning: '學習中', review: '複習中', mastered: '已掌握' }[m]
}

/** Format date as "4月30日" */
export function formatJpDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/** Calculate correct rate percentage string */
export function formatRate(correct: number, total: number) {
  if (total === 0) return '0%'
  return `${Math.round((correct / total) * 100)}%`
}

/** Truncate string */
export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '…' : str
}

/** SM-2: quality 0-5 description */
export const SRS_LABELS = ['完全不記得', '很不熟', '有點印象', '想起來了', '記得', '完全掌握']
export const SRS_COLORS = ['#E53935','#FB8C00','#FDD835','#7CB342','#43A047','#2E7D32']
