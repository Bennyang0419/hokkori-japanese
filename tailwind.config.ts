import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ほっこり warm palette
        cream:    { DEFAULT: '#FAF7F2', dark: '#1A1310' },
        milk:     { DEFAULT: '#F5EFE6', dark: '#221C15' },
        biscuit:  { DEFAULT: '#EDE0CC', dark: '#3A2E22' },
        latte:    { DEFAULT: '#D4B896', dark: '#6B5440' },
        caramel:  { DEFAULT: '#B8936A', dark: '#8B6347' },
        mocha:    { DEFAULT: '#8B6347', dark: '#C4A882' },
        espresso: { DEFAULT: '#5C3D2E', dark: '#E8D5C0' },
        blush:    { DEFAULT: '#F7E8E0', dark: '#2A1A12' },
        peach:    { DEFAULT: '#EDCBB8', dark: '#5C3020' },
        accent:   {
          DEFAULT: '#C4785A',
          light:   '#E8A882',
          dark:    '#D4906E',
        },
        sage:     { DEFAULT: '#E8EDE4', dark: '#1E2820' },
      },
      fontFamily: {
        sans:  ['var(--font-zen)', 'Hiragino Sans', 'Yu Gothic', 'sans-serif'],
        serif: ['var(--font-noto-serif)', 'Hiragino Mincho Pro', 'serif'],
        mono:  ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        warm:    '0 2px 12px rgba(91,61,46,0.08)',
        'warm-md': '0 4px 20px rgba(91,61,46,0.12)',
        'warm-lg': '0 8px 32px rgba(91,61,46,0.16)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease both',
        'fade-in':    'fadeIn 0.3s ease both',
        'slide-in':   'slideIn 0.3s ease both',
        'bounce-soft': 'bounceSoft 0.6s ease both',
        'flip':       'flip 0.5s ease both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        flip: {
          '0%':   { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
