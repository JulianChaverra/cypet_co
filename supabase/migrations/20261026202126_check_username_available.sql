
create or replace function public.is_username_available(
    requested_username text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select
        requested_username ~ '^[a-zA-Z0-9_]{3,20}$'
        and not exists (
            select 1
            from public.profiles p
            where lower(p.username) = lower(requested_username)
        );
$$;

revoke all on function public.is_username_available(text)
    from public;

grant execute on function public.is_username_available(text)
    to anon, authenticated;
