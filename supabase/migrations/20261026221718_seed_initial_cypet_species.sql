insert into public.cypet_species
  (code, name, description, sprite_path)
values
  (
    'cyber_feline',
    'Felino digital',
    'Una criatura curiosa nacida de una señal desconocida.',
    null
  ),
  (
    'cyber_fox',
    'Zorro digital',
    'Una criatura ágil que explora los rincones de la red.',
    null
  ),
  (
    'cyber_dragon',
    'Dragón digital',   
    'Una criatura enigmática con una energía extraordinaria.',
    null
  ),
  (
    'cyber_axolotl',
    'Ajolote digital',
    'Una criatura tranquila que se adapta a los mundos digitales.',
    null
  )
on conflict (code) do nothing;