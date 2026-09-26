import { describe, expect, it } from "vitest";
import { decision, igEvent, setup, toolUse } from "./harness";
import { processInbound, processRecordedEvent, recordWebhookEvent, retryDueEvents, MAX_EVENT_ATTEMPTS } from "@/lib/social-ai/engine";
import { MAX_SEND_RETRIES, retryMessage, sendDirectMessage } from "@/lib/social-ai/outbound";
import type { ConversationRow } from "@/lib/social-ai/types";

const T0 = "2026-09-26T12:32:00.000Z";

describe("Scenario completo: commento 'GUIDA' → DM → 'Quanto costa un sito?'", () => {
  it("gestisce tutto il flusso come un unico sistema", async () => {
    const h = setup();

    // 1. commento "GUIDA" → regola deterministica, NESSUNA chiamata Claude
    const out1 = await processInbound(h.deps, igEvent("comment", "GUIDA", "IGSID_MARCO", T0));
    expect(out1.status).toBe("rule");
    expect(h.llm.calls).toHaveLength(0);

    // contatto CRM creato nella tabella esistente `leads`, con profilo Meta
    const leads = h.db.rows("leads");
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({ name: "Marco Rossi", source: "instagram", email: null });

    // private reply con link + risposta pubblica al commento, token decifrato server-side
    expect(h.sent.map((s) => s.op)).toEqual(["private_reply", "comment_reply"]);
    expect(h.sent[0].text).toContain("https://diecibottega.it/guide/checklist-sito");
    expect(h.sent[0].token).toBe("PAGE_TOKEN");

    // guide_delivery, tag, lead score, audit log
    expect(h.db.rows("guide_deliveries")).toHaveLength(1);
    expect(h.db.rows("guide_deliveries")[0]).toMatchObject({ status: "sent", channel: "private_reply" });
    expect(h.db.rows("tags").map((t) => t.name)).toContain("guida:checklist-sito");
    const conv = h.db.rows("social_conversations")[0] as unknown as ConversationRow;
    expect(conv.lead_score).toBe(5);
    expect(conv.signals).toEqual(["guide_download"]);
    expect(h.db.rows("ai_actions").some((a) => a.action_type === "send_guide" && a.actor === "rule" && a.status === "success")).toBe(true);

    // 2. l'utente risponde in DM: Claude legge storico + CRM + knowledge
    h.llm.push(decision({ intent: "pricing", interest: "sito web", signals: ["price_request", "specific_service"], confidence: 0.85, response: "Dipende da cosa ti serve: il pacchetto BASIC parte da 800€. Che tipo di attività hai?" }));
    const out2 = await processInbound(h.deps, igEvent("message", "Quanto costa un sito?", "IGSID_MARCO", T0));
    expect(out2.status).toBe("ai");
    expect(h.llm.calls).toHaveLength(1);

    const call = h.llm.calls[0];
    const ctx = String(call.messages[0].content);
    expect(ctx).toContain("Quanto costa un sito?");
    expect(ctx).toContain("GUIDA"); // storico (commento precedente)
    expect(ctx).toContain("Checklist sito web PMI"); // guide ricevute dal CRM
    const system = call.system as { text: string; cache_control?: unknown }[];
    expect(system[1].text).toContain("BASIC 800"); // knowledge base (fallback)
    expect(system[1].cache_control).toEqual({ type: "ephemeral" }); // prompt caching
    expect(call.tools?.map((t) => (t as { name: string }).name)).toContain("send_guide");

    // risposta inviata in DM, stessa conversazione
    expect(h.sent.at(-1)).toMatchObject({ op: "dm", target: "IGSID_MARCO" });
    expect(h.db.rows("social_conversations")).toHaveLength(1);
    const conv2 = h.db.rows("social_conversations")[0] as unknown as ConversationRow;
    expect(conv2.lead_score).toBe(30); // 5 + 15 + 10
    expect(conv2.temperature).toBe("warm");
    expect(h.db.rows("leads")[0]).toMatchObject({ score: 30, temperature: "warm" });
    expect(h.db.rows("ai_runs")).toHaveLength(1);
    expect(h.db.rows("ai_runs")[0]).toMatchObject({ input_tokens: 1000, cache_read_tokens: 800 });
  });
});

describe("Casi conversazionali", () => {
  it("'Mi mandate la guida?' → invio guida deterministico in DM", async () => {
    const h = setup();
    const out = await processInbound(h.deps, igEvent("message", "Mi mandate la guida?"));
    expect(out.status).toBe("rule");
    expect(h.llm.calls).toHaveLength(0);
    expect(h.sent).toHaveLength(1);
    expect(h.sent[0]).toMatchObject({ op: "dm" });
    expect(h.sent[0].text).toContain("checklist-sito");
  });

  it("'Vorrei parlare con qualcuno.' → human handoff completo", async () => {
    const h = setup();
    h.llm.push(decision({ intent: "consultation", needs_human: true, handoff_reason: "Richiesta esplicita di una persona", response: "Certo!" }));
    const out = await processInbound(h.deps, igEvent("message", "Vorrei parlare con qualcuno."));
    expect(out.status).toBe("handoff");
    const conv = h.db.rows("social_conversations")[0];
    expect(conv).toMatchObject({ ai_enabled: false, human_takeover: true, status: "needs_human", handoff_reason: "Richiesta esplicita di una persona" });
    expect(h.db.rows("notifications")).toHaveLength(1);
    expect(h.emails[0].subject).toContain("Richiede intervento umano");
    expect(h.db.rows("activities").some((a) => a.subject === "Richiede intervento umano")).toBe(true);
    // messaggio di cortesia configurato (non testo AI)
    expect(h.sent.at(-1)!.text).toContain("Ti passo a Lorenzo o Tommaso");

    // i messaggi successivi NON vengono gestiti dall'AI
    const next = await processInbound(h.deps, igEvent("message", "Ci siete?"));
    expect(next).toMatchObject({ status: "skipped", reason: "human_takeover" });
    expect(h.llm.calls).toHaveLength(1);
  });

  it("'Sono arrabbiato' → reclamo: handoff anche se l'AI non lo chiede", async () => {
    const h = setup();
    h.llm.push(decision({ intent: "complaint", needs_human: false, confidence: 0.9, response: "Mi dispiace" }));
    const out = await processInbound(h.deps, igEvent("message", "Sono arrabbiato, il sito non funziona!"));
    expect(out.status).toBe("handoff");
    expect(h.db.rows("social_conversations")[0].status).toBe("needs_human");
  });

  it("'Potete farmi un preventivo?' → opportunità, lead qualificato, notifica lead caldo", async () => {
    const h = setup();
    h.llm.push(
      () => ({ content: [toolUse("create_lead", { title: "Sito vetrina ristorante", notes: "Chiede preventivo" }), toolUse("update_lead_score", { signals: ["call_request", "purchase_intent"] })] }),
      decision({ intent: "consultation", signals: ["quote_request", "price_request"], needs_human: false, confidence: 0.8, response: "Volentieri: che tipo di attività hai?" })
    );
    const out = await processInbound(h.deps, igEvent("message", "Potete farmi un preventivo? Vorrei una call"));
    expect(out.status).toBe("ai");
    expect(h.llm.calls).toHaveLength(2);
    // tool_result tutti in un unico messaggio user
    const second = h.llm.calls[1].messages;
    const results = second.at(-1)!.content as { type: string }[];
    expect(results.filter((r) => r.type === "tool_result")).toHaveLength(2);

    expect(h.db.rows("opportunities")).toHaveLength(1);
    const conv = h.db.rows("social_conversations")[0] as unknown as ConversationRow;
    expect(conv.lead_score).toBe(80); // 25 + 15 + 20 + 20
    expect(conv.temperature).toBe("hot");
    expect(h.db.rows("leads")[0].status).toBe("qualified");
    expect(h.db.rows("notifications").some((n) => String(n.title).includes("Lead caldo"))).toBe(true);
  });

  it("'Non mi interessa.' → risposta cortese, score non negativo, nessun handoff", async () => {
    const h = setup();
    h.llm.push(decision({ intent: "other", signals: ["not_interested"], confidence: 0.9, response: "Nessun problema, grazie!" }));
    const out = await processInbound(h.deps, igEvent("message", "Non mi interessa."));
    expect(out.status).toBe("ai");
    const conv = h.db.rows("social_conversations")[0];
    expect(conv.lead_score).toBe(0);
    expect(conv.ai_enabled).toBe(true);
    expect(h.sent.at(-1)!.text).toBe("Nessun problema, grazie!");
  });

  it("'Avete esempi di ecommerce?' con confidenza bassa → handoff, nessuna risposta inventata", async () => {
    const h = setup();
    h.llm.push(decision({ intent: "case_study", signals: ["case_study_interest"], confidence: 0.35, response: "Sì, abbiamo fatto tanti ecommerce!" }));
    const out = await processInbound(h.deps, igEvent("message", "Avete esempi di ecommerce?"));
    expect(out.status).toBe("handoff");
    expect(h.sent.every((s) => !s.text.includes("tanti ecommerce"))).toBe(true);
    expect(h.db.rows("social_conversations")[0].handoff_reason).toContain("Confidenza bassa");
  });

  it("spam → nessuna risposta", async () => {
    const h = setup();
    h.llm.push(decision({ intent: "spam", signals: ["spam"], response: "..." }));
    await processInbound(h.deps, igEvent("message", "Guadagna 5000€ al giorno clicca qui"));
    expect(h.sent).toHaveLength(0);
  });
});

describe("Tool calling", () => {
  it("esegue i tool dal backend, valida input, logga ogni chiamata", async () => {
    const h = setup();
    h.llm.push(
      () => ({
        content: [
          toolUse("update_contact", { email: "Marco@Rossi.it", company: "Trattoria da Marco", phone: "+39 333 1234567" }),
          toolUse("add_tag", { tag: "" }), // input non valido
          toolUse("delete_database", {}), // tool inesistente
          toolUse("add_tag", { tag: "ristorazione" }),
        ],
      }),
      decision({ intent: "website", signals: ["real_company"], response: "Perfetto, grazie!" })
    );
    await processInbound(h.deps, igEvent("message", "Sono Marco della Trattoria da Marco, mail marco@rossi.it"));

    expect(h.db.rows("leads")[0]).toMatchObject({ email: "marco@rossi.it", company: "Trattoria da Marco", phone: "+39 333 1234567" });
    expect(h.db.rows("tags").map((t) => t.name)).toContain("ristorazione");

    const results = h.llm.calls[1].messages.at(-1)!.content as { type: string; is_error?: boolean; content: string }[];
    expect(results.map((r) => !!r.is_error)).toEqual([false, true, true, false]);
    expect(results[2].content).toContain("Tool sconosciuto");

    const logs = h.db.rows("ai_actions").map((a) => `${a.action_type}:${a.status}`);
    expect(logs).toContain("update_contact:success");
    expect(logs).toContain("add_tag:error");
    expect(logs).toContain("add_tag:success");
    expect(logs).toContain("ai_decision:success");
  });

  it("non unisce il contatto a un altro lead con la stessa email (anti-impersonificazione)", async () => {
    const h = setup();
    h.db.seed("leads", { name: "Cliente vero", email: "vip@azienda.it", score: 90 });
    h.llm.push(() => ({ content: [toolUse("update_contact", { email: "vip@azienda.it" })] }), decision({ response: "Ok" }));
    await processInbound(h.deps, igEvent("message", "la mia email è vip@azienda.it"));
    const social = h.db.rows("leads").find((l) => l.source === "instagram")!;
    expect(social.email).toBeNull();
    expect(h.db.rows("activities").some((a) => a.subject === "Possibile duplicato da verificare")).toBe(true);
  });

  it("limita il numero di chiamate per tool e le iterazioni", async () => {
    const h = setup();
    for (let i = 0; i < 5; i++) h.llm.push(() => ({ content: [toolUse("create_note", { subject: `n${i}` })] }));
    const out = await processInbound(h.deps, igEvent("message", "test loop"));
    expect(h.llm.calls).toHaveLength(5); // MAX_ITERATIONS
    expect(h.db.rows("activities").filter((a) => a.type === "note")).toHaveLength(2); // maxCalls create_note
    expect(out.status).toBe("handoff"); // nessuna decisione → umano
  });
});

describe("Idempotenza e duplicati", () => {
  it("lo stesso evento webhook non viene processato due volte", async () => {
    const h = setup();
    const ev = igEvent("message", "GUIDA");
    const id1 = await recordWebhookEvent(h.deps.db, ev);
    const id2 = await recordWebhookEvent(h.deps.db, ev);
    expect(id1).toBeTruthy();
    expect(id2).toBeNull();
    await processRecordedEvent(h.deps, id1!);
    expect(await processRecordedEvent(h.deps, id1!)).toBeNull(); // già processed
    expect(h.sent).toHaveLength(1);
    expect(h.db.rows("social_webhook_events")[0].status).toBe("processed");
  });

  it("dedup anche a livello di messaggio", async () => {
    const h = setup();
    const ev = igEvent("message", "GUIDA");
    await processInbound(h.deps, ev);
    expect(await processInbound(h.deps, { ...ev, eventKey: "altro" })).toEqual({ status: "duplicate" });
  });
});

describe("Errori, retry e limiti di piattaforma", () => {
  it("API social fallita: il messaggio è salvato come 'failed' e si può ritentare", async () => {
    let failing = true;
    const h = setup({ fail: () => (failing ? { ok: false, retryable: true, error: "Meta 500: temporaneo" } : null) });
    h.llm.push(decision({ intent: "pricing", response: "Ciao, ecco le info" }));
    await processInbound(h.deps, igEvent("message", "Info prezzi?"));
    const out = h.db.rows("social_messages", { direction: "outbound" })[0];
    expect(out).toMatchObject({ delivery_status: "failed", error: "Meta 500: temporaneo", content: "Ciao, ecco le info" });
    expect(h.db.rows("ai_actions").find((a) => a.action_type === "ai_decision")!.status).toBe("error");

    failing = false;
    const r = await retryMessage(h.deps, out.id as string);
    expect(r.ok).toBe(true);
    expect(h.db.rows("social_messages", { id: out.id })[0]).toMatchObject({ delivery_status: "sent", retry_count: 1 });
  });

  it("i retry sono limitati (niente loop infiniti)", async () => {
    const h = setup({ fail: () => ({ ok: false, retryable: true, error: "down" }) });
    h.llm.push(decision({ response: "x" }));
    await processInbound(h.deps, igEvent("message", "ciao, info?"));
    const id = h.db.rows("social_messages", { direction: "outbound" })[0].id as string;
    for (let i = 0; i < MAX_SEND_RETRIES; i++) await retryMessage(h.deps, id);
    expect(await retryMessage(h.deps, id)).toEqual({ ok: false, error: "Numero massimo di tentativi raggiunto" });
  });

  it("evento fallito → backoff → retry → processato; dopo N tentativi 'dead'", async () => {
    const h = setup();
    const ev = igEvent("message", "GUIDA");
    const id = (await recordWebhookEvent(h.deps.db, ev))!;
    h.db.failNextInsert.set("social_messages", "db temporaneamente non disponibile");
    await processRecordedEvent(h.deps, id);
    let row = h.db.rows("social_webhook_events")[0];
    expect(row).toMatchObject({ status: "failed", attempts: 1 });
    expect(row.last_error).toContain("db temporaneamente");

    expect(await retryDueEvents(h.deps)).toBe(0); // backoff non scaduto
    h.advance(2 * 60_000);
    expect(await retryDueEvents(h.deps)).toBe(1);
    row = h.db.rows("social_webhook_events")[0];
    expect(row.status).toBe("processed");
    expect(h.sent).toHaveLength(1);

    // evento che fallisce sempre
    const ev2 = igEvent("message", "GUIDA", "IGSID_OTHER");
    const id2 = (await recordWebhookEvent(h.deps.db, ev2))!;
    for (let i = 0; i < MAX_EVENT_ATTEMPTS; i++) {
      h.db.failNextInsert.set("social_messages", "boom");
      await processRecordedEvent(h.deps, id2);
      h.advance(60 * 60_000);
    }
    expect(h.db.rows("social_webhook_events", { id: id2 })[0]).toMatchObject({ status: "dead", attempts: MAX_EVENT_ATTEMPTS });
  });

  it("errore di Claude → handoff umano, errore registrato in ai_runs", async () => {
    const h = setup();
    h.llm.push(new Error("overloaded"));
    const out = await processInbound(h.deps, igEvent("message", "Quanto costa un ecommerce?"));
    expect(out.status).toBe("handoff");
    expect(h.db.rows("ai_runs")[0].error).toContain("overloaded");
  });

  it("DM fuori dalla finestra di 24h: nessun invio (nessun workaround)", async () => {
    const h = setup();
    const conv = h.db.seed("social_conversations", { platform: "instagram", external_conversation_id: "X", account_id: h.account.id, last_inbound_at: "2026-09-20T10:00:00Z" });
    const r = await sendDirectMessage(h.deps, conv as unknown as ConversationRow, "X", "ciao");
    expect(r.ok).toBe(false);
    expect(r.error).toContain("24h");
    expect(h.sent).toHaveLength(0);
  });
});

describe("Cost control", () => {
  it("AI disattivata: nessuna chiamata Claude", async () => {
    const h = setup({ aiEnabled: false });
    const out = await processInbound(h.deps, igEvent("message", "Quanto costa?"));
    expect(out).toMatchObject({ status: "skipped", reason: "ai_disabled" });
    expect(h.llm.calls).toHaveLength(0);
  });

  it("commenti solo emoji/complimenti: nessuna chiamata Claude", async () => {
    const h = setup();
    const out = await processInbound(h.deps, igEvent("comment", "🔥🔥🔥 bellissimo"));
    expect(out).toMatchObject({ status: "skipped", reason: "low_value" });
    expect(h.llm.calls).toHaveLength(0);
  });

  it("limite di chiamate AI per conversazione/ora → handoff", async () => {
    const h = setup({ settings: { max_ai_calls_per_hour: 2 } });
    h.llm.push(decision({ response: "a" }), decision({ response: "b" }));
    await processInbound(h.deps, igEvent("message", "uno?"));
    await processInbound(h.deps, igEvent("message", "due?"));
    const out = await processInbound(h.deps, igEvent("message", "tre?"));
    expect(out).toMatchObject({ status: "handoff", reason: "rate_limit" });
    expect(h.llm.calls).toHaveLength(2);
  });

  it("storico limitato a history_limit messaggi", async () => {
    const h = setup({ settings: { history_limit: 3, summarize_after: 100 } });
    for (let i = 0; i < 6; i++) {
      h.llm.push(decision({ response: `r${i}` }));
      h.advance(1000);
      await processInbound(h.deps, igEvent("message", `domanda numero ${i}?`, "IGSID_MARCO", new Date(Date.parse(T0) + i * 1000).toISOString()));
    }
    const ctx = String(h.llm.calls.at(-1)!.messages[0].content);
    const lines = ctx.split("<storico>")[1].split("</storico>")[0].trim().split("\n");
    expect(lines).toHaveLength(3);
  });

  it("regola 'ai_qualification' passa a Claude con indicazione", async () => {
    const h = setup();
    h.db.seed("social_automation_rules", { name: "Prezzo", trigger_type: "dm_keyword", trigger_value: "prezzo", action_type: "ai_qualification", configuration: { hint: "Chiedi il tipo di attività" } });
    h.llm.push(decision({ intent: "pricing", response: "Che attività hai?" }));
    await processInbound(h.deps, igEvent("message", "prezzo"));
    expect(String(h.llm.calls[0].messages[0].content)).toContain("Chiedi il tipo di attività");
  });
});
