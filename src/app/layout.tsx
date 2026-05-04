import type { Metadata, Viewport } from 'next'
import { Noto_Serif_JP, Zen_Maru_Gothic } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

const zenMaru = Zen_Maru_Gothic({ subsets:['latin'], weight:['300','400','500','700'], variable:'--font-zen', display:'swap' })
const notoSerifJP = Noto_Serif_JP({ subsets:['latin'], weight:['300','400','500'], variable:'--font-noto-serif', display:'swap' })

export const viewport: Viewport = { themeColor:'#C4785A', width:'device-width', initialScale:1, maximumScale:1 }

export const metadata: Metadata = {
  title: { default:'ほっこり日語', template:'%s | ほっこり日語' },
  description: '用溫暖的方式學日文。AI 陪你備考 JLPT N5～N1。',
  manifest: '/manifest.json',
  appleWebApp: { capable:true, statusBarStyle:'default', title:'ほっこり日語' },
  icons: { icon:[{ url:'/icons/icon-192.png', sizes:'192x192' }], apple:[{ url:'/icons/icon-192.png' }] },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <script dangerouslySetInnerHTML={{ __html:`if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(console.error)})}` }}/>
      </head>
      <body className={`${zenMaru.variable} ${notoSerifJP.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster position="top-center" toastOptions={{ style:{ background:'var(--warm)', color:'var(--text-main)', border:'1px solid var(--biscuit)', borderRadius:'12px', fontSize:'14px', fontFamily:'var(--font-zen)' }, success:{ iconTheme:{ primary:'#C4785A', secondary:'#fff' } } }}/>
        </ThemeProvider>
      </body>
    </html>
  )
}
