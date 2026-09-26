-- ════════════════════════════════════════════════════════════════════
--  Social AI — modulo CRM Dieci Bottega
--  Migration additiva e idempotente: NON modifica né elimina dati esistenti.
--
--  Riutilizza:
--    leads         → contatto CRM (la "scheda contatto" del modulo social)
--    tags/lead_tags→ tag
--    activities    → timeline/attività CRM
--    opportunities → opportunità commerciali (tool create_lead)
--    profiles      → utenti/ruoli (admin | sales | marketing)
--
--  Unica modifica a tabelle esistenti:
--    leads.email diventa NULLABLE (un contatto social spesso non ha email).
--    Il vincolo UNIQUE su email resta valido (Postgres ammette più NULL).
--    leads: + temperature, + interests (colonne nuove, con default).
-- ════════════════════════════════════════════════════════════════════


-- ─── Helper: utente CRM autenticato (ha un profilo) ─────────────────
create or replace function public.is_crm_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

create or replace function public.is_crm_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ─── leads: estensioni minime ───────────────────────────────────────
alter table public.leads alter column email drop not null;
alter table public.leads add column if not exists temperature text
  check (temperature is null or temperature in ('cold', 'warm', 'hot'));
alter table public.leads add column if not exists interests text[] not null default '{}';

-- ─── social_accounts ────────────────────────────────────────────────
-- Account/pagine collegate. NESSUN token qui: i token stanno in
-- social_account_secrets, leggibile solo dal service role.
create table if not exists public.social_accounts (
  id               uuid primary key default gen_random_uuid(),
  platform         text not null check (platform in ('instagram', 'facebook', 'linkedin', 'tiktok')),
  account_id       text not null,             -- IG user id / Page id / org URN / open_id
  account_name     text,
  username         text,
  page_id          text,                      -- per Instagram: Page FB collegata (invio messaggi)
  status           text not null default 'connected'
                   check (status in ('connected', 'disconnected', 'error', 'requires_approval')),
  scopes           text[] not null default '{}',
  token_expires_at timestamptz,
  webhook_status   text not null default 'unknown'
                   check (webhook_status in ('unknown', 'subscribed', 'failed', 'not_available')),
  last_sync_at     timestamptz,
  last_error       text,
  connected_at     timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (platform, account_id)
);

create table if not exists public.social_account_secrets (
  account_id        uuid primary key references public.social_accounts(id) on delete cascade,
  access_token_enc  text not null,            -- AES-256-GCM (SOCIAL_TOKEN_ENCRYPTION_KEY)
  refresh_token_enc text,
  updated_at        timestamptz not null default now()
);

-- ─── social_identities: utente social ↔ contatto CRM ───────────────
create table if not exists public.social_identities (
  id               uuid primary key default gen_random_uuid(),
  platform         text not null,
  platform_user_id text not null,             -- IGSID / PSID / member URN / open_id
  account_id       uuid references public.social_accounts(id) on delete set null,
  username         text,
  display_name     text,
  avatar_url       text,
  lead_id          uuid references public.leads(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (platform, platform_user_id)
);
create index if not exists social_identities_lead_idx on public.social_identities(lead_id);

-- ─── social_conversations ───────────────────────────────────────────
create table if not exists public.social_conversations (
  id                       uuid primary key default gen_random_uuid(),
  contact_id               uuid references public.leads(id) on delete set null,
  identity_id              uuid references public.social_identities(id) on delete set null,
  account_id               uuid references public.social_accounts(id) on delete set null,
  platform                 text not null,
  external_conversation_id text not null,
  status                   text not null default 'open'
                           check (status in ('open', 'needs_human', 'human', 'closed')),
  ai_enabled               boolean not null default true,
  human_takeover           boolean not null default false,
  handoff_reason           text,
  assigned_to              uuid references public.profiles(id) on delete set null,
  lead_score               integer not null default 0 check (lead_score between 0 and 100),
  temperature              text not null default 'cold' check (temperature in ('cold', 'warm', 'hot')),
  intent                   text,
  signals                  text[] not null default '{}',
  unread_count             integer not null default 0,
  last_message_at          timestamptz,
  last_message_preview     text,
  last_inbound_at          timestamptz,     -- per la finestra di messaggistica 24h
  summary                  text,            -- riassunto AI dei messaggi vecchi (cost control)
  summarized_count         integer not null default 0,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (platform, external_conversation_id)
);
create index if not exists social_conversations_last_idx on public.social_conversations(last_message_at desc);
create index if not exists social_conversations_contact_idx on public.social_conversations(contact_id);

-- ─── ai_actions: audit log di ogni azione AI / umana / di sistema ──
create table if not exists public.ai_actions (
  id              uuid primary key default gen_random_uuid(),
  contact_id      uuid references public.leads(id) on delete set null,
  conversation_id uuid references public.social_conversations(id) on delete set null,
  platform        text,
  action_type     text not null,
  actor           text not null default 'ai' check (actor in ('ai', 'rule', 'human', 'system')),
  actor_user_id   uuid references public.profiles(id) on delete set null,
  summary         text,
  input           jsonb,
  output          jsonb,
  status          text not null default 'success' check (status in ('success', 'error', 'skipped', 'pending')),
  error           text,
  created_at      timestamptz not null default now()
);
create index if not exists ai_actions_created_idx on public.ai_actions(created_at desc);
create index if not exists ai_actions_conversation_idx on public.ai_actions(conversation_id);

-- ─── social_messages (DM) ───────────────────────────────────────────
create table if not exists public.social_messages (
  id                  uuid primary key default gen_random_uuid(),
  conversation_id     uuid not null references public.social_conversations(id) on delete cascade,
  contact_id          uuid references public.leads(id) on delete set null,
  platform            text not null,
  external_message_id text,
  direction           text not null check (direction in ('inbound', 'outbound')),
  message_type        text not null default 'text',
  content             text,
  media_url           text,
  ai_generated        boolean not null default false,
  ai_action_id        uuid references public.ai_actions(id) on delete set null,
  sent_by             uuid references public.profiles(id) on delete set null,
  delivery_status     text not null default 'received'
                      check (delivery_status in ('received', 'pending', 'sent', 'failed')),
  error               text,
  retry_count         integer not null default 0,
  reply_to_comment_id text,      -- private reply: DM collegato a un commento
  created_at          timestamptz not null default now()
);
create unique index if not exists social_messages_external_uidx
  on public.social_messages(platform, external_message_id) where external_message_id is not null;
create index if not exists social_messages_conv_idx on public.social_messages(conversation_id, created_at);

-- ─── social_comments ────────────────────────────────────────────────
create table if not exists public.social_comments (
  id                  uuid primary key default gen_random_uuid(),
  platform            text not null,
  account_id          uuid references public.social_accounts(id) on delete set null,
  conversation_id     uuid references public.social_conversations(id) on delete set null,
  external_comment_id text,
  post_id             text,
  contact_id          uuid references public.leads(id) on delete set null,
  username            text,
  content             text,
  parent_comment_id   text,
  direction           text not null default 'inbound' check (direction in ('inbound', 'outbound')),
  ai_processed        boolean not null default false,
  response_sent       boolean not null default false,
  delivery_status     text not null default 'received'
                      check (delivery_status in ('received', 'pending', 'sent', 'failed')),
  error               text,
  retry_count         integer not null default 0,
  created_at          timestamptz not null default now()
);
create unique index if not exists social_comments_external_uidx
  on public.social_comments(platform, external_comment_id) where external_comment_id is not null;

-- ─── guides (lead magnet) ───────────────────────────────────────────
create table if not exists public.guides (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  description      text,
  url              text not null,
  active           boolean not null default true,
  trigger_keywords text[] not null default '{}',
  platforms        text[] not null default '{instagram,facebook,linkedin,tiktok}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.guide_deliveries (
  id              uuid primary key default gen_random_uuid(),
  guide_id        uuid not null references public.guides(id) on delete cascade,
  contact_id      uuid references public.leads(id) on delete set null,
  conversation_id uuid references public.social_conversations(id) on delete set null,
  platform        text not null,
  channel         text not null default 'dm' check (channel in ('dm', 'private_reply', 'comment')),
  status          text not null default 'sent' check (status in ('sent', 'failed', 'pending')),
  error           text,
  sent_at         timestamptz not null default now()
);
create index if not exists guide_deliveries_contact_idx on public.guide_deliveries(contact_id);

-- ─── social_automation_rules ────────────────────────────────────────
create table if not exists public.social_automation_rules (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  platform      text not null default 'all',
  trigger_type  text not null check (trigger_type in
                  ('comment_keyword', 'dm_keyword', 'any_keyword', 'intent', 'lead_score_above')),
  trigger_value text not null default '',
  action_type   text not null check (action_type in
                  ('send_guide', 'ai_qualification', 'notify_admin', 'human_takeover', 'add_tag', 'reply_text')),
  guide_id      uuid references public.guides(id) on delete set null,
  enabled       boolean not null default true,
  priority      integer not null default 100,
  configuration jsonb not null default '{}'::jsonb,
  run_count     integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── ai_runs: costi/latency per ogni chiamata Claude ───────────────
create table if not exists public.ai_runs (
  id                   uuid primary key default gen_random_uuid(),
  conversation_id      uuid references public.social_conversations(id) on delete set null,
  contact_id           uuid references public.leads(id) on delete set null,
  purpose              text not null default 'decision' check (purpose in ('decision', 'summary', 'simulation')),
  model                text not null,
  input_tokens         integer not null default 0,
  output_tokens        integer not null default 0,
  cache_read_tokens    integer not null default 0,
  cache_write_tokens   integer not null default 0,
  latency_ms           integer not null default 0,
  tool_calls           integer not null default 0,
  result               jsonb,
  error                text,
  created_at           timestamptz not null default now()
);
create index if not exists ai_runs_created_idx on public.ai_runs(created_at desc);

-- ─── ai_knowledge: knowledge base modificabile dal CRM ─────────────
create table if not exists public.ai_knowledge (
  id         uuid primary key default gen_random_uuid(),
  category   text not null check (category in
               ('company', 'services', 'pricing', 'faq', 'case_study', 'portfolio', 'policy', 'tone', 'rules')),
  title      text not null,
  content    text not null,
  active     boolean not null default true,
  position   integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── social_ai_settings (singleton id = 1) ─────────────────────────
create table if not exists public.social_ai_settings (
  id                     integer primary key default 1 check (id = 1),
  ai_enabled             boolean not null default false,  -- spento finché non lo accendi tu
  auto_reply_enabled     boolean not null default true,
  auto_reply_comments    boolean not null default true,
  auto_reply_dms         boolean not null default true,
  auto_send_guides       boolean not null default true,
  lead_scoring_enabled   boolean not null default true,
  human_handoff_enabled  boolean not null default true,
  model                  text,                             -- null → ANTHROPIC_MODEL
  max_response_chars     integer not null default 600 check (max_response_chars between 80 and 2000),
  brand_tone             text,
  confidence_threshold   numeric(3,2) not null default 0.60 check (confidence_threshold between 0 and 1),
  history_limit          integer not null default 12 check (history_limit between 2 and 50),
  summarize_after        integer not null default 30 check (summarize_after between 10 and 500),
  max_ai_calls_per_hour  integer not null default 20 check (max_ai_calls_per_hour between 1 and 500),
  system_prompt          text,                             -- null → prompt di default nel codice
  handoff_message        text not null default 'Grazie! Ti passo a Lorenzo o Tommaso del team, ti rispondono a breve.',
  comment_guide_reply    text not null default 'Ti ho appena scritto in DM 📩',
  scoring_config         jsonb not null default '{}'::jsonb, -- vuoto → default documentati nel codice
  updated_at             timestamptz not null default now()
);
insert into public.social_ai_settings (id) values (1) on conflict (id) do nothing;

-- ─── social_webhook_events: idempotenza + coda retry ───────────────
create table if not exists public.social_webhook_events (
  id            uuid primary key default gen_random_uuid(),
  platform      text not null,
  event_key     text not null unique,   -- es. "instagram:message:<mid>"
  event_type    text not null,
  payload       jsonb not null,
  status        text not null default 'received'
                check (status in ('received', 'processing', 'processed', 'failed', 'dead', 'ignored')),
  attempts      integer not null default 0,
  last_error    text,
  next_retry_at timestamptz,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz
);
create index if not exists social_webhook_events_retry_idx
  on public.social_webhook_events(status, next_retry_at);

-- ─── notifications (non esisteva un sistema di notifiche) ──────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade, -- null = tutto il team
  type       text not null,
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_created_idx on public.notifications(created_at desc);

-- ─── oauth_states: CSRF per i flussi OAuth ─────────────────────────
create table if not exists public.social_oauth_states (
  state      text primary key,
  platform   text not null,
  user_id    uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════
--  RLS
--  - Il backend (webhook, AI engine) usa il service role → bypassa RLS.
--  - Utenti CRM autenticati: lettura; scrittura operativa su inbox.
--  - Configurazione (settings, knowledge, regole, guide, account): admin.
--  - social_account_secrets / social_oauth_states / social_webhook_events:
--    NESSUNA policy → inaccessibili dal client, solo service role.
-- ════════════════════════════════════════════════════════════════════

alter table public.social_accounts          enable row level security;
alter table public.social_account_secrets   enable row level security;
alter table public.social_identities        enable row level security;
alter table public.social_conversations     enable row level security;
alter table public.social_messages          enable row level security;
alter table public.social_comments          enable row level security;
alter table public.ai_actions               enable row level security;
alter table public.guides                   enable row level security;
alter table public.guide_deliveries         enable row level security;
alter table public.social_automation_rules  enable row level security;
alter table public.ai_runs                  enable row level security;
alter table public.ai_knowledge             enable row level security;
alter table public.social_ai_settings       enable row level security;
alter table public.social_webhook_events    enable row level security;
alter table public.notifications            enable row level security;
alter table public.social_oauth_states      enable row level security;

do $$
declare t text;
begin
  -- lettura per tutti gli utenti CRM
  foreach t in array array[
    'social_accounts','social_identities','social_conversations','social_messages',
    'social_comments','ai_actions','guides','guide_deliveries','social_automation_rules',
    'ai_runs','ai_knowledge','social_ai_settings'
  ] loop
    execute format('drop policy if exists "crm read %1$s" on public.%1$I', t);
    execute format('create policy "crm read %1$s" on public.%1$I for select using (public.is_crm_user())', t);
  end loop;

  -- scrittura operativa (inbox) per utenti CRM
  foreach t in array array['social_conversations','social_messages','social_identities'] loop
    execute format('drop policy if exists "crm write %1$s" on public.%1$I', t);
    execute format('create policy "crm write %1$s" on public.%1$I for all using (public.is_crm_user()) with check (public.is_crm_user())', t);
  end loop;

  -- configurazione: solo admin
  foreach t in array array['guides','social_automation_rules','ai_knowledge','social_ai_settings','social_accounts'] loop
    execute format('drop policy if exists "admin write %1$s" on public.%1$I', t);
    execute format('create policy "admin write %1$s" on public.%1$I for all using (public.is_crm_admin()) with check (public.is_crm_admin())', t);
  end loop;
end $$;

drop policy if exists "own notifications" on public.notifications;
create policy "own notifications" on public.notifications
  for select using (public.is_crm_user() and (user_id is null or user_id = auth.uid()));
drop policy if exists "own notifications update" on public.notifications;
create policy "own notifications update" on public.notifications
  for update using (public.is_crm_user() and (user_id is null or user_id = auth.uid()));

-- ─── Seed opzionale: guida d'esempio (disattivata) ─────────────────
insert into public.guides (name, slug, description, url, active, trigger_keywords)
values (
  'Checklist sito web PMI',
  'checklist-sito-web-pmi',
  'Checklist pratica per capire se il sito della tua attività funziona.',
  'https://diecibottega.it/guide/checklist-sito-web-pmi',
  false,
  array['guida', 'guida sito', 'checklist']
)
on conflict (slug) do nothing;
