/**
 * Filtri condivisi tra la lista contatti e l'export CSV.
 * La ricerca viene ripulita dai caratteri che hanno un significato nei filtri
 * PostgREST (virgole, parentesi, asterischi): senza, "Rossi, Mario" rompeva la query.
 */
export interface LeadFilterParams {
  q?: string;
  status?: string;
  stage?: string;
  assigned?: string;
  channel?: string;
  follow?: string;
  tag?: string;
  view?: string;
}

export const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;
export const STATUS_LABEL_IT: Record<string, string> = {
  new: "Nuovo",
  contacted: "Contattato",
  qualified: "Qualificato",
  proposal: "Proposta inviata",
  won: "Vinto",
  lost: "Perso",
};
export const SOCIAL_SOURCES = ["instagram", "facebook", "linkedin", "tiktok"];

export function cleanSearch(q: string | undefined): string {
  return (q ?? "").replace(/[,()*%\\:"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

/** Fine della giornata di oggi (ora italiana approssimata con quella del server + margine). */
export function endOfToday(): string {
  const d = new Date();
  d.setUTCHours(23, 59, 59, 999);
  return d.toISOString();
}

export function applyLeadFilters<T>(query: T, p: LeadFilterParams): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = query as any;
  const s = cleanSearch(p.q);
  if (s) q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,company.ilike.%${s}%,phone.ilike.%${s}%`);
  if (p.status && (LEAD_STATUSES as readonly string[]).includes(p.status)) q = q.eq("status", p.status);
  if (p.stage) q = q.eq("stage_id", p.stage);
  if (p.assigned) q = q.eq("assigned_to", p.assigned);
  if (p.channel === "social") q = q.in("source", SOCIAL_SOURCES);
  if (p.follow === "due") q = q.lte("next_action_at", endOfToday());
  if (p.follow === "planned") q = q.not("next_action_at", "is", null);
  if (p.follow === "none") q = q.is("next_action_at", null).not("status", "in", "(won,lost)");
  // viste rapide
  if (p.view === "hot") q = q.or("temperature.eq.hot,score.gte.60");
  if (p.view === "idle") q = q.lt("updated_at", new Date(Date.now() - 30 * 86_400_000).toISOString()).not("status", "in", "(won,lost)");
  if (p.view === "clients") q = q.eq("status", "won");
  // richiede nella select l'embed `lead_tags!inner(tag_id)` (vedi tagFilterSelect)
  if (p.tag && /^[0-9a-f-]{36}$/i.test(p.tag)) q = q.eq("lead_tags.tag_id", p.tag);
  return q as T;
}

/** Embed da aggiungere alla select quando si filtra per tag. */
export function tagFilterSelect(p: LeadFilterParams): string {
  return p.tag && /^[0-9a-f-]{36}$/i.test(p.tag) ? ", lead_tags!inner(tag_id)" : "";
}

/** Viste rapide mostrate come "chip" sopra la lista. */
export const SAVED_VIEWS: { label: string; params: Record<string, string> }[] = [
  { label: "⏰ Da richiamare oggi", params: { follow: "due" } },
  { label: "🧭 Senza prossima azione", params: { follow: "none" } },
  { label: "🔥 Caldi", params: { view: "hot" } },
  { label: "📄 Preventivo inviato", params: { status: "proposal" } },
  { label: "💤 Fermi da 30 giorni", params: { view: "idle" } },
  { label: "🤝 Clienti", params: { view: "clients" } },
  { label: "📱 Dai social", params: { channel: "social" } },
];
