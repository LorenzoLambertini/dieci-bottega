import { describe, expect, it } from "vitest";
import { IG_ACCOUNT, setup } from "./harness";
import { processSyncedEvents, syncMetaAccounts, type SyncDeps } from "@/lib/social-ai/sync";
import { processRecordedEvent, recordWebhookEvent } from "@/lib/social-ai/engine";
import { parseMetaWebhook } from "@/lib/social-ai/providers/meta";
import type { graphRequest } from "@/lib/social-ai/providers/meta";

type Call = { path: string; token: string; query?: Record<string, string> };

function fakeGraph(responses: Record<string, unknown>, calls: Call[]): typeof graphRequest {
  return (async (path: string, token: string, init: { query?: Record<string, string> } = {}) => {
    calls.push({ path, token, query: init.query });
    const key = `${path}${init.query?.platform ? `?${init.query.platform}` : ""}`;
    const r = responses[key];
    if (r instanceof Error) return { ok: false, error: r.message, retryable: false, status: 400 };
    return { ok: true, data: r ?? { data: [] } };
  }) as typeof graphRequest;
}

// Orario dei test: 2026-09-26T12:32:00Z
const RECENT = "2026-09-26T12:20:00+0000";
const OLD = "2026-09-22T09:00:00+0000";

const IG_MEDIA = {
  data: [
    {
      id: "MEDIA_1",
      comments: {
        data: [
          {
            id: "C1",
            text: "GUIDA",
            timestamp: RECENT,
            username: "marco.rossi",
            from: { id: "IGUSER_MARCO", username: "marco.rossi" },
            replies: { data: [{ id: "C1R", text: "Grazie!", timestamp: RECENT, from: { id: IG_ACCOUNT, username: "diecibottega" } }] },
          },
          { id: "C_OLD", text: "Quanto costa un sito?", timestamp: OLD, from: { id: "IGUSER_LUCA", username: "luca" } },
        ],
      },
    },
  ],
};
const IG_DMS = {
  data: [
    {
      id: "CONV1",
      updated_time: RECENT,
      messages: {
        data: [
          { id: "MID_2", message: "Ci sono?", created_time: RECENT, from: { id: "IGSID_ANNA", username: "anna" } },
          { id: "MID_OUT", message: "Ciao Anna!", created_time: RECENT, from: { id: IG_ACCOUNT, username: "diecibottega" } },
        ],
      },
    },
  ],
};

function syncSetup(responses: Record<string, unknown>) {
  const h = setup();
  const calls: Call[] = [];
  const deps: SyncDeps = { ...h.deps, graph: fakeGraph(responses, calls) };
  return { ...h, calls, deps };
}

describe("Sincronizzazione via Graph API (senza webhook)", () => {
  it("legge commenti e DM, salta i propri, importa senza rispondere quelli vecchi", async () => {
    const h = syncSetup({ [`${IG_ACCOUNT}/media`]: IG_MEDIA, "PAGE1/conversations?instagram": IG_DMS });
    const r = await syncMetaAccounts(h.deps);

    // token decifrato server-side, endpoint giusti
    expect(h.calls.map((c) => c.path)).toEqual([`${IG_ACCOUNT}/media`, "PAGE1/conversations"]);
    expect(h.calls.every((c) => c.token === "PAGE_TOKEN")).toBe(true);
    expect(h.calls[1].query?.platform).toBe("instagram");

    // C1 + C_OLD + MID_2; la risposta dell'account e il messaggio in uscita sono esclusi
    expect(r.accounts[0]).toMatchObject({ found: 3, queued: 3, errors: [] });
    const events = h.db.rows("social_webhook_events");
    expect(events.map((e) => e.event_key)).toEqual(["instagram:comment:C_OLD", "instagram:comment:C1", "instagram:message:MID_2"]);

    h.llm.push(() => ({ content: [] })); // eventuale chiamata AI per il DM
    const { processed } = await processSyncedEvents(h.deps, r.eventIds);
    expect(processed).toBe(3);

    // il commento vecchio è solo importato: nessuna risposta pubblica o privata
    const comments = h.db.rows("social_comments").filter((c) => c.direction === "inbound");
    expect(comments.map((c) => c.external_comment_id).sort()).toEqual(["C1", "C_OLD"]);
    expect(h.sent.filter((s) => s.target === "C_OLD")).toHaveLength(0);
    // "GUIDA" recente → regola guida come con i webhook
    expect(h.sent.some((s) => s.op === "private_reply" && s.target === "C1")).toBe(true);
    // DM salvato nella conversazione giusta
    expect(h.db.rows("social_messages").some((m) => m.external_message_id === "MID_2" && m.direction === "inbound")).toBe(true);

    // last_sync_at aggiornato → la sync successiva non ricrea doppioni
    expect(h.db.rows("social_accounts")[0].last_sync_at).toBeTruthy();
    const again = await syncMetaAccounts(h.deps);
    expect(again.eventIds).toHaveLength(0);
  });

  it("webhook e sync usano la stessa chiave: nessun doppione", async () => {
    const h = syncSetup({ "PAGE1/conversations?instagram": IG_DMS });
    const [ev] = parseMetaWebhook({
      object: "instagram",
      entry: [{ id: IG_ACCOUNT, messaging: [{ sender: { id: "IGSID_ANNA" }, recipient: { id: IG_ACCOUNT }, timestamp: Date.parse("2026-09-26T12:20:00Z"), message: { mid: "MID_2", text: "Ci sono?" } }] }],
    });
    const id = await recordWebhookEvent(h.deps.db, ev);
    expect(id).toBeTruthy();
    const r = await syncMetaAccounts(h.deps);
    expect(r.accounts[0].found).toBe(1);
    expect(r.eventIds).toHaveLength(0);
  });

  it("mostra l'errore esatto di Meta per ogni lettura", async () => {
    const h = syncSetup({
      [`${IG_ACCOUNT}/media`]: IG_MEDIA,
      "PAGE1/conversations?instagram": new Error("Meta 403 #3: Application does not have the capability to make this API call."),
    });
    const r = await syncMetaAccounts(h.deps);
    expect(r.accounts[0].errors).toEqual(["DM Instagram → Meta 403 #3: Application does not have the capability to make this API call."]);
    expect(r.accounts[0].queued).toBe(2); // i commenti arrivano comunque
  });

  it("non rilegge se sincronizzato da poco (auto-sync)", async () => {
    const h = syncSetup({});
    await syncMetaAccounts(h.deps);
    const calls = h.calls.length;
    const r = await syncMetaAccounts(h.deps, { minIntervalMs: 120_000 });
    expect(r.skipped).toBe("Sincronizzato da poco");
    expect(h.calls.length).toBe(calls);
    h.advance(3 * 60_000);
    const r2 = await syncMetaAccounts(h.deps, { minIntervalMs: 120_000 });
    expect(r2.skipped).toBeUndefined();
  });

  it("un evento vecchio non sposta indietro la conversazione", async () => {
    const h = syncSetup({ [`${IG_ACCOUNT}/media`]: { data: [{ id: "M", comments: { data: [
      { id: "N1", text: "nuovo", timestamp: RECENT, from: { id: "U1", username: "u1" } },
      { id: "O1", text: "vecchio", timestamp: OLD, from: { id: "U1", username: "u1" } },
    ] } }] } });
    const r = await syncMetaAccounts(h.deps);
    // processati in ordine inverso apposta
    for (const id of [...r.eventIds].reverse()) await processRecordedEvent(h.deps, id);
    const conv = h.db.rows("social_conversations")[0];
    expect(conv.last_message_preview).toBe("💬 nuovo");
  });
});

describe("Educare l'AI con le valutazioni", () => {
  it("lezioni ed esempi approvati finiscono nel prompt (blocco in cache)", async () => {
    const { buildLearning } = await import("@/lib/social-ai/prompt");
    const text = buildLearning([
      { rating: 2, customer_text: "Quanto costa un sito?", ai_reply: "800€", better_reply: "Dipende! Che attività hai?", lesson: "Non dare prezzi nel primo messaggio" },
      { rating: 5, customer_text: "Fate e-commerce?", ai_reply: "Sì, con Shopify.", better_reply: null, lesson: null },
      { rating: 1, customer_text: "Ciao", ai_reply: "Buongiorno gentile cliente", better_reply: null, lesson: null },
    ]);
    expect(text).toContain("- Non dare prezzi nel primo messaggio");
    expect(text).toContain("Cliente: Quanto costa un sito?\nRisposta: Dipende! Che attività hai?");
    expect(text).toContain("Risposta: Sì, con Shopify.");
    expect(text).toContain("Buongiorno gentile cliente"); // tra quelle da evitare
    expect(buildLearning([])).toBe("");
  });

  it("il motore passa le lezioni a Claude", async () => {
    const { processInbound } = await import("@/lib/social-ai/engine");
    const { decision, igEvent } = await import("./harness");
    const h = syncSetup({});
    h.db.seed("ai_reply_feedback", { rating: 2, customer_text: "x", ai_reply: "y", better_reply: null, lesson: "Chiedi sempre il nome dell'attività", use_for_training: true, updated_at: "2026-09-26T00:00:00Z" });
    h.db.seed("ai_reply_feedback", { rating: 2, customer_text: "x", ai_reply: "y", better_reply: null, lesson: "Lezione sospesa", use_for_training: false, updated_at: "2026-09-26T00:00:00Z" });
    h.llm.push(decision({ response: "Ciao! Che attività hai?" }));
    await processInbound(h.deps, igEvent("message", "Info sui siti"));
    const system = h.llm.calls[0].system as { text: string }[];
    expect(system[1].text).toContain("Chiedi sempre il nome dell'attività");
    expect(system[1].text).not.toContain("Lezione sospesa");
  });
});

describe("Notifiche dei nuovi messaggi", () => {
  it("ogni DM nuovo crea una notifica con link alla chat; gli import vecchi no", async () => {
    const { processInbound } = await import("@/lib/social-ai/engine");
    const { decision, igEvent } = await import("./harness");
    const h = syncSetup({});
    h.llm.push(decision({ response: "Ciao!" }));
    await processInbound(h.deps, igEvent("message", "Ciao, info?"));
    const n = h.db.rows("notifications").filter((x) => x.type === "social_message");
    expect(n).toHaveLength(1);
    expect(n[0].title).toContain("DM da @marco.rossi");
    expect(n[0].link).toMatch(/^\/crm\/social\/inbox\?c=/);
    await processInbound(h.deps, { ...igEvent("message", "vecchio"), importOnly: true });
    expect(h.db.rows("notifications").filter((x) => x.type === "social_message")).toHaveLength(1);
  });
});
