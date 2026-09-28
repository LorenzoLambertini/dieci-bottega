-- Sincronizzazione social ogni 2 minuti, anche a CRM chiuso (Vercel Hobby ha solo cron giornalieri).
-- pg_cron chiama /api/cron/social-sync con pg_net. Il CRON_SECRET NON è in questo file:
-- va salvato una volta nel Vault di Supabase con nome 'cron_secret':
--   select vault.create_secret('<CRON_SECRET>', 'cron_secret');
create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'social-sync') then
    perform cron.unschedule('social-sync');
  end if;
end $$;

select cron.schedule(
  'social-sync',
  '*/2 * * * *',
  $job$
  select net.http_get(
    url := 'https://diecibottega.it/api/cron/social-sync',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret' limit 1)
    ),
    timeout_milliseconds := 60000
  ) where exists (select 1 from vault.decrypted_secrets where name = 'cron_secret');
  $job$
);
