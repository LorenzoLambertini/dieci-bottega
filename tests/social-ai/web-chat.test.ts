import { describe, expect, it } from "vitest";
import { decision, setup } from "./harness";
import { getWebChat, handleWebMessage, linkWebVisitor } from "@/lib/social-ai/web-chat";
import { sendDirectMessage } from "@/lib/social-ai/outbound";
import type { ConversationRow } from "@/lib/social-ai/types";
import { webProvider } from "@/lib/social-ai/providers/web";

const VISITOR = "b2c4e6f8-1234-4abc-9def-0123456789ab";

function webSetup() {
  const h = setup();
  h.deps.providers.web = webProvider; // provider reale: nessun allegato possibile nel widget
  // nessun account "web" da collegare: la chat del sito funziona comunque
  h.db.seed("guides", {
    name: "10 errori che ti fanno perdere clienti online", slug: "10-errori", url: "https://diecibottega.it/x.pdf",
    file_url: "/lead-magnets/10-errori-clienti-online.pdf", active: true, trigger_keywords: ["errori"],
    platforms: ["instagram", "facebook", "linkedin", "tiktok", "web"], match_mode: "contains", attach_file: true,
  });
  return h;
}

describe("Chat del sito collegata al Social AI", () => {
  it("il messaggio del widget passa dal motore AI e la risposta torna al widget", async () => {
    const h = webSetup();
    h.llm.push(decision({ intent: "pricing", response: "Ciao! Che attività hai? [SUGGEST_PACKAGE:PRO]" }));
    const r = await handleWebMessage(h.deps, VISITOR, "Quanto costa un sito?");

    expect(r.messages.map((m) => m.content)).toEqual(["Ciao! Che attività hai? [SUGGEST_PACKAGE:PRO]"]);
    expect(r.waiting).toBe(false);
    // istruzioni specifiche per il widget (tag pacchetti/form) passate a Claude
    expect(JSON.stringify(h.llm.calls[0].messages)).toContain("CHAT DEL SITO");

    // conversazione nell'Inbox come "web", contatto nel CRM, notifica al team
    const conv = h.db.rows("social_conversations")[0];
    expect(conv.platform).toBe("web");
    expect(h.db.rows("leads")[0]).toMatchObject({ name: "Visitatore sito #b2c4", source: "web" });
    expect(h.db.rows("notifications").some((n) => String(n.title).startsWith("🌐 Chat sito"))).toBe(true);
  });

  it("scrivendo ERRORI in chat arriva la guida con il link tracciato (niente allegato)", async () => {
    const h = webSetup();
    const r = await handleWebMessage(h.deps, VISITOR, "mi mandate gli errori?");
    expect(h.llm.calls).toHaveLength(0);
    expect(r.messages[0].content).toMatch(/https:\/\/diecibottega\.it\/g\/[a-f0-9]{32}/);
    expect(h.db.rows("guide_deliveries")[0]).toMatchObject({ platform: "web", status: "sent", attachment_sent: false });
  });

  it("cronologia e risposte del team scritte dal CRM", async () => {
    const h = webSetup();
    h.llm.push(decision({ response: "Ciao!" }));
    await handleWebMessage(h.deps, VISITOR, "Ciao");
    const conv = h.db.rows("social_conversations")[0] as unknown as ConversationRow;
    h.advance(60_000);
    const human = await sendDirectMessage(h.deps, { ...conv, human_takeover: true }, VISITOR, "Sono Lorenzo, ti scrivo io", { sentBy: "user-1" });
    expect(human.ok).toBe(true);

    const all = await getWebChat(h.deps.db, VISITOR);
    expect(all.messages.map((m) => [m.role, m.content, !!m.human])).toEqual([
      ["user", "Ciao", false],
      ["assistant", "Ciao!", false],
      ["assistant", "Sono Lorenzo, ti scrivo io", true],
    ]);
    const after = await getWebChat(h.deps.db, VISITOR, all.messages[1].at);
    expect(after.messages.map((m) => m.content)).toEqual(["Sono Lorenzo, ti scrivo io"]);
  });

  it("il form della chat completa lo stesso contatto (nessun doppione)", async () => {
    const h = webSetup();
    h.llm.push(decision({ response: "Ok!" }));
    await handleWebMessage(h.deps, VISITOR, "Info");
    const id = await linkWebVisitor(h.deps.db, VISITOR, { name: "Anna Bianchi", email: "Anna@Example.it", phone: "333" });
    expect(h.db.rows("leads")).toHaveLength(1);
    expect(h.db.rows("leads")[0]).toMatchObject({ id, name: "Anna Bianchi", email: "anna@example.it", phone: "333" });
  });

  it("se l'email è già nel CRM la chat passa a quel contatto", async () => {
    const h = webSetup();
    const known = h.db.seed("leads", { name: "Marco Cliente", email: "marco@example.it", status: "won", score: 50 });
    h.llm.push(decision({ response: "Ok!" }));
    await handleWebMessage(h.deps, VISITOR, "Info");
    const id = await linkWebVisitor(h.deps.db, VISITOR, { name: "Marco", email: "marco@example.it" });
    expect(id).toBe(known.id);
    expect(h.db.rows("leads").map((l) => l.id)).toEqual([known.id]);
    expect(h.db.rows("social_conversations")[0].contact_id).toBe(known.id);
  });

  it("visitatore che non ha mai scritto: nessun collegamento", async () => {
    const h = webSetup();
    expect(await linkWebVisitor(h.deps.db, VISITOR, { name: "X", email: "x@y.it" })).toBeNull();
    expect((await getWebChat(h.deps.db, VISITOR)).messages).toEqual([]);
  });
});
