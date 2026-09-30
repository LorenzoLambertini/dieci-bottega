-- Chat del sito collegata al Social AI: le guide / lead magnet valgono anche per la chat.
-- Additiva e idempotente.
update public.guides
set platforms = array_append(platforms, 'web'), updated_at = now()
where not ('web' = any(platforms));

alter table public.guides alter column platforms set default '{instagram,facebook,linkedin,tiktok,web}';
