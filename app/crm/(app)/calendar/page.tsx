import Link from "next/link";
import { createSocialClient } from "@/lib/social-ai/db";
import { calendarToken, googleCalendarLink, KIND_LABEL, loadEvents, type CalEvent } from "@/lib/crm/calendar";
import { CopyField } from "@/components/crm/CopyField";

export const dynamic = "force-dynamic";

const KIND_CLS: Record<string, string> = {
  call: "border-l-[#E63B2E]",
  followup: "border-l-yellow-400",
  due: "border-l-blue-400",
  renewal: "border-l-teal-400",
};

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
}

export default async function CalendarPage() {
  const db = await createSocialClient();
  const now = new Date();
  const from = new Date(now.getTime() - 14 * 86_400_000);
  const to = new Date(now.getTime() + 60 * 86_400_000);
  const events = await loadEvents(db, from.toISOString(), to.toISOString());
  const todayKey = dayKey(now.toISOString());
  const overdue = events.filter((e) => e.kind === "followup" && dayKey(e.start) < todayKey);
  const upcoming = events.filter((e) => dayKey(e.start) >= todayKey);
  const byDay = new Map<string, CalEvent[]>();
  for (const e of upcoming) byDay.set(dayKey(e.start), [...(byDay.get(dayKey(e.start)) ?? []), e]);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://diecibottega.it").replace(/\/$/, "");
  const feed = `${site}/api/crm/calendar?token=${calendarToken()}`;

  const Row = ({ e }: { e: CalEvent }) => (
    <div className={`flex items-center gap-3 bg-[#141414] border border-white/[0.06] border-l-4 ${KIND_CLS[e.kind]} rounded-lg px-4 py-3`}>
      <span className="text-white/45 text-xs w-12 shrink-0 tabular-nums">
        {e.allDay ? "—" : new Date(e.start).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" })}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-white/40 text-[10px] uppercase tracking-wider">{KIND_LABEL[e.kind]}</p>
        {e.leadId ? (
          <Link href={`/crm/leads/${e.leadId}`} className="text-white/85 text-sm hover:text-white truncate block">{e.title}</Link>
        ) : (
          <p className="text-white/85 text-sm truncate">{e.title}</p>
        )}
      </div>
      {e.kind === "call" && (
        <a href={googleCalendarLink(e, site)} target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/40 hover:text-white shrink-0">+ Google</a>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Calendario</h1>
        <p className="text-white/40 text-sm mt-0.5">Call fissate, promemoria, consegne e rinnovi dei prossimi 60 giorni.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {overdue.length > 0 && (
            <section>
              <h2 className="text-[#E63B2E] text-xs font-semibold uppercase tracking-wider mb-2">Promemoria scaduti ({overdue.length})</h2>
              <div className="space-y-2">{overdue.map((e) => <Row key={e.id} e={e} />)}</div>
            </section>
          )}
          {byDay.size === 0 && <p className="text-white/30 text-sm">Niente in programma. Fissa una call o un promemoria dalla scheda di un contatto.</p>}
          {[...byDay.entries()].map(([day, list]) => (
            <section key={day}>
              <h2 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${day === todayKey ? "text-white" : "text-white/40"}`}>
                {day === todayKey ? "Oggi · " : ""}
                {new Date(`${day}T12:00:00Z`).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
              </h2>
              <div className="space-y-2">{list.map((e) => <Row key={e.id} e={e} />)}</div>
            </section>
          ))}
        </div>

        <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 h-fit space-y-3">
          <h2 className="text-white font-semibold text-sm">📅 Nel tuo calendario</h2>
          <p className="text-white/45 text-sm leading-relaxed">Abbonati a questo indirizzo e call, promemoria e consegne compaiono da soli in Google Calendar o nel Calendario dell&apos;iPhone, sempre aggiornati.</p>
          <CopyField value={feed} />
          <div className="text-white/40 text-xs space-y-2 leading-relaxed">
            <p><span className="text-white/70">Google Calendar</span> (dal computer): Altri calendari → + → Da URL → incolla → Aggiungi.</p>
            <p><span className="text-white/70">iPhone</span>: Impostazioni → Calendario → Account → Aggiungi account → Altro → Aggiungi calendario sottoscritto → incolla.</p>
            <p className="text-white/25">L&apos;indirizzo è segreto: non condividerlo fuori dal team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
