# ほっこり日語 🍵
> 用溫暖的方式學日文 — AI 日文學習平台

## 功能總覽

### Phase 1 — MVP 核心
| 頁面 | 路徑 | 說明 |
|------|------|------|
| 首頁 Dashboard | `/dashboard` | 今日進度、快速入口 |
| 學習區 | `/learn/[level]` | N5–N1 文法・單字・漢字・閱讀 |
| 單字卡 | `/flashcards` | SM-2 間隔記憶，翻卡動畫 |
| 進度追蹤 | `/progress` | 打卡月曆、週統計、成就徽章 |
| 錯題本 | `/mistakes` | 自動收藏、AI 解析 |
| 登入 | `/login` | Email + Google OAuth |
| 註冊 | `/register` | 兩步驟引導，選目標等級 |

### Phase 2 — AI 核心功能
| 頁面 | 路徑 | 說明 |
|------|------|------|
| AI 出題 | `/quiz` | 選等級/題型，即時生成+解析 |
| 模擬考 | `/mock-exam` | 完整 JLPT 仿真考試，計時作答 |
| AI 助教 | `/chat` | Claude 串流對話，Markdown 渲染 |
| 寫作工具 | `/writing` | 作文批改、自然度、敬語轉換、翻譯 |
| 筆記分析 | `/upload` | PDF/圖片 OCR + AI 整理出題 |
| 學習計畫 | `/study-plan` | AI 個人化備考計畫生成 |

### Phase 3 — 進階功能
| 頁面 | 路徑 | 說明 |
|------|------|------|
| 聽解練習 | `/listening` | AI 生成對話腳本，TTS 朗讀，理解測驗 |
| 跟讀練習 | `/shadowing` | 逐句播放+麥克風錄音對比 |
| 設定 | `/settings` | 主題切換、推播通知、每日目標 |
| PWA | — | 可安裝、離線支援、推播通知 |
| 深色模式 | — | 暖色深棕主題，護眼 |

## 快速開始

```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數
cp .env.example .env.local
# 填入 Supabase URL、anon key、Anthropic API key

# 3. 初始化資料庫（依序執行）
# Supabase SQL Editor > 執行 supabase/schema.sql
# Supabase SQL Editor > 執行 supabase/phase2.sql
# Supabase SQL Editor > 執行 supabase/phase3.sql

# 4. 啟動開發伺服器
npm run dev
```

## 技術架構

```
前端：  Next.js 14 (App Router) + Tailwind CSS + Framer Motion
後端：  Next.js API Routes (Edge-compatible)
資料庫：Supabase (PostgreSQL + RLS)
AI：    Anthropic Claude (claude-sonnet-4-20250514)
語音：  Web Speech API (TTS) + MediaRecorder (錄音)
PWA：   Service Worker + Web Push API
部署：  Vercel
```

## 環境變數

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## 部署

詳見 [DEPLOY.md](./DEPLOY.md)

---

Made with ☕ and AI
