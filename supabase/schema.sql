-- ====================================================
-- ほっこり日語 — Complete Database Schema
-- Run this in Supabase SQL Editor
-- ====================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for text search

-- ====================================================
-- ENUMS
-- ====================================================
create type jlpt_level as enum ('N5','N4','N3','N2','N1');
create type content_type as enum ('grammar','vocabulary','kanji','reading','listening');
create type quiz_type as enum ('multiple_choice','fill_blank','sort','reading_comp','listening');
create type mastery_level as enum ('new','learning','review','mastered');
create type plan_type as enum ('free','pro');

-- ====================================================
-- 1. PROFILES (extends auth.users)
-- ====================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  avatar_url    text,
  current_level jlpt_level default 'N5',
  target_level  jlpt_level default 'N3',
  target_date   date,
  plan          plan_type default 'free',
  daily_goal_words  int default 20,
  daily_goal_quizzes int default 10,
  timezone      text default 'Asia/Taipei',
  ui_language   text default 'zh-TW',  -- 'zh-TW' | 'en' | 'ja'
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ====================================================
-- 2. GRAMMAR POINTS
-- ====================================================
create table public.grammar_points (
  id            uuid primary key default uuid_generate_v4(),
  level         jlpt_level not null,
  pattern       text not null,          -- e.g. 「〜てから」
  meaning_zh    text not null,          -- 繁中說明
  meaning_ja    text,
  structure     text,                   -- 接續方式
  examples      jsonb default '[]',     -- [{jp,zh}]
  common_errors text,
  similar_to    text[],                 -- 相似文法 IDs
  tags          text[],
  sort_order    int default 0,
  created_at    timestamptz default now()
);

create index idx_grammar_level on public.grammar_points(level);
create index idx_grammar_pattern on public.grammar_points using gin(pattern gin_trgm_ops);

-- ====================================================
-- 3. VOCABULARY
-- ====================================================
create table public.vocabulary (
  id            uuid primary key default uuid_generate_v4(),
  level         jlpt_level not null,
  word          text not null,
  reading       text not null,          -- 假名
  meaning_zh    text not null,
  meaning_ja    text,
  part_of_speech text,                  -- 名詞/動詞/形容詞...
  examples      jsonb default '[]',     -- [{jp,zh}]
  memory_tip    text,                   -- 記憶技巧
  tags          text[],
  frequency     int default 0,          -- 使用頻率分數
  created_at    timestamptz default now()
);

create index idx_vocab_level on public.vocabulary(level);
create index idx_vocab_word  on public.vocabulary using gin(word gin_trgm_ops);

-- ====================================================
-- 4. KANJI
-- ====================================================
create table public.kanji (
  id            uuid primary key default uuid_generate_v4(),
  level         jlpt_level not null,
  character     char(1) not null unique,
  on_readings   text[],                 -- 音読み
  kun_readings  text[],                 -- 訓読み
  meaning_zh    text not null,
  stroke_count  int,
  examples      jsonb default '[]',     -- [{word,reading,zh}]
  created_at    timestamptz default now()
);

create index idx_kanji_level on public.kanji(level);

-- ====================================================
-- 5. READING PASSAGES
-- ====================================================
create table public.reading_passages (
  id            uuid primary key default uuid_generate_v4(),
  level         jlpt_level not null,
  title         text not null,
  content       text not null,          -- 日文文章
  word_count    int,
  topic         text,
  questions     jsonb default '[]',     -- [{q, options:[{text,correct}], explanation}]
  created_at    timestamptz default now()
);

create index idx_reading_level on public.reading_passages(level);

-- ====================================================
-- 6. USER FLASHCARDS (single vocab card state per user)
-- ====================================================
create table public.user_flashcards (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  vocab_id       uuid references public.vocabulary(id) on delete cascade,
  -- For AI-generated cards
  word           text,
  reading        text,
  meaning_zh     text,
  level          jlpt_level,
  -- SRS (Spaced Repetition)
  mastery        mastery_level default 'new',
  ease_factor    float default 2.5,    -- SM-2 algorithm
  interval_days  int default 1,
  due_date       date default current_date,
  review_count   int default 0,
  correct_count  int default 0,
  last_reviewed  timestamptz,
  is_starred     boolean default false,
  created_at     timestamptz default now()
);

create index idx_flashcard_user    on public.user_flashcards(user_id);
create index idx_flashcard_due     on public.user_flashcards(user_id, due_date);
create index idx_flashcard_mastery on public.user_flashcards(user_id, mastery);

-- ====================================================
-- 7. QUIZ SESSIONS
-- ====================================================
create table public.quiz_sessions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  level         jlpt_level,
  quiz_type     quiz_type,
  total_questions int not null,
  correct_count int default 0,
  score         int,                    -- 0-100
  time_spent_sec int,
  completed_at  timestamptz,
  created_at    timestamptz default now()
);

create index idx_session_user on public.quiz_sessions(user_id);
create index idx_session_date on public.quiz_sessions(user_id, created_at desc);

-- ====================================================
-- 8. QUIZ ANSWERS (每道題的作答紀錄)
-- ====================================================
create table public.quiz_answers (
  id             uuid primary key default uuid_generate_v4(),
  session_id     uuid not null references public.quiz_sessions(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  level          jlpt_level,
  quiz_type      quiz_type,
  question       text not null,
  correct_answer text not null,
  user_answer    text,
  is_correct     boolean not null,
  time_spent_sec int,
  -- AI-generated question full data
  question_data  jsonb,                 -- {options, explanation, grammar_note, vocab_note}
  created_at     timestamptz default now()
);

create index idx_answer_user    on public.quiz_answers(user_id);
create index idx_answer_session on public.quiz_answers(session_id);
create index idx_answer_wrong   on public.quiz_answers(user_id, is_correct) where is_correct = false;

-- ====================================================
-- 9. MISTAKE BOOK (錯題本)
-- ====================================================
create table public.mistake_book (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  answer_id       uuid references public.quiz_answers(id) on delete set null,
  level           jlpt_level,
  quiz_type       quiz_type,
  question        text not null,
  correct_answer  text not null,
  user_answer     text,
  question_data   jsonb,
  wrong_count     int default 1,
  last_wrong_at   timestamptz default now(),
  is_resolved     boolean default false,
  ai_analysis     text,                 -- AI 分析常錯原因
  review_due      date default current_date,
  created_at      timestamptz default now()
);

create index idx_mistake_user  on public.mistake_book(user_id);
create index idx_mistake_level on public.mistake_book(user_id, level);
create unique index idx_mistake_unique on public.mistake_book(user_id, question);

-- ====================================================
-- 10. DAILY PROGRESS
-- ====================================================
create table public.daily_progress (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  date             date not null default current_date,
  words_studied    int default 0,
  quizzes_done     int default 0,
  correct_rate     float,              -- 0.0 ~ 1.0
  study_minutes    int default 0,
  streak_day       int default 0,
  created_at       timestamptz default now(),
  unique (user_id, date)
);

create index idx_progress_user on public.daily_progress(user_id);
create index idx_progress_date on public.daily_progress(user_id, date desc);

-- ====================================================
-- 11. AI CHAT HISTORY
-- ====================================================
create table public.chat_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text,                     -- auto-generated from first message
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table public.chat_messages (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references public.chat_sessions(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role        text not null check (role in ('user','assistant')),
  content     text not null,
  created_at  timestamptz default now()
);

create index idx_chat_session_user on public.chat_sessions(user_id);
create index idx_chat_msg_session  on public.chat_messages(session_id);

-- ====================================================
-- 12. USER NOTES (收藏筆記)
-- ====================================================
create table public.user_notes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  content     text not null,
  level       jlpt_level,
  tags        text[],
  is_pinned   boolean default false,
  source_type text,                     -- 'manual'|'ai_generated'|'upload'
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index idx_notes_user on public.user_notes(user_id);

-- ====================================================
-- RLS POLICIES
-- ====================================================
alter table public.profiles         enable row level security;
alter table public.user_flashcards  enable row level security;
alter table public.quiz_sessions    enable row level security;
alter table public.quiz_answers     enable row level security;
alter table public.mistake_book     enable row level security;
alter table public.daily_progress   enable row level security;
alter table public.chat_sessions    enable row level security;
alter table public.chat_messages    enable row level security;
alter table public.user_notes       enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Generic "own data" helper
create or replace function is_own(uid uuid) returns boolean
  language sql security definer as $$ select auth.uid() = uid $$;

-- Flashcards
create policy "Own flashcards" on public.user_flashcards
  for all using (is_own(user_id));

-- Quiz
create policy "Own quiz sessions" on public.quiz_sessions
  for all using (is_own(user_id));
create policy "Own quiz answers"  on public.quiz_answers
  for all using (is_own(user_id));

-- Mistakes
create policy "Own mistakes" on public.mistake_book
  for all using (is_own(user_id));

-- Progress
create policy "Own progress" on public.daily_progress
  for all using (is_own(user_id));

-- Chat
create policy "Own chat sessions"  on public.chat_sessions
  for all using (is_own(user_id));
create policy "Own chat messages"  on public.chat_messages
  for all using (is_own(user_id));

-- Notes
create policy "Own notes" on public.user_notes
  for all using (is_own(user_id));

-- Public read on content tables (no RLS needed)
-- grammar_points, vocabulary, kanji, reading_passages are public read

-- ====================================================
-- HELPER FUNCTIONS
-- ====================================================

-- Update streak on daily login
create or replace function public.upsert_daily_progress(
  p_user_id uuid,
  p_words int default 0,
  p_quizzes int default 0,
  p_minutes int default 0
) returns void language plpgsql security definer as $$
declare
  yesterday date := current_date - 1;
  prev_streak int := 0;
begin
  select coalesce(streak_day, 0) into prev_streak
  from public.daily_progress
  where user_id = p_user_id and date = yesterday;

  insert into public.daily_progress
    (user_id, date, words_studied, quizzes_done, study_minutes, streak_day)
  values
    (p_user_id, current_date, p_words, p_quizzes, p_minutes,
     case when prev_streak > 0 then prev_streak + 1 else 1 end)
  on conflict (user_id, date)
  do update set
    words_studied = daily_progress.words_studied + p_words,
    quizzes_done  = daily_progress.quizzes_done  + p_quizzes,
    study_minutes = daily_progress.study_minutes + p_minutes;
end;
$$;

-- SM-2 spaced repetition update
create or replace function public.update_flashcard_srs(
  p_card_id uuid,
  p_quality int  -- 0-5 (0=blackout, 5=perfect)
) returns void language plpgsql security definer as $$
declare
  card public.user_flashcards%rowtype;
  new_ef float;
  new_interval int;
  new_mastery mastery_level;
begin
  select * into card from public.user_flashcards where id = p_card_id;

  -- SM-2 ease factor
  new_ef := greatest(1.3,
    card.ease_factor + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02))
  );

  -- Interval
  if p_quality < 3 then
    new_interval := 1;
    new_mastery  := 'learning';
  elsif card.review_count = 0 then
    new_interval := 1;
    new_mastery  := 'learning';
  elsif card.review_count = 1 then
    new_interval := 6;
    new_mastery  := 'review';
  else
    new_interval := round(card.interval_days * new_ef)::int;
    new_mastery  := case when new_interval >= 21 then 'mastered' else 'review' end;
  end if;

  update public.user_flashcards set
    ease_factor   = new_ef,
    interval_days = new_interval,
    due_date      = current_date + new_interval,
    mastery       = new_mastery,
    review_count  = review_count + 1,
    correct_count = correct_count + case when p_quality >= 3 then 1 else 0 end,
    last_reviewed = now()
  where id = p_card_id;
end;
$$;

-- ====================================================
-- SEED: Sample N5 Grammar
-- ====================================================
insert into public.grammar_points (level, pattern, meaning_zh, structure, examples) values
('N5','〜は〜です','「⋯是⋯」基本判斷句','名詞 ＋ は ＋ 名詞 ＋ です',
 '[{"jp":"私は学生です。","zh":"我是學生。"},{"jp":"田中さんは先生です。","zh":"田中先生是老師。"}]'),
('N5','〜ている','正在進行／狀態持續','動詞て形 ＋ いる',
 '[{"jp":"今、食べています。","zh":"我現在正在吃飯。"},{"jp":"電気がついている。","zh":"燈開著。"}]'),
('N5','〜たい','想要做⋯（自己的願望）','動詞ます形（去ます） ＋ たい',
 '[{"jp":"日本へ行きたいです。","zh":"我想去日本。"},{"jp":"水が飲みたい。","zh":"我想喝水。"}]'),
('N5','〜ませんか','要不要一起做⋯？（邀請）','動詞ます形（去ます） ＋ ませんか',
 '[{"jp":"一緒に食べませんか。","zh":"要不要一起吃呢？"},{"jp":"映画を見ませんか。","zh":"要不要去看電影？"}]'),
('N5','〜てください','請做⋯（請求）','動詞て形 ＋ ください',
 '[{"jp":"ここに名前を書いてください。","zh":"請在這裡寫上名字。"},{"jp":"静かにしてください。","zh":"請安靜。"}]');

-- Seed N5 Vocabulary
insert into public.vocabulary (level, word, reading, meaning_zh, part_of_speech, examples) values
('N5','大切','たいせつ','重要；珍貴','な形容詞','[{"jp":"家族はとても大切です。","zh":"家人非常重要。"}]'),
('N5','勉強','べんきょう','學習；讀書','名詞・サ変','[{"jp":"毎日日本語を勉強しています。","zh":"我每天都在學日語。"}]'),
('N5','友達','ともだち','朋友','名詞','[{"jp":"友達と映画を見ました。","zh":"和朋友一起看了電影。"}]'),
('N5','電話','でんわ','電話','名詞','[{"jp":"電話をかけてください。","zh":"請打電話來。"}]'),
('N5','時間','じかん','時間','名詞','[{"jp":"時間がありません。","zh":"我沒有時間。"}]');
