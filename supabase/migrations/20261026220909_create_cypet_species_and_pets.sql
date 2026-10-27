
-- Species available in the Cypet game.
create table if not exists public.cypet_species (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  sprite_path text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

-- Pets owned by players.
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  species_id uuid not null references public.cypet_species(id),
  nickname text,
  level integer not null default 1 check (level >= 1),
  experience bigint not null default 0 check (experience >= 0),
  is_initial boolean not null default false,
  created_at timestamptz not null default now()
);

-- A player can only have one initial Cypet.
create unique index if not exists pets_one_initial_per_owner
  on public.pets(owner_id)
  where is_initial = true;

-- Enable Row Level Security.
alter table public.cypet_species enable row level security;
alter table public.pets enable row level security;

-- Authenticated players can read available species.
drop policy if exists "Authenticated users can read available species"
  on public.cypet_species;

create policy "Authenticated users can read available species"
  on public.cypet_species
  for select
  to authenticated
  using (is_available = true);

-- Players can read their own pets.
drop policy if exists "Players can read their own pets"
  on public.pets;

create policy "Players can read their own pets"
  on public.pets
  for select
  to authenticated
  using (owner_id = (select auth.uid()));
