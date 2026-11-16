create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  -- Null until the person signs in with OAuth. Seeded users never get one.
  auth_user_id uuid unique references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 1 and 100),
  username text not null check (username ~ '^[A-Za-z0-9_]{1,30}$'),
  avatar_url text not null,
  created_at timestamptz not null default now()
);

-- Usernames are matched case-insensitively by the API, so enforce it here too.
create unique index profiles_username_lower_key on public.profiles (lower(username));

-- No policies on purpose: only the server (secret key) can read or write.
alter table public.profiles enable row level security;
