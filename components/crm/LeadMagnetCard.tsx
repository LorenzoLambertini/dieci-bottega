/** Scheda contatto: lead magnet richiesti e cosa è successo dopo l'invio. */
import Link from "next/link";

export interface LeadMagnetRow {
  id: string;
  platform: string;
  keyword: string | null;
  trigger_kind: string | null;
  post_id: string | null;
  status: string;
  channel: string;
  attachment_sent: boolean;
  sent_at: string;
  opened_at: string | null;
  last_opened_at: string | null;
  open_count: number;
  downloaded_at: string | null;
  follow_up_status: string | null;
  guide: { id: string; name: string; file_url: string | null } | null;
}

const PLATFORM: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", tiktok: "TikTok" };
const fmt = (d: string) =>
  new Date(d).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });

function YesNo({ yes, na, when }: { yes: boolean; na?: boolean; when?: string | null }) {
  if (na) return <span className="text-white/30">N.D.</span>;
  return yes ? <span className="text-green-400 font-semibold">SÌ{when ? <span className="text-white/35 font-normal"> · {fmt(when)}</span> : null}</span> : <span className="text-white/45">NO</span>;
}

export function LeadMagnetCard({ rows }: { rows: LeadMagnetRow[] }) {
  if (!rows.length) return null;
  // una scheda per lead magnet (la richiesta più recente), con il conteggio delle richieste
  const byGuide = new Map<string, { last: LeadMagnetRow; count: number }>();
  for (const r of rows) {
    const k = r.guide?.id ?? r.id;
    const cur = byGuide.get(k);
    if (!cur) byGuide.set(k, { last: r, count: 1 });
    else cur.count++;
  }
  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider">🎁 Lead magnet</h3>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {[...byGuide.values()].map(({ last: r, count }) => {
          const opened = rows.filter((x) => x.guide?.id === r.guide?.id).find((x) => x.opened_at);
          const downloaded = rows.filter((x) => x.guide?.id === r.guide?.id).find((x) => x.downloaded_at);
          const lastTouch = [r.sent_at, opened?.last_opened_at, downloaded?.downloaded_at].filter(Boolean).sort().at(-1)!;
          return (
            <div key={r.id} className="px-5 py-4 space-y-2">
              {r.guide ? (
                <Link href={`/crm/social/guides/${r.guide.id}`} className="text-white/85 text-sm font-semibold hover:text-white">{r.guide.name}</Link>
              ) : (
                <p className="text-white/85 text-sm font-semibold">Guida eliminata</p>
              )}
              <dl className="grid grid-cols-[120px_1fr] gap-y-1 text-xs">
                <dt className="text-white/35">Ha richiesto</dt><dd><YesNo yes /> {count > 1 && <span className="text-white/35">({count} volte)</span>}</dd>
                <dt className="text-white/35">Keyword</dt><dd className="text-white/70">{r.keyword ? r.keyword.toUpperCase() : r.trigger_kind === "ai" ? "(richiesta all'AI)" : "—"}</dd>
                <dt className="text-white/35">Data richiesta</dt><dd className="text-white/70">{fmt(r.sent_at)}</dd>
                <dt className="text-white/35">Piattaforma</dt><dd className="text-white/70">{PLATFORM[r.platform] ?? r.platform} · {r.trigger_kind === "comment" ? "commento" : r.trigger_kind === "ai" ? "conversazione" : "DM"}</dd>
                {r.post_id && (<><dt className="text-white/35">Post</dt><dd className="text-white/50 truncate" title={r.post_id}>{r.post_id}</dd></>)}
                <dt className="text-white/35">PDF allegato</dt><dd>{r.guide?.file_url ? <YesNo yes={r.attachment_sent} /> : <span className="text-white/30">N.D.</span>}</dd>
                <dt className="text-white/35">Link inviato</dt><dd><YesNo yes={r.status === "sent"} />{r.status !== "sent" && <span className="text-[#E63B2E]"> · invio fallito</span>}</dd>
                <dt className="text-white/35">Link aperto</dt><dd><YesNo yes={!!opened} when={opened?.opened_at} /></dd>
                <dt className="text-white/35">Download verificato</dt><dd><YesNo yes={!!downloaded} na={!r.guide?.file_url} when={downloaded?.downloaded_at} /></dd>
                <dt className="text-white/35">Ultima interazione</dt><dd className="text-white/70">{fmt(lastTouch)}</dd>
                {r.follow_up_status && (<><dt className="text-white/35">Follow-up</dt><dd className="text-white/70">{{ scheduled: "programmato", sent: "inviato", manual: "da fare a mano", skipped: "saltato" }[r.follow_up_status] ?? r.follow_up_status}</dd></>)}
              </dl>
              {r.attachment_sent && !downloaded && (
                <p className="text-white/25 text-[11px]">Il PDF allegato nel DM non è tracciabile: il download è verificabile solo dal link.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
