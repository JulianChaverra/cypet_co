-- =========================================================
-- CYPET: perfiles de jugadores
-- Migración: 20261026200019_create_profiles.sql
-- =========================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,

    display_name text not null
        check (char_length(trim(display_name)) between 1 and 40),

    username text not null
        check (username ~ '^[a-zA-Z0-9_]{3,20}$'),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Los nombres de usuario son únicos sin distinguir mayúsculas.
create unique index if not exists profiles_username_lower_unique
    on public.profiles (lower(username));

-- Activar seguridad por fila.
alter table public.profiles enable row level security;

-- Cada jugador solo puede consultar su propio perfil.
create policy "profiles_select_own"
    on public.profiles
    for select
    to authenticated
    using ((select auth.uid()) = id);

-- Cada jugador solo puede modificar su propio perfil.
create policy "profiles_update_own"
    on public.profiles
    for update
    to authenticated
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);

-- Mantener updated_at actualizado.
create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_set_updated_at
    before update on public.profiles
    for each row
    execute function public.set_profile_updated_at();

-- Crear automáticamente el perfil cuando se crea un usuario en Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    requested_username text;
    requested_display_name text;
begin
    requested_username :=
        coalesce(
            nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
            'player_' || left(replace(new.id::text, '-', ''), 12)
        );

    requested_display_name :=
        coalesce(
            nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
            requested_username
        );

    insert into public.profiles (id, display_name, username)
    values (
        new.id,
        requested_display_name,
        requested_username
    );

    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();