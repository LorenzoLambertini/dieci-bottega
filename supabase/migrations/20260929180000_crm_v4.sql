-- CRM v4: tempo in fase, motivo di perdita, consenso/privacy, segnalato da,
-- registro dei cambi di stato, checklist onboarding, azione "assegna".
-- Additiva e idempotente.

alter table public.leads add column if not exists stage_entered_at  timestamptz not null default now();
alter table public.leads add column if not exists lost_reason       text;
alter table public.leads add column if not exists referred_by       text;
alter table public.leads add column if not exists do_not_contact    boolean not null default false;
alter table public.leads add column if not exists marketing_consent boolean;
alter table public.leads add column if not exists consent_at        timestamptz;

alter table public.projects add column if not exists checklist jsonb not null default '[]'::jsonb;

-- Data di ingresso nello stage + registro dei cambi di stato (con motivo di perdita).
-- I cambi di stage e di assegnatario sono già registrati dai trigger esistenti
-- (log_stage_change, log_assignment_change).
create or replace function public.leads_track_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stage_id is distinct from old.stage_id then
    new.stage_entered_at := now();
  end if;
  if new.status is distinct from old.status then
    insert into activities(lead_id, user_id, type, subject, body, metadata)
      values (new.id, auth.uid(), 'stage_change', 'Stato: ' || old.status::text || ' → ' || new.status::text,
              case when new.status::text = 'lost' then new.lost_reason end,
              jsonb_build_object('status_from', old.status, 'status_to', new.status));
  end if;
  return new;
end;
$$;
revoke execute on function public.leads_track_changes() from public, anon, authenticated;

drop trigger if exists leads_track_changes on public.leads;
create trigger leads_track_changes
  before update of stage_id, status on public.leads
  for each row execute function public.leads_track_changes();

-- Azione "assegna a" nelle automazioni CRM
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
    if new.do_not_contact and r.action->>'type' = 'follow_up' then continue; end if;

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
    elsif a->>'type' = 'assign' then
      if (a->>'user_id') is not null and exists (select 1 from profiles where id = (a->>'user_id')::uuid) then
        update leads set assigned_to = (a->>'user_id')::uuid where id = new.id;
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
