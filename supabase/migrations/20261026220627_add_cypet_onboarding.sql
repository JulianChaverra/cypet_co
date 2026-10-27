-- Add onboarding progress to player profiles.

alter table public.profiles
  add column if not exists onboarding_step text
  not null default 'signal_detected';

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

-- Restrict the onboarding step to known states.
alter table public.profiles
  add constraint profiles_onboarding_step_check
  check (
    onboarding_step in (
      'signal_detected',
      'egg_discovered',
      'materializing',
      'completed'
    )
  );