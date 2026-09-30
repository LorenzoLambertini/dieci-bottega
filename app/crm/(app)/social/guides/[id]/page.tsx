import Link from "next/link";
import { notFound } from "next/navigation";
import { createSocialClient } from "@/lib/social-ai/db";
import { Card, fmtDate, PageHeader, Pill, PlatformBadge, SocialTabs } from "@/components/crm/social/ui";
import { computeFunnel, magnetSupport, pct, type DeliveryRow } from "@/lib/social-ai/lead-magnet";
import { PROVIDERS } from "@/lib/social-ai/providers";

export const dynamic = "force-dynamic";

const PLATFORM_LABEL: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", tiktok: "TikTok", web: "Chat sito" };
const SUPPORT: Record<string, { label: string; tone: "green" | "yellow" | "gray" }> = {
  yes: { label: "Supportato", tone: "green" },
  approval: { label: "Richiede approvazione", tone: "yellow" },
  no: { label: "Non disponibile via API", tone: "gray" },
};

type Row = DeliveryRow & { post_id: string | null; trigger_text: string | null; lead: { id: string; name: string } | null };

export default async function LeadMagnetStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSocialClient();
  const { data: guide } = await supabase.from("guides").select("*").eq("id", id).maybeSingle();
  if (!guide) notFound();
  const g = guide as { id: string; name: string; slug: string; description: string | null; trigger_keywords: string[]; file_url: string | null; active: boolean; follow_up_enabled: boolean; follow_up_hours: number; attach_file: boolean };

  const { data } = await supabase
    .from("guide_deliveries")
    .select("id, guide_id, contact_id, conversation_id, platform, channel, status, keyword, trigger_kind, trigger_text, post_id, opened_at, open_count, downloaded_at, download_count, attachment_sent, sent_at, follow_up_status, lead:leads(id, name)")
    .eq("guide_id", id)
    .order("sent_at", { ascending: false })
    .limit(1000);
  const rows = (data ?? []) as unknown as Row[];
  const f = computeFunnel(rows);
  const support = magnetSupport(PROVIDERS);
  const leadsHref = (q: string) => `/crm/leads?magnet=${g.id}${q ? `&ms=${q}` : ""}`;

  const steps = [
    { label: "Richieste", value: f.requests, sub: "keyword o richiesta all'AI", href: leadsHref("") },
    { label: "Inviati", value: f.sent, sub: `${pct(f.sent, f.requests)}% delle richieste${f.attachments ? ` · ${f.attachments} con PDF allegato` : ""}`, href: leadsHref("sent") },
    { label: "Link aperti", value: f.opened, sub: `${pct(f.opened, f.sent)}% degli invii`, href: leadsHref("opened") },
    { label: "Download verificati", value: g.file_url ? f.downloaded : null, sub: g.file_url ? `${pct(f.downloaded, f.opened)}% di chi ha aperto` : "Guida senza PDF", href: leadsHref("downloaded") },
  ];

  return (
    <div>
      <PageHeader
        title={`🎁 ${g.name}`}
        subtitle={`Keyword: ${g.trigger_keywords.map((k) => k.toUpperCase()).join(", ") || "—"} · ${g.active ? "attivo" : "disattivato"}${g.follow_up_enabled ? ` · follow-up dopo ${g.follow_up_hours}h` : " · follow-up spento"}`}
        action={<Link href="/crm/social/guides" className="text-white/40 hover:text-white text-sm">← Guide</Link>}
      />
      <SocialTabs active="/crm/social/guides" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {steps.map((s, i) => (
          <Link key={s.label} href={s.href} className="relative bg-[#141414] border border-white/[0.06] hover:border-white/[0.14] rounded-xl px-4 py-3 transition-colors">
            <p className="text-white/35 text-[11px] uppercase tracking-wider">{s.label}</p>
            <p className="text-white text-2xl font-bold mt-0.5">{s.value ?? "N.D."}</p>
            <p className="text-white/35 text-[11px] mt-0.5">{s.sub}</p>
            {i < 3 && <span className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-white/20 z-10">→</span>}
          </Link>
        ))}
      </div>
      <p className="text-white/30 text-[11px] mb-5">
        &quot;Link aperto&quot; conta solo le persone (le anteprime automatiche di Instagram/Facebook sono escluse). &quot;Download verificato&quot; = la persona ha premuto Scarica e il file le è stato servito.
        Il PDF inviato come allegato nel DM non è tracciabile: per quello il download resta N.D.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
        <Card title="Richieste">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-[11px] uppercase tracking-wider text-left">
                  <th className="px-4 py-2 font-medium">Contatto</th>
                  <th className="px-2 py-2 font-medium">Da</th>
                  <th className="px-2 py-2 font-medium">Quando</th>
                  <th className="px-2 py-2 font-medium">Inviato</th>
                  <th className="px-2 py-2 font-medium">Aperto</th>
                  <th className="px-2 py-2 font-medium">Scaricato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-white/25">Nessuna richiesta ancora. Prova scrivendo &quot;{g.trigger_keywords[0]?.toUpperCase() ?? "…"}&quot; in DM o in un commento.</td></tr>}
                {rows.slice(0, 100).map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-4 py-2.5">
                      {r.lead ? <Link href={`/crm/leads/${r.lead.id}`} className="text-white/85 hover:text-white">{r.lead.name}</Link> : <span className="text-white/40">—</span>}
                      {r.trigger_text && <p className="text-white/30 text-[11px] truncate max-w-[240px]" title={r.trigger_text}>«{r.trigger_text}»</p>}
                    </td>
                    <td className="px-2 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5"><PlatformBadge platform={r.platform} /><span className="text-white/45 text-xs">{r.trigger_kind === "comment" ? "commento" : r.trigger_kind === "ai" ? "AI" : "DM"}</span></span>
                    </td>
                    <td className="px-2 py-2.5 text-white/45 text-xs whitespace-nowrap">{fmtDate(r.sent_at)}</td>
                    <td className="px-2 py-2.5">{r.status === "sent" ? <Pill tone="green">Sì{r.attachment_sent ? " + PDF" : ""}</Pill> : <Pill tone="red">No</Pill>}</td>
                    <td className="px-2 py-2.5 text-xs whitespace-nowrap">{r.opened_at ? <span className="text-green-400">Sì · {fmtDate(r.opened_at)}</span> : <span className="text-white/30">No</span>}</td>
                    <td className="px-2 py-2.5 text-xs whitespace-nowrap">{!g.file_url ? <span className="text-white/25">N.D.</span> : r.downloaded_at ? <span className="text-green-400">Sì · {fmtDate(r.downloaded_at)}</span> : <span className="text-white/30">No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Per piattaforma">
            <div className="divide-y divide-white/[0.04]">
              {support.map((s) => {
                const p = f.byPlatform[s.platform];
                return (
                  <div key={s.platform} className="px-5 py-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <PlatformBadge platform={s.platform} />
                      <span className="text-white/80 text-sm font-medium flex-1">{PLATFORM_LABEL[s.platform]}</span>
                      <Link href={`/crm/leads?magnet=${g.id}&source=${s.platform}`} className="text-white/35 hover:text-white text-[11px]">
                        {p ? `${p.requests} rich. · ${p.opened} aperti` : "0 richieste"} →
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <span className="text-white/35">DM</span><Pill tone={SUPPORT[s.dm].tone}>{SUPPORT[s.dm].label}</Pill>
                      <span className="text-white/35 ml-1">Commenti</span><Pill tone={SUPPORT[s.comment].tone}>{SUPPORT[s.comment].label}</Pill>
                      {s.attachment && <Pill tone="green">PDF allegato</Pill>}
                    </div>
                    <p className="text-white/35 text-[11px] leading-relaxed">{s.note}</p>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card title="Come funziona">
            <ol className="px-5 py-4 space-y-1.5 text-white/55 text-xs list-decimal list-inside">
              <li>Commento o DM con la keyword (maiuscole/minuscole indifferenti, anche dentro una frase)</li>
              <li>Contatto trovato o creato nel CRM (nessun doppione)</li>
              <li>Invio del link univoco{g.attach_file ? " + PDF allegato nei DM" : ""}</li>
              <li>Apertura del link e download registrati nella timeline</li>
              <li>{g.follow_up_enabled ? `Follow-up dopo ${g.follow_up_hours}h` : "Follow-up predisposto (spento: attivalo da Modifica)"}</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
