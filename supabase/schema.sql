-- World Cup Tiesheet — Supabase schema
-- Run this in the Supabase SQL editor after creating a new project.
-- Safe to re-run: drops and recreates everything below.

drop view if exists public.leaderboard cascade;
drop function if exists public.get_leaderboard cascade;
drop table if exists public.predictions cascade;
drop table if exists public.matches cascade;
drop table if exists public.profiles cascade;
drop table if exists public.app_settings cascade;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  champion_country text,
  created_at timestamptz not null default now()
);

-- 31 matches total. IDs are stable bracket positions:
--   1..16  = R32 (16 matches)
--   17..24 = R16 (8 matches)
--   25..28 = QF  (4 matches)
--   29..30 = SF  (2 matches)
--   31     = F   (1 match)
-- Winner of match k in R32 (k=1..16) feeds R16 match 17 + floor((k-1)/2),
-- with odd k → home slot, even k → away slot. Same rule applies between rounds.
create table public.matches (
  id int primary key,
  round text not null check (round in ('R32','R16','QF','SF','F')),
  slot int not null,
  team_home text,
  team_away text,
  winner text,
  played_at timestamptz
);

create table public.predictions (
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id int not null references public.matches(id) on delete cascade,
  predicted_winner text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

create table public.app_settings (
  key text primary key,
  value text not null
);

insert into public.app_settings (key, value) values
  ('predictions_close_at', '2026-07-01T00:00:00Z');

-- ---------------------------------------------------------------------------
-- Seed the 31 match rows (team slots left null; admin fills them in once
-- group stage is settled).
-- ---------------------------------------------------------------------------
insert into public.matches (id, round, slot) values
  (1,'R32',1),(2,'R32',2),(3,'R32',3),(4,'R32',4),
  (5,'R32',5),(6,'R32',6),(7,'R32',7),(8,'R32',8),
  (9,'R32',9),(10,'R32',10),(11,'R32',11),(12,'R32',12),
  (13,'R32',13),(14,'R32',14),(15,'R32',15),(16,'R32',16),
  (17,'R16',1),(18,'R16',2),(19,'R16',3),(20,'R16',4),
  (21,'R16',5),(22,'R16',6),(23,'R16',7),(24,'R16',8),
  (25,'QF',1),(26,'QF',2),(27,'QF',3),(28,'QF',4),
  (29,'SF',1),(30,'SF',2),
  (31,'F',1);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.app_settings enable row level security;

-- profiles: readable by anyone, writable only by owner
create policy "profiles_select_all"
  on public.profiles for select using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- matches: readable by anyone; writes only via service_role (admin API)
create policy "matches_select_all"
  on public.matches for select using (true);

-- predictions:
--   select  : owner always; everyone after predictions_close_at
--   insert  : owner, only while predictions are open
--   update  : owner, only while predictions are open
create policy "predictions_select"
  on public.predictions for select
  using (
    auth.uid() = user_id
    or (
      select (value)::timestamptz from public.app_settings
      where key = 'predictions_close_at'
    ) <= now()
  );

create policy "predictions_insert_open"
  on public.predictions for insert
  with check (
    auth.uid() = user_id
    and (
      select (value)::timestamptz from public.app_settings
      where key = 'predictions_close_at'
    ) > now()
  );

create policy "predictions_update_open"
  on public.predictions for update
  using (
    auth.uid() = user_id
    and (
      select (value)::timestamptz from public.app_settings
      where key = 'predictions_close_at'
    ) > now()
  );

-- app_settings: readable by anyone (clients need predictions_close_at)
create policy "app_settings_select_all"
  on public.app_settings for select using (true);

-- ---------------------------------------------------------------------------
-- Leaderboard (computed via security-definer function so aggregation
-- bypasses per-row RLS on predictions during the prediction window).
-- ---------------------------------------------------------------------------
create or replace function public.get_leaderboard()
returns table (
  user_id uuid,
  display_name text,
  champion_country text,
  points int
)
language sql
security definer
stable
set search_path = public
as $$
  with match_pts as (
    select
      pr.user_id,
      sum(case
        when m.winner is not null and pr.predicted_winner = m.winner then
          case m.round when 'R32' then 2 else 3 end
        else 0
      end)::int as pts
    from public.predictions pr
    join public.matches m on m.id = pr.match_id
    group by pr.user_id
  ),
  champion_bonus as (
    select p.id as user_id,
      case
        when (select winner from public.matches where id = 31) is not null
          and p.champion_country = (select winner from public.matches where id = 31)
        then 10 else 0
      end as bonus
    from public.profiles p
  )
  select
    p.id,
    p.display_name,
    p.champion_country,
    coalesce(mp.pts, 0) + coalesce(cb.bonus, 0) as points
  from public.profiles p
  left join match_pts mp on mp.user_id = p.id
  left join champion_bonus cb on cb.user_id = p.id
  order by points desc, p.display_name asc;
$$;

grant execute on function public.get_leaderboard() to anon, authenticated;
