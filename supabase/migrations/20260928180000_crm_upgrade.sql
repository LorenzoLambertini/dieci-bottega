-- CRM upgrade: promemoria di follow-up, stage di default, KPI corretti, indici.
-- Additiva e idempotente: nessuna colonna o tabella esistente viene rimossa.

-- 1. Promemoria / prossima azione sul contatto
alter table public.leads add column if not exists next_action_at   timestamptz;
alter table public.leads add column if not exists next_action_note text;
create index if not exists leads_next_action_idx on public.leads(next_action_at) where next_action_at is not null;

-- 2. Ogni nuovo lead senza stage entra nel primo stage della pipeline
--    (vale per sito, chatbot, social e inserimento manuale)
create or replace function public.leads_default_stage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stage_id is null then
    select id into new.stage_id from public.pipeline_stages order by position asc limit 1;
  end if;
  return new;
end;
$$;
revoke execute on function public.leads_default_stage() from public, anon, authenticated;

drop trigger if exists leads_default_stage on public.leads;
create trigger leads_default_stage
  before insert on public.leads
  for each row execute function public.leads_default_stage();

-- 3. KPI: la vecchia vista contava un lead più volte se aveva più opportunità.
--    Stesse colonne, calcoli separati; security_invoker applica le RLS di chi legge.
create or replace view public.crm_kpi
with (security_invoker = true) as
with l as (
  select
    count(*)                                                              as total_leads,
    count(*) filter (where created_at::date = current_date)               as new_leads_today,
    count(*) filter (where created_at >= date_trunc('week', now()))       as new_leads_this_week,
    count(*) filter (where created_at >= date_trunc('month', now()))      as new_leads_this_month,
    count(*) filter (where status = 'won'::lead_status)                   as won_leads,
    count(*) filter (where status = 'lost'::lead_status)                  as lost_leads,
    round(100.0 * count(*) filter (where status = 'won'::lead_status)::numeric
      / nullif(count(*) filter (where status in ('won'::lead_status, 'lost'::lead_status)), 0)::numeric, 1) as conversion_rate
  from public.leads
), o as (
  select coalesce(sum(value), 0::numeric) as total_pipeline_value,
         coalesce(avg(value), 0::numeric) as avg_deal_value
  from public.opportunities
)
select l.total_leads, l.new_leads_today, l.new_leads_this_week, l.new_leads_this_month,
       l.won_leads, l.lost_leads, l.conversion_rate,
       o.total_pipeline_value, o.avg_deal_value
from l cross join o;

-- 4. Indici per le query più frequenti
create index if not exists opportunities_lead_idx on public.opportunities(lead_id);
create index if not exists leads_source_idx on public.leads(source);
