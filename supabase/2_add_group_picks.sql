-- Add a JSONB column to profiles for users to predict which teams advance
-- from each group. Safe to run multiple times.
--
-- Shape:
--   { "A": { "1": "MEX", "2": "KOR", "3": "CZE" },
--     "B": { "1": "SUI", "2": "CAN", "3": "QAT" }, … }
--
-- "1" = 1st place pick, "2" = 2nd, "3" = 3rd (best-third candidate).
alter table public.profiles
  add column if not exists group_picks jsonb not null default '{}'::jsonb;
