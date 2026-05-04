'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Play, Pause, Mic, MicOff, RotateCcw, ChevronDown, ChevronUp, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JLPTLevel } from '@/types'

const LEVELS: JLPTLevel[] = ['N5','N4','N3','N2','N1']
const SPEEDS = [
  { label: '0.6x', rate: 0.6 },
  { label: '0.8x', rate: 0.8 },
  { label: '1.0x', rate: 1.0 },
  { label: '1.2x', rate: 1.2 },
]

const SAMPLE_SCRIPTS: Record<JLPTLevel, { title: string; lines: { jp: string; zh: string }[] }> = {
  N5: {
    title: '自己紹介',
    lines: [
      { jp: 'はじめまして。', zh: '初次見面。' },
      { jp: 'わたしは田中たなかです。', zh: '我是田中。' },
      { jp: 'にほんごをべんきょうしています。', zh: '我正在學習日文。' },
      { jp: 'どうぞよろしくおねがいします。', zh: '請多多指教。' },
    ],
  },
  N4: {
    title: '電話をかける',
    lines: [
      { jp: 'もしもし、田中たなかですが。', zh: '喂，我是田中。' },
      { jp: '山田やまださんはいらっしゃいますか。', zh: '山田先生在嗎？' },
      { jp: '少々しょうしょうお待まちください。', zh: '請稍候。' },
      { jp: 'お電話でんわありがとうございます。', zh: '感謝您的來電。' },
    ],
  },
  N3: {
    title: '友達との会話',
    lines: [
      { jp: '最近さいきん忙いそがしくて、全然ぜんぜん会あえなかったね。', zh: '最近太忙了，完全沒見到面。' },
      { jp: 'そうだね。仕事しごとがなかなか終おわらなくてさ。', zh: '是啊，工作老是結束不了。' },
      { jp: '今度こんど時間じかんがあったら、一緒いっしょに食たべに行いかない？', zh: '下次有時間的話，要不要一起去吃飯？' },
      { jp: 'ぜひ！楽たのしみにしてるよ。', zh: '一定！我很期待喔。' },
    ],
  },
  N2: {
    title: 'ビジネスシーン',
    lines: [
      { jp: 'お世話せわになっております。企画きかく部ぶの佐藤さとうと申もうします。', zh: '承蒙您的關照。我是企劃部的佐藤。' },
      { jp: 'ご提案ていあんいただいた件けんについて、検討けんとうさせていただきました。', zh: '關於您提出的提案，我們已進行了研討。' },
      { jp: '来週らいしゅう改あらためてご連絡れんらくいたします。', zh: '下週再另行聯絡您。' },
      { jp: 'どうぞよろしくお願ねがいいたします。', zh: '請多多指教。' },
    ],
  },
  N1: {
    title: 'ディスカッション',
    lines: [
      { jp: '少子化しょうしかが進すすむ中なか、社会保障せいほしょう制度せいどの持続可能性じぞくかのうせいが問われています。', zh: '在少子化持續進展中，社會保障制度的持續可能性受到質疑。' },
      { jp: '財政難ざいせいなんを乗のり越こえるためには、官民かんみん連携れんけいが不可欠ふかけつだと考かんがえます。', zh: '為了克服財政困難，我認為公私合作是不可或缺的。' },
      { jp: 'ただし、その実施じっしにあたっては透明性とうめいせいの確保かくほが前提ぜんていとなります。', zh: '然而，在其實施之際，確保透明性是前提。' },
    ],
  },
}

type LineState = 'idle' | 'playing' | 'recording' | 'done'

export default function ShadowingPage() {
  const [level,      setLevel]      = useState<JLPTLevel>('N3')
  const [speed,      setSpeed]      = useState(1.0)
  const [lineIdx,    setLineIdx]    = useState(0)
  const [lineStates, setLineStates] = useState<Record<number, LineState>>({})
  const [isRecording,setIsRecording]= useState(false)
  const [showAll,    setShowAll]    = useState(false)
  const [mediaRec,   setMediaRec]   = useState<MediaRecorder | null>(null)
  const [audioURLs,  setAudioURLs]  = useState<Record<number, string>>({})
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const script = SAMPLE_SCRIPTS[level]

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    setLineIdx(0)
    setLineStates({})
    setAudioURLs({})
  }, [level])

  const playLine = (idx: number) => {
    if (!synthRef.current) return
    synthRef.current.cancel()
    setLineStates(s => ({ ...s, [idx]: 'playing' }))

    const utt = new SpeechSynthesisUtterance(script.lines[idx].jp)
    utt.lang = 'ja-JP'
    utt.rate = speed
    const voices = synthRef.current.getVoices()
    const ja = voices.find(v => v.lang.startsWith('ja'))
    if (ja) utt.voice = ja

    utt.onend = () => {
      setLineStates(s => ({ ...s, [idx]: 'idle' }))
      setLineIdx(idx)
    }
    synthRef.current.speak(utt)
  }

  const startRecording = async (idx: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const rec = new MediaRecorder(stream)
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url  = URL.createObjectURL(blob)
        setAudioURLs(a => ({ ...a, [idx]: url }))
        setLineStates(s => ({ ...s, [idx]: 'done' }))
        stream.getTracks().forEach(t => t.stop())
      }
      rec.start()
      setMediaRec(rec)
      setIsRecording(true)
      setLineStates(s => ({ ...s, [idx]: 'recording' }))
    } catch {
      alert('無法存取麥克風，請確認瀏覽器權限。')
    }
  }

  const stopRecording = () => {
    mediaRec?.stop()
    setIsRecording(false)
    setMediaRec(null)
  }

  const playAll = () => {
    if (!synthRef.current) return
    synthRef.current.cancel()
    let delay = 0
    script.lines.forEach((line, i) => {
      setTimeout(() => {
        setLineIdx(i)
        setLineStates(s => ({ ...s, [i]: 'playing' }))
        const utt = new SpeechSynthesisUtterance(line.jp)
        utt.lang = 'ja-JP'; utt.rate = speed
        const voices = synthRef.current!.getVoices()
        const ja = voices.find(v => v.lang.startsWith('ja'))
        if (ja) utt.voice = ja
        utt.onend = () => setLineStates(s => ({ ...s, [i]: 'idle' }))
        synthRef.current!.speak(utt)
      }, delay)
      delay += Math.max(1500, (line.jp.length / speed) * 300)
    })
  }

  const allDone = script.lines.every((_, i) => lineStates[i] === 'done' || audioURLs[i])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h1 className="font-serif text-2xl font-medium mb-1" style={{ color:'var(--espresso)' }}>
          Shadowing 跟讀練習
        </h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>
          聽 AI 朗讀 → 自己跟讀錄音 → 對比練習，提升口語和語感 🎙️
        </p>
      </motion.div>

      {/* Controls */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Level */}
          <div>
            <div className="text-xs font-semibold mb-1.5" style={{ color:'var(--text-muted)' }}>等級</div>
            <div className="flex gap-1.5">
              {LEVELS.map(lv => (
                <button key={lv} onClick={() => setLevel(lv)}
                  className="px-3 py-1 rounded-full text-xs font-bold border-1.5 transition-all"
                  style={{ border:`1.5px solid ${level===lv?'var(--accent)':'var(--biscuit)'}`,
                           background:level===lv?'var(--accent)':'var(--warm)',
                           color:level===lv?'#fff':'var(--text-muted)' }}>
                  {lv}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div>
            <div className="text-xs font-semibold mb-1.5" style={{ color:'var(--text-muted)' }}>速度</div>
            <div className="flex gap-1.5">
              {SPEEDS.map(s => (
                <button key={s.rate} onClick={() => setSpeed(s.rate)}
                  className="px-3 py-1 rounded-full text-xs font-medium border-1.5 transition-all"
                  style={{ border:`1.5px solid ${speed===s.rate?'var(--accent)':'var(--biscuit)'}`,
                           background:speed===s.rate?'var(--blush)':'var(--warm)',
                           color:speed===s.rate?'var(--accent)':'var(--text-muted)' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Play all */}
          <button onClick={playAll}
            className="btn-primary px-4 py-2 text-sm gap-2 ml-auto">
            <Play size={14}/> 全部朗讀
          </button>
        </div>
      </div>

      {/* Script title */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="section-label">練習腳本</div>
          <h2 className="font-serif text-lg" style={{ color:'var(--espresso)' }}>{script.title}</h2>
        </div>
        <button onClick={() => setShowAll(v => !v)}
          className="btn-ghost text-xs gap-1">
          {showAll ? <><ChevronUp size={13}/>隱藏翻譯</> : <><ChevronDown size={13}/>顯示翻譯</>}
        </button>
      </div>

      {/* Lines */}
      <div className="space-y-4">
        {script.lines.map((line, i) => {
          const state  = lineStates[i] ?? 'idle'
          const isActive = lineIdx === i
          const hasAudio = !!audioURLs[i]

          return (
            <motion.div key={`${level}-${i}`}
              initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: i * 0.06 }}
              className="card p-4 transition-all"
              style={{ borderColor: isActive ? 'var(--accent)' : 'var(--biscuit)',
                       boxShadow: isActive ? '0 0 0 2px rgba(196,120,90,.15)' : undefined }}>

              {/* Line header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: hasAudio ? 'var(--accent)' : 'var(--biscuit)',
                             color: hasAudio ? '#fff' : 'var(--text-muted)' }}>
                    {hasAudio ? '✓' : i+1}
                  </span>
                  <div>
                    <div className="font-serif text-base leading-relaxed" style={{ color:'var(--espresso)' }}>
                      {line.jp}
                    </div>
                    <AnimatePresence>
                      {showAll && (
                        <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                          exit={{ opacity:0, height:0 }}
                          className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
                          {line.zh}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Play */}
                <button onClick={() => playLine(i)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: state==='playing' ? 'var(--blush)' : 'var(--milk)',
                           color: state==='playing' ? 'var(--accent)' : 'var(--text-muted)',
                           border:`1px solid ${state==='playing'?'var(--peach)':'var(--biscuit)'}` }}>
                  {state==='playing' ? <><Pause size={12}/>播放中</> : <><Volume2 size={12}/>聆聽</>}
                </button>

                {/* Record */}
                {state !== 'recording' ? (
                  <button onClick={() => startRecording(i)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: hasAudio ? '#EAF7EA' : 'var(--milk)',
                             color: hasAudio ? '#2D6E2D' : 'var(--text-muted)',
                             border:`1px solid ${hasAudio?'#A5D6A7':'var(--biscuit)'}` }}>
                    <Mic size={12}/>{hasAudio ? '重新錄音' : '跟讀錄音'}
                  </button>
                ) : (
                  <button onClick={stopRecording}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium animate-pulse"
                    style={{ background:'var(--blush)', color:'var(--accent)',
                             border:'1px solid var(--peach)' }}>
                    <MicOff size={12}/>停止錄音
                  </button>
                )}

                {/* Playback recorded audio */}
                {hasAudio && (
                  <audio src={audioURLs[i]} controls
                    className="h-7 flex-1 min-w-0"
                    style={{ filter:'sepia(0.3) hue-rotate(-20deg)' }}/>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Completion */}
      <AnimatePresence>
        {allDone && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            className="mt-5 p-5 rounded-2xl text-center"
            style={{ background:'var(--blush)', border:'1px solid var(--peach)' }}>
            <div className="text-3xl mb-2">🎉</div>
            <div className="font-serif text-lg font-medium mb-1" style={{ color:'var(--espresso)' }}>
              全部完成！
            </div>
            <p className="text-sm mb-4" style={{ color:'var(--text-muted)' }}>
              跟讀練習很有效果，每天練習 10 分鐘口語會大幅進步 ☕
            </p>
            <button onClick={() => { setLineStates({}); setAudioURLs({}) }}
              className="btn-secondary gap-2">
              <RotateCcw size={14}/> 重新練習
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
