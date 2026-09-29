-- Lead magnet: estende le guide esistenti (guides / guide_deliveries) invece di creare
-- un'infrastruttura parallela. Aggiunge link univoco tracciato, apertura, download,
-- keyword, provenienza e follow-up (predisposto, spento di default).
-- Additiva e idempotente.

-- ─── guides: impostazioni del lead magnet ────────────────────────────
alter table public.guides add column if not exists file_url          text;      -- PDF (percorso pubblico o URL): abilita pagina di download
alter table public.guides add column if not exists match_mode        text not null default 'short';
alter table public.guides add column if not exists message_template  text;      -- {nome} {guida} {link}
alter table public.guides add column if not exists attach_file       boolean not null default false; -- allega il PDF nei DM (IG/Messenger)
alter table public.guides add column if not exists follow_up_enabled boolean not null default false;
alter table public.guides add column if not exists follow_up_hours   integer not null default 24;
alter table public.guides add column if not exists follow_up_message text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'guides_match_mode_check') then
    alter table public.guides add constraint guides_match_mode_check check (match_mode in ('short', 'contains'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'guides_follow_up_hours_check') then
    alter table public.guides add constraint guides_follow_up_hours_check check (follow_up_hours between 1 and 720);
  end if;
end $$;

-- ─── guide_deliveries: tracking completo ─────────────────────────────
alter table public.guide_deliveries add column if not exists token             text;
alter table public.guide_deliveries add column if not exists keyword           text;
alter table public.guide_deliveries add column if not exists trigger_kind      text;   -- 'dm' | 'comment' | 'ai' | 'manual'
alter table public.guide_deliveries add column if not exists trigger_text      text;
alter table public.guide_deliveries add column if not exists post_id           text;
alter table public.guide_deliveries add column if not exists comment_id        text;
alter table public.guide_deliveries add column if not exists message_text      text;
alter table public.guide_deliveries add column if not exists link_url          text;
alter table public.guide_deliveries add column if not exists attachment_sent   boolean not null default false;
alter table public.guide_deliveries add column if not exists attachment_error  text;
alter table public.guide_deliveries add column if not exists opened_at         timestamptz;
alter table public.guide_deliveries add column if not exists last_opened_at    timestamptz;
alter table public.guide_deliveries add column if not exists open_count        integer not null default 0;
alter table public.guide_deliveries add column if not exists downloaded_at     timestamptz;
alter table public.guide_deliveries add column if not exists download_count    integer not null default 0;
alter table public.guide_deliveries add column if not exists follow_up_due_at  timestamptz;
alter table public.guide_deliveries add column if not exists follow_up_status  text;   -- 'scheduled' | 'sent' | 'manual' | 'skipped'
alter table public.guide_deliveries add column if not exists follow_up_at      timestamptz;

create unique index if not exists guide_deliveries_token_uidx on public.guide_deliveries(token) where token is not null;
create index if not exists guide_deliveries_guide_idx on public.guide_deliveries(guide_id, sent_at desc);
create index if not exists guide_deliveries_follow_up_idx on public.guide_deliveries(follow_up_due_at) where follow_up_status = 'scheduled';

-- ─── Lead magnet "10 errori" ─────────────────────────────────────────
insert into public.guides (name, slug, description, url, file_url, active, trigger_keywords, platforms, match_mode, attach_file, message_template, follow_up_message)
values (
  '10 errori che ti fanno perdere clienti online',
  '10-errori',
  'Guida PDF gratuita: i 10 errori più comuni che fanno perdere clienti online e come risolverli.',
  'https://diecibottega.it/lead-magnets/10-errori-clienti-online.pdf',
  '/lead-magnets/10-errori-clienti-online.pdf',
  true,
  '{errori}',
  '{instagram,facebook,linkedin,tiktok}',
  'contains',
  true,
  E'Ciao{nome}! 🎁 Ecco la tua guida gratuita "{guida}":\n{link}\n\nSe dopo averla letta vuoi un parere sul tuo sito, scrivimi pure qui.',
  E'Ciao{nome}, sei riuscito a dare un''occhiata alla guida sui 10 errori? Se vuoi ti dico quali valgono per il tuo sito 🙂'
)
on conflict (slug) do nothing;
