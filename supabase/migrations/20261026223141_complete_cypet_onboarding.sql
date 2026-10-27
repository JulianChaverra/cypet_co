create or replace function public.complete_cypet_onboarding()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_pet_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select p.id
    into v_pet_id
  from public.pets p
  where p.owner_id = v_user_id
    and p.is_initial = true
  limit 1;

  if v_pet_id is null then
    raise exception 'initial_cypet_required';
  end if;

  update public.profiles
  set onboarding_step = 'completed',
      onboarding_completed_at = coalesce(
        onboarding_completed_at,
        now()
      )
  where id = v_user_id;

  return jsonb_build_object(
    'success', true,
    'pet_id', v_pet_id
  );
end;
$$;

revoke all on function public.complete_cypet_onboarding() from public;
grant execute on function public.complete_cypet_onboarding() to authenticated;