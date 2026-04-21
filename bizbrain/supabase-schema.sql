-- ================================================================
-- BizBrain Database Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com
-- ================================================================

create extension if not exists "uuid-ossp";

-- ── 1. Users ─────────────────────────────────────────────────
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  avatar_url    text,
  thinking_type text check (thinking_type in ('猎手型','工程师型','执行者型','白纸型')),
  rank          text not null default '学徒'
                  check (rank in ('学徒','分析师','顾问','战略家','商业家')),
  total_xp      integer not null default 0,
  streak_days   integer not null default 0,
  last_active   date,
  created_at    timestamptz not null default now()
);

alter table public.users enable row level security;
create policy "users_own" on public.users
  using (auth.uid() = id) with check (auth.uid() = id);

-- ── 2. Cases ─────────────────────────────────────────────────
create table public.cases (
  id                serial primary key,
  title             text not null,
  company           text,
  context           text not null,
  industry          text not null,
  framework         text not null,
  difficulty        text not null check (difficulty in ('入门','进阶','高阶')),
  thinking_types    text[] not null default '{}',
  section           text not null check (section in ('新手村','框架岛','案例城','热点战场')),
  map_position      integer not null unique,
  xp_reward         integer not null default 50,
  expert_breakdown  text not null default '',
  key_anchors       text[] not null default '{}',
  is_published      boolean not null default false,
  created_at        timestamptz not null default now()
);

alter table public.cases enable row level security;
create policy "cases_public_read" on public.cases
  for select using (is_published = true);

-- ── 3. Questions ─────────────────────────────────────────────
create table public.questions (
  id       serial primary key,
  case_id  integer not null references public.cases(id) on delete cascade,
  layer    integer not null check (layer in (1, 2, 3)),
  text     text not null,
  hint     text,
  unique (case_id, layer)
);

alter table public.questions enable row level security;
create policy "questions_public_read" on public.questions
  for select using (
    exists (select 1 from public.cases c where c.id = questions.case_id and c.is_published = true)
  );

-- ── 4. User Progress ─────────────────────────────────────────
create table public.user_progress (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  case_id       integer not null references public.cases(id),
  completed     boolean not null default false,
  completed_at  timestamptz,
  attempt_count integer not null default 0,
  xp_earned     integer not null default 0,
  unique (user_id, case_id)
);

alter table public.user_progress enable row level security;
create policy "progress_own" on public.user_progress
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 5. User Answers ───────────────────────────────────────────
create table public.user_answers (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  case_id         integer not null references public.cases(id),
  question_layer  integer not null check (question_layer in (1, 2, 3)),
  answer_text     text not null,
  ai_feedback     text,
  submitted_at    timestamptz not null default now()
);

alter table public.user_answers enable row level security;
create policy "answers_own" on public.user_answers
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 6. Vocabulary ─────────────────────────────────────────────
create table public.vocabulary (
  id                  serial primary key,
  term                text not null unique,
  category            text not null,
  plain_explanation   text not null,
  formal_definition   text not null,
  example             text not null,
  use_cases           text[] not null default '{}',
  misconceptions      text,
  related_terms       text[] not null default '{}',
  created_at          timestamptz not null default now()
);

alter table public.vocabulary enable row level security;
create policy "vocab_public_read" on public.vocabulary for select using (true);

-- ── 7. Posts ──────────────────────────────────────────────────
create table public.posts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  content     text not null,
  category    text not null default '商业现象',
  image_url   text,
  likes       integer not null default 0,
  case_id     integer references public.cases(id),
  created_at  timestamptz not null default now()
);

alter table public.posts enable row level security;
create policy "posts_public_read"  on public.posts for select using (true);
create policy "posts_own_write"    on public.posts for insert with check (auth.uid() = user_id);

-- ── 8. Comments ───────────────────────────────────────────────
create table public.comments (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid references public.posts(id) on delete cascade,
  case_id     integer references public.cases(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  content     text not null,
  likes       integer not null default 0,
  created_at  timestamptz not null default now(),
  check (
    (post_id is not null and case_id is null) or
    (post_id is null and case_id is not null)
  )
);

alter table public.comments enable row level security;
create policy "comments_public_read" on public.comments for select using (true);
create policy "comments_own_write"   on public.comments for insert with check (auth.uid() = user_id);

-- ── 9. Achievements ────────────────────────────────────────────
create table public.achievements (
  id          serial primary key,
  key         text unique not null,
  name        text not null,
  description text not null,
  icon        text not null,
  condition   jsonb not null
);

create table public.user_achievements (
  user_id         uuid not null references public.users(id) on delete cascade,
  achievement_id  integer not null references public.achievements(id),
  earned_at       timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table public.achievements     enable row level security;
alter table public.user_achievements enable row level security;
create policy "achievements_public_read"  on public.achievements for select using (true);
create policy "user_achievements_own"     on public.user_achievements using (auth.uid() = user_id);

-- ── 10. Streaks ───────────────────────────────────────────────
create table public.streaks (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade unique,
  current_streak  integer not null default 0,
  longest_streak  integer not null default 0,
  last_checkin    date,
  checkin_dates   date[] not null default '{}'
);

alter table public.streaks enable row level security;
create policy "streaks_own" on public.streaks
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────
create index idx_user_progress_user   on public.user_progress(user_id);
create index idx_user_answers_user    on public.user_answers(user_id, case_id);
create index idx_posts_created        on public.posts(created_at desc);
create index idx_comments_case        on public.comments(case_id);
create index idx_cases_map_position   on public.cases(map_position);

-- ── Auto-create user row on signup ───────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1), 'user_' || substr(new.id::text, 1, 6))
  );
  insert into public.streaks (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Seed: achievements ────────────────────────────────────────
insert into public.achievements (key, name, description, icon, condition) values
  ('first_case',       '破冰者',     '完成第一个关卡',        '🧊', '{"type":"case_count","value":1}'),
  ('streak_7',         '一周达人',   '连续打卡7天',           '🔥', '{"type":"streak","value":7}'),
  ('streak_30',        '习惯养成者', '连续打卡30天',          '⚡', '{"type":"streak","value":30}'),
  ('xp_300',           '分析师',     '累计获得300 XP',        '📊', '{"type":"xp","value":300}'),
  ('xp_800',           '顾问',       '累计获得800 XP',        '🎯', '{"type":"xp","value":800}'),
  ('complete_village', '新手毕业',   '完成新手村全部5关',     '🏅', '{"type":"section_complete","value":"新手村"}'),
  ('tech_case',        '科技观察家', '完成第一个科技行业案例', '💻', '{"type":"industry","value":"科技"}');
