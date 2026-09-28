-- Valutazione delle risposte AI e "lezioni" per le risposte future.
-- Additiva e idempotente. RLS con gli helper is_crm_user()/is_crm_admin().

create table if not exists public.ai_reply_feedback (
  id              uuid primary key default gen_random_uuid(),
  message_id      uuid references public.social_messages(id) on delete cascade,
  comment_id      uuid references public.social_comments(id) on delete cascade,
  conversation_id uuid references public.social_conversations(id) on delete set null,
  platform        text,
  customer_text   text,                 -- cosa aveva scritto il cliente
  ai_reply        text,                 -- cosa ha risposto l'AI
  rating          smallint not null check (rating between 1 and 5),
  better_reply    text,                 -- risposta ideale scritta dal team
  lesson          text,                 -- regola da seguire in futuro
  use_for_training boolean not null default true,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (message_id is not null or comment_id is not null)
);

create unique index if not exists ai_reply_feedback_message_uidx on public.ai_reply_feedback(message_id) where message_id is not null;
create unique index if not exists ai_reply_feedback_comment_uidx on public.ai_reply_feedback(comment_id) where comment_id is not null;
create index if not exists ai_reply_feedback_training_idx on public.ai_reply_feedback(use_for_training, updated_at desc);

alter table public.ai_reply_feedback enable row level security;
drop policy if exists "crm all ai_reply_feedback" on public.ai_reply_feedback;
create policy "crm all ai_reply_feedback" on public.ai_reply_feedback
  for all using (public.is_crm_user()) with check (public.is_crm_user());
