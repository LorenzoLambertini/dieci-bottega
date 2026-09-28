/**
 * Calendario CRM: call fissate, promemoria, consegne progetti, rinnovi manutenzione.
 * Esportabile come feed .ics a cui abbonarsi da Google Calendar o dall'iPhone.
 */
import { createHmac } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CalKind = "call" | "followup" | "due" | "renewal";

export interface CalEvent {
  id: string;
  kind: CalKind;
  title: string;
  start: string; // ISO
  allDay: boolean;
  leadId: string | null;
  note?: string | null;
}

export const KIND_LABEL: Record<CalKind, string> = { call: "📞 Call", followup: "⏰ Promemoria", due: "🚀 Consegna", renewal: "🔁 Rinnovo" };

export function calendarToken(): string {
  const secret = process.env.CALENDAR_SECRET || process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createHmac("sha256", secret).update("crm-calendar-v1").digest("hex").slice(0, 32);
}

export async function loadEvents(db: SupabaseClient, fromIso: string, toIso: string): Promise<CalEvent[]> {
  const fromDay = fromIso.slice(0, 10);
  const toDay = toIso.slice(0, 10);
  const [calls, follows, due, renew] = await Promise.all([
    db.from("leads").select("id, name, company, metadata").gte("metadata->>scheduled_slot", fromIso).lte("metadata->>scheduled_slot", toIso),
    db.from("leads").select("id, name, company, next_action_at, next_action_note").gte("next_action_at", fromIso).lte("next_action_at", toIso),
    db.from("projects").select("id, name, due_date, lead_id, phase").gte("due_date", fromDay).lte("due_date", toDay).not("phase", "in", "(online,manutenzione,chiuso)"),
    db.from("projects").select("id, name, care_plan, care_renewal_date, lead_id").gte("care_renewal_date", fromDay).lte("care_renewal_date", toDay),
  ]);
  const who = (l: { name: string; company: string | null }) => (l.company ? `${l.name} · ${l.company}` : l.name);
  const ev: CalEvent[] = [];
  for (const l of (calls.data ?? []) as { id: string; name: string; company: string | null; metadata: { scheduled_slot?: string } | null }[]) {
    if (l.metadata?.scheduled_slot) ev.push({ id: `call-${l.id}`, kind: "call", title: `Call con ${who(l)}`, start: l.metadata.scheduled_slot, allDay: false, leadId: l.id });
  }
  for (const l of (follows.data ?? []) as { id: string; name: string; company: string | null; next_action_at: string; next_action_note: string | null }[]) {
    ev.push({ id: `fu-${l.id}`, kind: "followup", title: `${l.next_action_note ?? "Ricontattare"} · ${who(l)}`, start: l.next_action_at, allDay: false, leadId: l.id, note: l.next_action_note });
  }
  for (const p of (due.data ?? []) as { id: string; name: string; due_date: string; lead_id: string }[]) {
    ev.push({ id: `due-${p.id}`, kind: "due", title: `Consegna: ${p.name}`, start: `${p.due_date}T08:00:00.000Z`, allDay: true, leadId: p.lead_id });
  }
  for (const p of (renew.data ?? []) as { id: string; name: string; care_plan: string | null; care_renewal_date: string; lead_id: string }[]) {
    ev.push({ id: `ren-${p.id}`, kind: "renewal", title: `Rinnovo ${p.care_plan ?? "manutenzione"}: ${p.name}`, start: `${p.care_renewal_date}T08:00:00.000Z`, allDay: true, leadId: p.lead_id });
  }
  return ev.sort((a, b) => a.start.localeCompare(b.start));
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
function icsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function toIcs(events: CalEvent[], site: string): string {
  const now = icsDate(new Date().toISOString());
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dieci Bottega//CRM//IT", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Dieci Bottega CRM", "X-WR-TIMEZONE:Europe/Rome"];
  for (const e of events) {
    const url = e.leadId ? `${site}/crm/leads/${e.leadId}` : `${site}/crm/calendar`;
    lines.push("BEGIN:VEVENT", `UID:${e.id}-${e.start.slice(0, 10)}@diecibottega.it`, `DTSTAMP:${now}`);
    if (e.allDay) {
      const d = e.start.slice(0, 10).replace(/-/g, "");
      const next = new Date(`${e.start.slice(0, 10)}T12:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      lines.push(`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, "")}`);
    } else {
      const end = new Date(new Date(e.start).getTime() + (e.kind === "call" ? 30 : 15) * 60_000).toISOString();
      lines.push(`DTSTART:${icsDate(e.start)}`, `DTEND:${icsDate(end)}`);
      if (e.kind === "call") lines.push("BEGIN:VALARM", "TRIGGER:-PT15M", "ACTION:DISPLAY", "DESCRIPTION:Call tra 15 minuti", "END:VALARM");
    }
    lines.push(`SUMMARY:${icsEscape(`${KIND_LABEL[e.kind].split(" ")[0]} ${e.title}`)}`, `URL:${url}`, `DESCRIPTION:${icsEscape(`${e.note ? `${e.note}\n` : ""}${url}`)}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  // righe max 75 ottetti (RFC 5545): si spezzano con CRLF + spazio
  return lines.map((l) => (l.length > 74 ? l.match(/.{1,73}/g)!.join("\r\n ") : l)).join("\r\n") + "\r\n";
}

export function googleCalendarLink(e: CalEvent, site: string): string {
  const start = icsDate(e.start);
  const end = icsDate(new Date(new Date(e.start).getTime() + 30 * 60_000).toISOString());
  const u = new URL("https://calendar.google.com/calendar/render");
  u.searchParams.set("action", "TEMPLATE");
  u.searchParams.set("text", e.title);
  u.searchParams.set("dates", `${start}/${end}`);
  if (e.leadId) u.searchParams.set("details", `${site}/crm/leads/${e.leadId}`);
  return u.toString();
}
