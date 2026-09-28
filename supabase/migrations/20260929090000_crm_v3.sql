-- CRM v3: preventivi, modelli email, progetti/clienti, automazioni CRM, notifiche push.
-- Additiva e idempotente. Le RLS riusano gli helper is_crm_user()/is_crm_admin().

-- ─── Preventivi ───────────────────────────────────────────────
create table if not exists public.quotes (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid not null references public.leads(id) on delete cascade,
  opportunity_id  uuid references public.opportunities(id) on delete set null,
  number          text not null unique,
  title           text not null,
  items           jsonb not null default '[]'::jsonb,   -- [{description, qty, unit_price, unit}]
  discount        numeric not null default 0,
  total           numeric not null default 0,
  notes           text,
  valid_until     date,
  status          text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected')),
  public_token    text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  sent_at         timestamptz,
  viewed_at       timestamptz,
  accepted_at     timestamptz,
  accepted_name   text,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists quotes_lead_idx on public.quotes(lead_id);

-- ─── Modelli email ────────────────────────────────────────────
create table if not exists public.email_templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  subject     text not null,
  body        text not null,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Progetti / clienti ───────────────────────────────────────
create table if not exists public.projects (
  id                 uuid primary key default gen_random_uuid(),
  lead_id            uuid not null references public.leads(id) on delete cascade,
  quote_id           uuid references public.quotes(id) on delete set null,
  name               text not null,
  phase              text not null default 'brief'
                     check (phase in ('brief', 'design', 'revisioni', 'sviluppo', 'online', 'manutenzione', 'chiuso')),
  value              numeric not null default 0,
  deposit_amount     numeric not null default 0,
  deposit_paid_at    date,
  balance_paid_at    date,
  start_date         date default current_date,
  due_date           date,
  care_plan          text,          -- es. "Care Plus"
  care_monthly       numeric,
  care_renewal_date  date,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists projects_lead_idx on public.projects(lead_id);

-- ─── Automazioni CRM (eseguite dal database) ─────────────────
create table if not exists public.crm_automations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  trigger      text not null check (trigger in ('lead_created', 'status_changed', 'stage_changed')),
  conditions   jsonb not null default '{}'::jsonb,  -- {status, stage_name, source_in: []}
  action       jsonb not null,                      -- {type: follow_up|add_tag|create_project|set_status, ...}
  is_active    boolean not null default true,
  run_count    int not null default 0,
  last_run_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- ─── Notifiche push (PWA) ────────────────────────────────────
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- ─── RLS ─────────────────────────────────────────────────────
alter table public.quotes             enable row level security;
alter table public.email_templates    enable row level security;
alter table public.projects           enable row level security;
alter table public.crm_automations    enable row level security;
alter table public.push_subscriptions enable row level security;

do $$
declare t text;
begin
  foreach t in array array['quotes', 'email_templates', 'projects'] loop
    execute format('drop policy if exists "crm all %1$s" on public.%1$I', t);
    execute format('create policy "crm all %1$s" on public.%1$I for all using (public.is_crm_user()) with check (public.is_crm_user())', t);
  end loop;
end $$;

drop policy if exists "crm read crm_automations" on public.crm_automations;
create policy "crm read crm_automations" on public.crm_automations for select using (public.is_crm_user());
drop policy if exists "admin write crm_automations" on public.crm_automations;
create policy "admin write crm_automations" on public.crm_automations for all using (public.is_crm_admin()) with check (public.is_crm_admin());

drop policy if exists "own push subscriptions" on public.push_subscriptions;
create policy "own push subscriptions" on public.push_subscriptions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── Motore automazioni ──────────────────────────────────────
-- Gira come trigger su leads: vale per ogni canale (sito, chatbot, social, CRM, pipeline).
create or replace function public.run_crm_automations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  trig text;
  stage_name text;
  c jsonb;
  a jsonb;
  tag_id uuid;
  tag_name text;
begin
  if tg_op = 'INSERT' then
    trig := 'lead_created';
  elsif new.status is distinct from old.status then
    trig := 'status_changed';
  elsif new.stage_id is distinct from old.stage_id then
    trig := 'stage_changed';
  else
    return new;
  end if;

  select name into stage_name from pipeline_stages where id = new.stage_id;

  for r in select * from crm_automations where is_active and trigger in (trig, case when tg_op = 'UPDATE' and new.stage_id is distinct from old.stage_id then 'stage_changed' end) loop
    c := r.conditions;
    if c ? 'status' and new.status::text <> c->>'status' then continue; end if;
    if c ? 'stage_name' and coalesce(stage_name, '') <> c->>'stage_name' then continue; end if;
    if c ? 'source_in' and not (coalesce(new.source, '') in (select jsonb_array_elements_text(c->'source_in'))) then continue; end if;

    a := r.action;
    if a->>'type' = 'follow_up' then
      update leads set next_action_at = date_trunc('day', now() at time zone 'Europe/Rome')
                         at time zone 'Europe/Rome' + make_interval(days => coalesce((a->>'days')::int, 1)) + interval '9 hours',
                       next_action_note = coalesce(a->>'note', 'Ricontattare')
        where id = new.id;
    elsif a->>'type' = 'add_tag' then
      tag_name := lower(regexp_replace(trim(a->>'tag'), '\s+', '-', 'g'));
      if length(tag_name) >= 2 then
        insert into tags(name, color) values (tag_name, coalesce(a->>'color', '#E63B2E')) on conflict (name) do nothing;
        select id into tag_id from tags where name = tag_name;
        insert into lead_tags(lead_id, tag_id) values (new.id, tag_id) on conflict do nothing;
      end if;
    elsif a->>'type' = 'create_project' then
      if not exists (select 1 from projects where lead_id = new.id) then
        insert into projects(lead_id, name, value, quote_id)
        select new.id,
               coalesce((select q.title from quotes q where q.lead_id = new.id and q.status = 'accepted' order by q.accepted_at desc limit 1),
                        'Progetto ' || new.name),
               coalesce((select q.total from quotes q where q.lead_id = new.id and q.status = 'accepted' order by q.accepted_at desc limit 1),
                        (select max(o.value) from opportunities o where o.lead_id = new.id), 0),
               (select q.id from quotes q where q.lead_id = new.id and q.status = 'accepted' order by q.accepted_at desc limit 1);
      end if;
    end if;

    insert into activities(lead_id, type, subject, metadata)
      values (new.id, 'system', 'Automazione: ' || r.name, jsonb_build_object('automation_id', r.id));
    update crm_automations set run_count = run_count + 1, last_run_at = now() where id = r.id;
  end loop;
  return new;
end;
$$;
revoke execute on function public.run_crm_automations() from public, anon, authenticated;

drop trigger if exists crm_automations_run on public.leads;
create trigger crm_automations_run
  after insert or update of status, stage_id on public.leads
  for each row execute function public.run_crm_automations();

-- ─── Dati iniziali ───────────────────────────────────────────
insert into public.email_templates (name, subject, body, position)
select * from (values
  ('Primo contatto', 'Il tuo nuovo sito · Dieci Bottega',
   E'Ciao {{nome}},\n\nsono {{mittente}} di Dieci Bottega. Ho visto la tua richiesta e mi farebbe piacere capire meglio cosa ti serve.\n\nTi va una call di 20 minuti questa settimana? Dimmi tu il giorno e l''orario che preferisci.\n\nA presto,\n{{mittente}}', 1),
  ('Invio preventivo', 'Il preventivo per {{azienda}}',
   E'Ciao {{nome}},\n\ncome promesso ti mando il preventivo: trovi tutti i dettagli al link qui sotto e puoi accettarlo direttamente online.\n\n{{link_preventivo}}\n\nSe hai domande scrivimi pure, anche su WhatsApp.\n\n{{mittente}}', 2),
  ('Sollecito gentile', 'Novità sul preventivo?',
   E'Ciao {{nome}},\n\nti scrivo per sapere se hai avuto modo di guardare il preventivo. Se c''è qualcosa da sistemare o vuoi parlarne al telefono sono a disposizione.\n\n{{mittente}}', 3),
  ('Grazie e benvenuto', 'Benvenuto in Dieci Bottega!',
   E'Ciao {{nome}},\n\ngrazie per averci scelto! Nei prossimi giorni ti mandiamo il brief per iniziare a lavorare al progetto.\n\nA prestissimo,\n{{mittente}}', 4)
) v(name, subject, body, position)
where not exists (select 1 from public.email_templates);

insert into public.crm_automations (name, trigger, conditions, action)
select * from (values
  ('Nuovo contatto → promemoria domani', 'lead_created', '{}'::jsonb, '{"type":"follow_up","days":1,"note":"Primo contatto"}'::jsonb),
  ('Proposta inviata → sollecito tra 5 giorni', 'status_changed', '{"status":"proposal"}'::jsonb, '{"type":"follow_up","days":5,"note":"Sollecito preventivo"}'::jsonb),
  ('Vinto → crea progetto', 'status_changed', '{"status":"won"}'::jsonb, '{"type":"create_project"}'::jsonb)
) v(name, trigger, conditions, action)
where not exists (select 1 from public.crm_automations);
