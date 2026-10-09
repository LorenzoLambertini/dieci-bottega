/**
 * Attribuzione dei contatti: da dove arriva un lead (Google, Instagram, ChatGPT, blog…)
 * e quale pagina ha visto per prima. I dati arrivano dai form del sito (lib/utm.ts)
 * e vengono salvati sul lead senza mai sovrascrivere quelli già presenti.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export interface AttributionInput {
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  landing_page?: unknown;
  referrer?: unknown;
}

const clean = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

/** Normalizza i campi ricevuti dal browser (solo stringhe, lunghezze limitate). */
export function parseAttribution(p: AttributionInput) {
  const landing = clean(p.landing_page, 300);
  return {
    utm_source: clean(p.utm_source, 100),
    utm_medium: clean(p.utm_medium, 100),
    utm_campaign: clean(p.utm_campaign, 200),
    landing_page: landing && landing.startsWith("/") ? landing : null,
    referrer: clean(p.referrer, 200),
  };
}

/** Completa il lead con UTM, pagina d'ingresso e provenienza (solo i campi ancora vuoti). */
export async function saveAttribution(db: SupabaseClient, leadId: string, input: AttributionInput): Promise<void> {
  const a = parseAttribution(input);
  if (!a.utm_source && !a.landing_page && !a.referrer) return;
  const { data: lead } = await db
    .from("leads")
    .select("utm_source, utm_medium, utm_campaign, metadata")
    .eq("id", leadId)
    .maybeSingle();
  if (!lead) return;
  const meta = (lead.metadata ?? {}) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if (!lead.utm_source && a.utm_source) patch.utm_source = a.utm_source;
  if (!lead.utm_medium && a.utm_medium) patch.utm_medium = a.utm_medium;
  if (!lead.utm_campaign && a.utm_campaign) patch.utm_campaign = a.utm_campaign;
  const nextMeta = { ...meta };
  if (!meta.landing_page && a.landing_page) nextMeta.landing_page = a.landing_page;
  if (!meta.referrer && a.referrer) nextMeta.referrer = a.referrer;
  if (nextMeta.landing_page !== meta.landing_page || nextMeta.referrer !== meta.referrer) patch.metadata = nextMeta;
  if (Object.keys(patch).length === 0) return;
  await db.from("leads").update(patch).eq("id", leadId);
}
