create table public.runs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  distance_km numeric not null check (distance_km > 0 and distance_km <= 100000),
  duration_sec integer not null check (duration_sec > 0 and duration_sec <= 31536000),
  date timestamptz not null,
  location text not null check (char_length(location) between 1 and 100),
  notes text check (char_length(notes) <= 500),
  created_at timestamptz not null default now()
);

-- Matches the feed order (newest first, id as tie-breaker) and the per-user filter.
create index runs_date_id_idx on public.runs (date desc, id desc);
create index runs_profile_id_idx on public.runs (profile_id);

-- No policies on purpose: only the server (secret key) can read or write.
alter table public.runs enable row level security;
