-- Social AI: stato "partial" per l'iscrizione webhook della Pagina (solo campo feed).
alter table public.social_accounts drop constraint if exists social_accounts_webhook_status_check;
alter table public.social_accounts add constraint social_accounts_webhook_status_check
  check (webhook_status in ('unknown', 'subscribed', 'partial', 'failed', 'not_available'));
