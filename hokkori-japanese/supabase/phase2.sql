-- ====================================================
-- Phase 2 補充 SQL — 在 Supabase SQL Editor 執行
-- ====================================================

-- Helper: increment mistake count
create or replace function public.increment_mistake_count(
  p_user_id uuid,
  p_question text
) returns void language plpgsql security definer as $$
begin
  update public.mistake_book
  set wrong_count = wrong_count + 1,
      last_wrong_at = now(),
      review_due = current_date
  where user_id = p_user_id and question = p_question;
end;
$$;

-- Add upload analysis table for saved results
create table if not exists public.upload_analyses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  filename    text,
  output_type text not null,
  result      text not null,
  created_at  timestamptz default now()
);
alter table public.upload_analyses enable row level security;
create policy "Own uploads" on public.upload_analyses for all using (is_own(user_id));

-- Add study_plans table
create table if not exists public.study_plans (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  from_level  jlpt_level not null,
  to_level    jlpt_level not null,
  duration    text,
  daily_time  text,
  weak_areas  text[],
  plan_text   text not null,
  created_at  timestamptz default now()
);
alter table public.study_plans enable row level security;
create policy "Own plans" on public.study_plans for all using (is_own(user_id));

-- Add writing_history table
create table if not exists public.writing_history (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  tool_type   text not null,  -- essay|naturalness|keigo|translate
  input_text  text not null,
  result_text text not null,
  created_at  timestamptz default now()
);
alter table public.writing_history enable row level security;
create policy "Own writing" on public.writing_history for all using (is_own(user_id));
