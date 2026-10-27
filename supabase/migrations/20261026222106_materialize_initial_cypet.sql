
create or replace function public.materialize_initial_cypet()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_pet_id uuid;
  v_species_id uuid;
  v_species_name text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Debes iniciar sesión para materializar tu Cypet';
  end if;

  -- Lock the profile so onboarding changes are serialized.
  perform 1
  from public.profiles
  where id = v_user_id
  for update;

  if not found then
    raise exception 'No se encontró el perfil del jugador';
  end if;

  -- Return the existing initial pet if it already exists.
  select p.id, p.species_id, s.name
    into v_pet_id, v_species_id, v_species_name
  from public.pets p
  join public.cypet_species s on s.id = p.species_id
  where p.owner_id = v_user_id
    and p.is_initial = true
  limit 1;

  if v_pet_id is not null then
    return jsonb_build_object(
      'pet_id', v_pet_id,
      'species_id', v_species_id,
      'species_name', v_species_name,
      'already_existed', true
    );
  end if;

  -- Choose a random available species.
  select id, name
    into v_species_id, v_species_name
  from public.cypet_species
  where is_available = true
  order by random()
  limit 1;

  if v_species_id is null then
    raise exception 'No hay especies disponibles';
  end if;

  insert into public.pets (
    owner_id,
    species_id,
    nickname,
    level,
    experience,
    is_initial
  )
  values (
    v_user_id,
    v_species_id,
    null,
    1,
    0,
    true
  )
  returning id into v_pet_id;

  update public.profiles
  set onboarding_step = 'materializing',
      updated_at = now()
  where id = v_user_id;

  return jsonb_build_object(
    'pet_id', v_pet_id,
    'species_id', v_species_id,
    'species_name', v_species_name,
    'already_existed', false
  );
end;
$$;

revoke all on function public.materialize_initial_cypet() from public;
grant execute on function public.materialize_initial_cypet() to authenticated;
