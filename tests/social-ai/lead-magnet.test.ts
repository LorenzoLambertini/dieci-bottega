import { describe, expect, it } from "vitest";
import { igEvent, setup } from "./harness";
import { processInbound } from "@/lib/social-ai/engine";
import { matchGuideKeyword } from "@/lib/social-ai/rules";
import { buildMagnetMessage, computeFunnel, isBotUserAgent, magnetSupport, recordDownload, recordOpen, runLeadMagnetFollowUps } from "@/lib/social-ai/lead-magnet";
import { PROVIDERS } from "@/lib/social-ai/providers";
import type { GuideRow } from "@/lib/social-ai/types";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0";

function magnetSetup(extra: Record<string, unknown> = {}) {
  const h = setup();
  const magnet = h.db.seed("guides", {
    name: "10 errori che ti fanno perdere clienti online",
    slug: "10-errori",
    url: "https://diecibottega.it/lead-magnets/10-errori-clienti-online.pdf",
    file_url: "/lead-magnets/10-errori-clienti-online.pdf",
    active: true,
    trigger_keywords: ["errori"],
    platforms: ["instagram", "facebook", "linkedin", "tiktok"],
    match_mode: "contains",
    attach_file: true,
    message_template: 'Ciao{nome}! 🎁 Ecco la tua guida gratuita "{guida}":\n{link}',
    follow_up_enabled: false,
    follow_up_hours: 24,
    ...extra,
  });
  return { ...h, magnet };
}

const guide = (o: Partial<GuideRow>): GuideRow => ({ id: "g", name: "G", slug: "g", description: null, url: "https://x", active: true, trigger_keywords: [], platforms: [], ...o });

describe("Keyword ERRORI", () => {
  const magnet = guide({ id: "m", trigger_keywords: ["errori"], match_mode: "contains" });
  const classic = guide({ id: "c", trigger_keywords: ["guida"], match_mode: "short" });
  it.each(["errori", "ERRORI", "Errori", "Ciao, vorrei gli errori", "Mi mandate ERRORI?", "Mi interessano gli errori", "Dove posso trovare ERRORI?"])("«%s» attiva il lead magnet", (t) => {
    expect(matchGuideKeyword(t, [classic, magnet], "instagram")).toMatchObject({ guide: { id: "m" }, keyword: "errori" });
  });
  it("non si attiva su parole diverse o su piattaforme escluse", () => {
    expect(matchGuideKeyword("ho fatto un errore", [magnet], "instagram")).toBeNull();
    expect(matchGuideKeyword("terrori notturni", [magnet], "instagram")).toBeNull();
    expect(matchGuideKeyword("errori", [{ ...magnet, platforms: ["facebook"] }], "instagram")).toBeNull();
  });
  it("le guide classiche restano solo per messaggi brevi", () => {
    expect(matchGuideKeyword("GUIDA", [classic], "instagram")?.guide.id).toBe("c");
    expect(matchGuideKeyword("mi serve una guida per capire quanto costa un sito", [classic], "instagram")).toBeNull();
  });
});

describe("Workflow lead magnet end-to-end", () => {
  it("DM: contatto, link univoco + PDF allegato, timeline, poi apertura e download tracciati", async () => {
    const h = magnetSetup();
    const out = await processInbound(h.deps, igEvent("message", "Ciao, vorrei gli errori"));
    expect(out.status).toBe("rule");
    expect(h.llm.calls).toHaveLength(0); // nessuna chiamata AI

    // 1 contatto creato (nessun doppione) con tag
    expect(h.db.rows("leads")).toHaveLength(1);
    expect(h.db.rows("tags").map((t) => t.name)).toContain("guida:10-errori");

    // DM con link univoco, poi PDF allegato con URL pubblico assoluto
    expect(h.sent.map((s) => s.op)).toEqual(["dm", "file"]);
    const link = h.sent[0].text.match(/https:\/\/diecibottega\.it\/g\/([a-f0-9]{32})/);
    expect(link).toBeTruthy();
    expect(h.sent[0].text).toContain("Ciao Marco!");
    expect(h.sent[1].text).toBe("https://diecibottega.it/lead-magnets/10-errori-clienti-online.pdf");

    const [d] = h.db.rows("guide_deliveries");
    expect(d).toMatchObject({ status: "sent", keyword: "errori", trigger_kind: "dm", platform: "instagram", attachment_sent: true, token: link![1] });
    const subjects = () => h.db.rows("activities").map((a) => a.subject as string);
    expect(subjects()).toContain('🟠 Keyword "ERRORI" rilevata su Instagram');
    expect(subjects().some((s) => s.startsWith("📩 Lead magnet inviato"))).toBe(true);

    // anteprima automatica di Instagram: NON è un'apertura
    const bot = await recordOpen(h.deps.db, link![1], "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)");
    expect(bot?.counted).toBe(false);
    expect(h.db.rows("guide_deliveries")[0].opened_at).toBeFalsy();

    // persona: link aperto (una sola voce in timeline anche se riapre)
    await recordOpen(h.deps.db, link![1], IPHONE);
    await recordOpen(h.deps.db, link![1], IPHONE);
    expect(h.db.rows("guide_deliveries")[0]).toMatchObject({ open_count: 2 });
    expect(h.db.rows("guide_deliveries")[0].opened_at).toBeTruthy();
    expect(subjects().filter((s) => s.startsWith("🔗 Link aperto"))).toHaveLength(1);
    expect(h.db.rows("guide_deliveries")[0].downloaded_at).toBeFalsy(); // aperto ≠ scaricato

    // download: registrato solo quando la persona richiede il file
    const dl = await recordDownload(h.deps.db, link![1], IPHONE);
    expect(dl).toMatchObject({ counted: true, file: "https://diecibottega.it/lead-magnets/10-errori-clienti-online.pdf" });
    expect(h.db.rows("guide_deliveries")[0].downloaded_at).toBeTruthy();
    expect(subjects().filter((s) => s.startsWith("📄 PDF scaricato"))).toHaveLength(1);

    // funnel
    const f = computeFunnel(h.db.rows("guide_deliveries") as never);
    expect(f).toMatchObject({ requests: 1, sent: 1, attachments: 1, opened: 1, downloaded: 1 });
  });

  it("commento: risposta privata con il link (niente allegato) + risposta pubblica, provenienza salvata", async () => {
    const h = magnetSetup();
    const ev = { ...igEvent("comment", "Mi interessano gli errori"), postId: "POST_42" };
    await processInbound(h.deps, ev);
    expect(h.sent.map((s) => s.op)).toEqual(["private_reply", "comment_reply"]);
    expect(h.sent[0].target).toBe(ev.externalId);
    expect(h.sent[0].text).toMatch(/\/g\/[a-f0-9]{32}/);
    expect(h.db.rows("guide_deliveries")[0]).toMatchObject({ channel: "private_reply", trigger_kind: "comment", post_id: "POST_42", comment_id: ev.externalId, attachment_sent: false });
  });

  it("stesso utente due volte: un solo contatto, due richieste", async () => {
    const h = magnetSetup();
    await processInbound(h.deps, igEvent("message", "ERRORI"));
    await processInbound(h.deps, igEvent("comment", "errori"));
    expect(h.db.rows("leads")).toHaveLength(1);
    expect(h.db.rows("guide_deliveries")).toHaveLength(2);
  });

  it("link sconosciuto o malformato: nessun effetto", async () => {
    const h = magnetSetup();
    expect(await recordOpen(h.deps.db, "nope", IPHONE)).toBeNull();
    expect(await recordOpen(h.deps.db, "a".repeat(32), IPHONE)).toBeNull();
  });
});

describe("Follow-up (predisposto)", () => {
  it("spento di default: nessun follow-up programmato", async () => {
    const h = magnetSetup();
    await processInbound(h.deps, igEvent("message", "errori"));
    expect(h.db.rows("guide_deliveries")[0].follow_up_status).toBeNull();
  });

  it("attivo: entro 24h invia il DM, oltre crea un promemoria senza violare la finestra", async () => {
    const h = magnetSetup({ follow_up_enabled: true, follow_up_hours: 20, follow_up_message: "Ciao{nome}, hai visto la guida?" });
    await processInbound(h.deps, igEvent("message", "errori", "IGSID_A"));
    expect(h.db.rows("guide_deliveries")[0].follow_up_status).toBe("scheduled");
    h.advance(21 * 3600_000); // finestra ancora aperta (21h < 24h)
    const r1 = await runLeadMagnetFollowUps(h.deps);
    expect(r1.sent).toBe(1);
    expect(h.sent.at(-1)).toMatchObject({ op: "dm", text: "Ciao Marco, hai visto la guida?" });

    const h2 = magnetSetup({ follow_up_enabled: true, follow_up_hours: 48 });
    await processInbound(h2.deps, igEvent("message", "errori", "IGSID_B"));
    const before = h2.sent.length;
    h2.advance(49 * 3600_000); // finestra chiusa
    const r2 = await runLeadMagnetFollowUps(h2.deps);
    expect(r2.manual).toBe(1);
    expect(h2.sent.length).toBe(before); // nessun messaggio fuori regola
    expect(h2.db.rows("leads")[0].next_action_at).toBeTruthy();
    expect(h2.db.rows("activities").some((a) => String(a.subject).startsWith("⏰ Follow-up da fare a mano"))).toBe(true);
  });
});

describe("Supporto piattaforme e utilità", () => {
  it("dichiara solo ciò che le API consentono", () => {
    const s = Object.fromEntries(magnetSupport(PROVIDERS).map((x) => [x.platform, x]));
    expect(s.instagram).toMatchObject({ dm: "yes", comment: "yes", attachment: true });
    expect(s.facebook).toMatchObject({ dm: "yes", comment: "yes", attachment: true });
    expect(s.linkedin.dm).toBe("no");
    expect(s.tiktok.dm).toBe("no");
    expect(s.linkedin.attachment || s.tiktok.attachment).toBe(false);
  });
  it("messaggio sempre con il link, nome solo se reale", () => {
    expect(buildMagnetMessage({ name: "G", message_template: "Ciao{nome}! {guida}" }, "Anna", "L")).toBe("Ciao Anna! G\nL");
    expect(buildMagnetMessage({ name: "G", message_template: null }, null, "L")).toContain("Ciao! 🎁");
  });
  it("riconosce le anteprime dei social ma non i browser in-app", () => {
    expect(isBotUserAgent("facebookexternalhit/1.1")).toBe(true);
    expect(isBotUserAgent("meta-externalagent/1.1")).toBe(true);
    expect(isBotUserAgent("WhatsApp/2.23")).toBe(true);
    expect(isBotUserAgent(null)).toBe(true);
    expect(isBotUserAgent(IPHONE)).toBe(false);
    expect(isBotUserAgent("Mozilla/5.0 (Linux; Android 14) [FBAN/FB4A;FBAV/450.0]")).toBe(false);
  });
});
