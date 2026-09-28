/**
 * "Oggi": cosa richiede una decisione umana adesso, in ordine di priorità.
 * Usato dalla dashboard e dall'email del mattino.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type TodayKind = "call" | "followup" | "chat" | "new" | "quote" | "due" | "renewal" | "dormant";

export interface TodayAction {
  kind: TodayKind;
  title: string;
  detail?: string;
  href: string;
  late?: boolean;
  at?: string;
}

export interface TodaySummary {
  counters: { newToday: number; toContact: number; calls: number; followups: number; openQuotes: number; openQuotesValue: number; chats: number };
  actions: TodayAction[];
}

const DAY = 86_400_000;

/** Scostamento di Europe/Rome da UTC in quel momento, es. "+02:00" (ora legale) o "+01:00". */
export function romeOffset(d: Date): string {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Rome", timeZoneName: "shortOffset" }).formatToParts(d).find((p) => p.type === "timeZoneName")?.value ?? "GMT+1";
  const m = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return "+01:00";
  return `${m[1]}${m[2].padStart(2, "0")}:${m[3] ?? "00"}`;
}

function romeDay(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
}

export async function computeToday(db: SupabaseClient, now = new Date()): Promise<TodaySummary> {
  const today = romeDay(now);
  const off = romeOffset(now);
  const startToday = new Date(`${today}T00:00:00${off}`).toISOString();
  const endToday = new Date(`${today}T23:59:59.999${off}`).toISOString();
  const in3 = new Date(now.getTime() + 3 * DAY).toISOString().slice(0, 10);
  const in14 = new Date(now.getTime() + 14 * DAY).toISOString().slice(0, 10);

  const [calls, follows, newLeads, quotes, due, renew, dormant, chats, freshCount] = await Promise.all([
    db.from("leads").select("id, name, company, metadata").gte("metadata->>scheduled_slot", startToday).lte("metadata->>scheduled_slot", endToday),
    db.from("leads").select("id, name, company, next_action_at, next_action_note").lte("next_action_at", endToday).order("next_action_at").limit(30),
    db.from("leads").select("id, name, company, source, created_at").eq("status", "new").is("next_action_at", null).eq("do_not_contact", false).gte("created_at", new Date(now.getTime() - 14 * DAY).toISOString()).order("created_at", { ascending: false }).limit(10),
    db.from("quotes").select("id, number, title, total, sent_at, viewed_at, lead_id, lead:leads(name)").eq("status", "sent").order("sent_at").limit(30),
    db.from("projects").select("id, name, due_date, lead_id, phase").lte("due_date", in3).not("phase", "in", "(online,manutenzione,chiuso)").limit(10),
    db.from("projects").select("id, name, care_plan, care_renewal_date, lead_id").lte("care_renewal_date", in14).gte("care_renewal_date", today).limit(10),
    db.from("leads").select("id, name, company, updated_at").eq("status", "won").eq("do_not_contact", false).lt("updated_at", new Date(now.getTime() - 90 * DAY).toISOString()).is("next_action_at", null).limit(5),
    db.from("social_conversations").select("id", { count: "exact", head: true }).eq("status", "needs_human"),
    db.from("leads").select("id", { count: "exact", head: true }).gte("created_at", startToday),
  ]);

  const who = (l: { name: string; company?: string | null }) => (l.company ? `${l.name} · ${l.company}` : l.name);
  const hhmm = (iso: string) => new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
  const actions: TodayAction[] = [];

  const callRows = ((calls.data ?? []) as { id: string; name: string; company: string | null; metadata: { scheduled_slot?: string } | null }[])
    .filter((c) => c.metadata?.scheduled_slot && romeDay(new Date(c.metadata.scheduled_slot)) === today)
    .sort((a, b) => a.metadata!.scheduled_slot!.localeCompare(b.metadata!.scheduled_slot!));
  for (const c of callRows) actions.push({ kind: "call", title: `Call con ${who(c)}`, detail: `alle ${hhmm(c.metadata!.scheduled_slot!)}`, href: `/crm/leads/${c.id}`, at: c.metadata!.scheduled_slot });

  const followRows = (follows.data ?? []) as { id: string; name: string; company: string | null; next_action_at: string; next_action_note: string | null }[];
  for (const f of followRows) {
    const late = romeDay(new Date(f.next_action_at)) < today;
    actions.push({ kind: "followup", title: `${f.next_action_note ?? "Ricontattare"} · ${who(f)}`, detail: late ? `scaduto il ${new Date(f.next_action_at).toLocaleDateString("it-IT", { day: "numeric", month: "short", timeZone: "Europe/Rome" })}` : `oggi alle ${hhmm(f.next_action_at)}`, href: `/crm/leads/${f.id}`, late, at: f.next_action_at });
  }

  const chatCount = chats.count ?? 0;
  if (chatCount) actions.push({ kind: "chat", title: `${chatCount} chat social aspett${chatCount === 1 ? "a" : "ano"} una persona`, href: "/crm/social/inbox", late: true });

  for (const l of (newLeads.data ?? []) as { id: string; name: string; company: string | null; source: string | null; created_at: string }[]) {
    const days = Math.floor((now.getTime() - new Date(l.created_at).getTime()) / DAY);
    actions.push({ kind: "new", title: `Primo contatto: ${who(l)}`, detail: `nuovo${l.source ? ` da ${l.source}` : ""}${days ? `, da ${days} giorn${days === 1 ? "o" : "i"}` : ", oggi"} · nessun promemoria`, href: `/crm/leads/${l.id}`, late: days >= 2 });
  }

  const quoteRows = (quotes.data ?? []) as unknown as { id: string; number: string; title: string; total: number; sent_at: string | null; viewed_at: string | null; lead_id: string; lead: { name: string } | null }[];
  for (const q of quoteRows) {
    const days = q.sent_at ? Math.floor((now.getTime() - new Date(q.sent_at).getTime()) / DAY) : 0;
    if (days < 5) continue;
    actions.push({ kind: "quote", title: `Preventivo ${q.number} fermo da ${days} giorni`, detail: `${q.lead?.name ?? ""} · ${q.viewed_at ? "aperto" : "mai aperto"}`, href: `/crm/leads/${q.lead_id}` });
  }

  for (const p of (due.data ?? []) as { id: string; name: string; due_date: string; lead_id: string }[]) {
    const late = p.due_date < today;
    actions.push({ kind: "due", title: `Consegna: ${p.name}`, detail: late ? `in ritardo (era il ${new Date(p.due_date).toLocaleDateString("it-IT")})` : `entro il ${new Date(p.due_date).toLocaleDateString("it-IT")}`, href: `/crm/projects#${p.id}`, late });
  }
  for (const p of (renew.data ?? []) as { id: string; name: string; care_plan: string | null; care_renewal_date: string }[]) {
    actions.push({ kind: "renewal", title: `Rinnovo ${p.care_plan ?? "manutenzione"}: ${p.name}`, detail: `il ${new Date(p.care_renewal_date).toLocaleDateString("it-IT")}`, href: `/crm/projects#${p.id}` });
  }
  for (const l of (dormant.data ?? []) as { id: string; name: string; company: string | null; updated_at: string }[]) {
    const days = Math.floor((now.getTime() - new Date(l.updated_at).getTime()) / DAY);
    actions.push({ kind: "dormant", title: `Risenti ${who(l)}`, detail: `cliente, nessun contatto da ${days} giorni: manutenzione, SEO, restyling?`, href: `/crm/leads/${l.id}` });
  }

  const openQuotes = quoteRows;
  return {
    counters: {
      newToday: freshCount.count ?? 0,
      toContact: (newLeads.data ?? []).length,
      calls: callRows.length,
      followups: followRows.length,
      openQuotes: openQuotes.length,
      openQuotesValue: openQuotes.reduce((s, q) => s + Number(q.total), 0),
      chats: chatCount,
    },
    actions,
  };
}
