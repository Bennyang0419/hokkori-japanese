-- ====================================================
-- Phase 3 補充 SQL — 在 Supabase SQL Editor 執行
-- ====================================================

-- Listening practice history
create table if not exists public.listening_history (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  level       jlpt_level not null,
  topic       text not null,
  script      jsonb not null,
  score       int,
  total_q     int,
  created_at  timestamptz default now()
);
alter table public.listening_history enable row level security;
create policy "Own listening" on public.listening_history for all using (is_own(user_id));

-- Shadowing sessions
create table if not exists public.shadowing_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  level       jlpt_level not null,
  script_title text,
  lines_done  int default 0,
  total_lines int,
  created_at  timestamptz default now()
);
alter table public.shadowing_sessions enable row level security;
create policy "Own shadowing" on public.shadowing_sessions for all using (is_own(user_id));

-- Push notification subscriptions
create table if not exists public.push_subscriptions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  endpoint     text not null,
  p256dh_key   text,
  auth_key     text,
  reminder_hour int default 20,
  is_active    boolean default true,
  created_at   timestamptz default now(),
  unique(user_id, endpoint)
);
alter table public.push_subscriptions enable row level security;
create policy "Own push subs" on public.push_subscriptions for all using (is_own(user_id));

-- Update upsert_daily_progress to also track listening minutes
create or replace function public.upsert_daily_progress(
  p_user_id    uuid,
  p_words      int default 0,
  p_quizzes    int default 0,
  p_minutes    int default 0
) returns void language plpgsql security definer as $$
declare
  yesterday   date := current_date - 1;
  prev_streak int  := 0;
begin
  select coalesce(streak_day, 0) into prev_streak
  from public.daily_progress
  where user_id = p_user_id and date = yesterday;

  insert into public.daily_progress
    (user_id, date, words_studied, quizzes_done, study_minutes, streak_day)
  values
    (p_user_id, current_date, p_words, p_quizzes, p_minutes,
     case when prev_streak > 0 then prev_streak + 1 else 1 end)
  on conflict (user_id, date) do update set
    words_studied = daily_progress.words_studied + p_words,
    quizzes_done  = daily_progress.quizzes_done  + p_quizzes,
    study_minutes = daily_progress.study_minutes + p_minutes;
end;
$$;
