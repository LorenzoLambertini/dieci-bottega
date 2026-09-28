-- I contatti importati da CSV non fanno partire le automazioni "nuovo contatto"
-- (evita centinaia di promemoria per domani dopo un import). Il trigger unico
-- viene diviso in due: inserimento (escluso source = 'import') e aggiornamento.
drop trigger if exists crm_automations_run on public.leads;
drop trigger if exists crm_automations_run_insert on public.leads;
drop trigger if exists crm_automations_run_update on public.leads;

create trigger crm_automations_run_insert
  after insert on public.leads
  for each row when (new.source is distinct from 'import')
  execute function public.run_crm_automations();

create trigger crm_automations_run_update
  after update of status, stage_id on public.leads
  for each row execute function public.run_crm_automations();
