-- Commenti del blog: inviati dal sito (API con service role), moderati dal CRM.
-- Additiva e idempotente.
create table if not exists public.blog_comments (
  id           uuid primary key default gen_random_uuid(),
  post_slug    text not null,
  parent_id    uuid references public.blog_comments(id) on delete cascade,
  author_name  text not null,
  author_email text,                     -- facoltativa, mai mostrata
  body         text not null,
  status       text not null default 'pending' check (status in ('pending', 'approved', 'spam')),
  is_team      boolean not null default false,  -- risposta di Dieci Bottega
  ip_hash      text,                     -- hash dell'IP (anti-spam), mai l'IP in chiaro
  created_at   timestamptz not null default now(),
  approved_at  timestamptz
);
create index if not exists blog_comments_post_idx on public.blog_comments(post_slug, status, created_at);
create index if not exists blog_comments_status_idx on public.blog_comments(status, created_at desc);

alter table public.blog_comments enable row level security;
drop policy if exists "crm all blog_comments" on public.blog_comments;
create policy "crm all blog_comments" on public.blog_comments
  for all using (public.is_crm_user()) with check (public.is_crm_user());
-- Nessuna policy per anon: il sito legge e scrive solo tramite le API server (service role).
