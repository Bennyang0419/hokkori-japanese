-- ====================================================
-- Phase 4 補充 SQL — 在 Supabase SQL Editor 執行
-- ====================================================

-- Add Stripe and subscription fields to profiles
alter table public.profiles
  add column if not exists stripe_customer_id     text unique,
  add column if not exists subscription_expires_at timestamptz;

-- Performance indexes
create index if not exists idx_vocab_frequency    on public.vocabulary(level, frequency desc);
create index if not exists idx_grammar_sort       on public.grammar_points(level, sort_order);
create index if not exists idx_mistake_review     on public.mistake_book(user_id, review_due) where is_resolved = false;
create index if not exists idx_flashcard_srs      on public.user_flashcards(user_id, due_date, mastery);
create index if not exists idx_progress_streak    on public.daily_progress(user_id, date desc);

-- Full-text search for vocabulary
create index if not exists idx_vocab_fts on public.vocabulary
  using gin(to_tsvector('simple', coalesce(word,'') || ' ' || coalesce(reading,'') || ' ' || coalesce(meaning_zh,'')));

-- Full-text search for grammar
create index if not exists idx_grammar_fts on public.grammar_points
  using gin(to_tsvector('simple', coalesce(pattern,'') || ' ' || coalesce(meaning_zh,'')));

-- Search function
create or replace function public.search_content(
  p_query text,
  p_level jlpt_level default null
) returns table (
  type    text,
  id      uuid,
  title   text,
  desc    text,
  level   jlpt_level
) language sql security definer as $$
  select 'vocabulary'::text, id, word, meaning_zh, level
  from public.vocabulary
  where (p_level is null or level = p_level)
    and to_tsvector('simple', word || ' ' || reading || ' ' || meaning_zh)
        @@ plainto_tsquery('simple', p_query)
  limit 5
  union all
  select 'grammar'::text, id, pattern, meaning_zh, level
  from public.grammar_points
  where (p_level is null or level = p_level)
    and to_tsvector('simple', pattern || ' ' || meaning_zh)
        @@ plainto_tsquery('simple', p_query)
  limit 5;
$$;

-- Materialized view: user learning summary (for fast dashboard loading)
create materialized view if not exists public.user_learning_summary as
select
  p.id                           as user_id,
  p.display_name,
  p.current_level,
  p.target_level,
  p.plan,
  coalesce(sum(dp.words_studied), 0) as total_words,
  coalesce(sum(dp.quizzes_done),  0) as total_quizzes,
  count(distinct dp.date)            as study_days,
  max(dp.streak_day)                 as best_streak,
  (select streak_day from public.daily_progress
   where user_id = p.id order by date desc limit 1) as current_streak
from public.profiles p
left join public.daily_progress dp on dp.user_id = p.id
group by p.id;

create unique index if not exists idx_summary_user on public.user_learning_summary(user_id);

-- Refresh function (call via cron or on-demand)
create or replace function public.refresh_learning_summary()
returns void language sql security definer as $$
  refresh materialized view concurrently public.user_learning_summary;
$$;

-- Seed more N5 vocabulary
insert into public.vocabulary (level, word, reading, meaning_zh, part_of_speech, examples, memory_tip) values
('N5','学校','がっこう','學校','名詞','[{"jp":"学校に行きます。","zh":"去學校。"}]','がっ(合)+こう→合校'),
('N5','先生','せんせい','老師','名詞','[{"jp":"先生はやさしいです。","zh":"老師很溫柔。"}]','先(せん)生→先生'),
('N5','食べる','たべる','吃','動詞（一段）','[{"jp":"ご飯を食べます。","zh":"吃飯。"}]','食(食物)+べる'),
('N5','飲む','のむ','喝','動詞（五段）','[{"jp":"水を飲みます。","zh":"喝水。"}]','飲(のむ)'),
('N5','見る','みる','看','動詞（一段）','[{"jp":"テレビを見ます。","zh":"看電視。"}]','見→看見'),
('N5','行く','いく','去','動詞（五段）','[{"jp":"どこへ行きますか。","zh":"要去哪裡？"}]','行(ゆく/いく)'),
('N5','来る','くる','來','動詞（不規則）','[{"jp":"友達が来ます。","zh":"朋友要來。"}]','来(くる)'),
('N5','帰る','かえる','回去','動詞（五段）','[{"jp":"家に帰ります。","zh":"回家。"}]','帰=回歸'),
('N5','起きる','おきる','起床','動詞（一段）','[{"jp":"7時に起きます。","zh":"7點起床。"}]','起(おき)る'),
('N5','寝る','ねる','睡覺','動詞（一段）','[{"jp":"早く寝てください。","zh":"請早點睡。"}]','寝(ね)る')
on conflict do nothing;
