import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export const viewport: Viewport = {
  themeColor: '#C4785A',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: { default: 'ほっこり日語', template: '%s | ほっこり日語' },
  description: '用溫暖的方式學日文。AI 陪你備考 JLPT N5～N1。',
  manifest: '/manifest.json',
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500&family=Zen+Maru+Gothic:wght@400;500;700&display=swap" rel="stylesheet"/>
        <link rel="manifest" href="/manifest.json"/>
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}` }}/>
      </head>
      <body style={{ fontFamily: "'Zen Maru Gothic', 'Noto Serif JP', 'Hiragino Sans', sans-serif" }}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'var(--warm)',
                color: 'var(--text-main)',
                border: '1px solid var(--biscuit)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#C4785A', secondary: '#fff' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
