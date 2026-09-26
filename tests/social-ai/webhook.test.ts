import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { setup } from "./harness";

// `after()` fuori da una richiesta Next: lo catturiamo ed eseguiamo a mano
const pending: (() => Promise<void>)[] = [];
vi.mock("next/server", async (orig) => {
  const mod = await orig<typeof import("next/server")>();
  return { ...mod, after: (fn: () => Promise<void>) => void pending.push(fn) };
});

const { metaReceive, metaVerify, linkedinVerify, tiktokReceive } = await import("@/lib/social-ai/webhooks");

const SECRET = "meta-app-secret";

function signed(body: unknown, secret = SECRET) {
  const raw = JSON.stringify(body);
  return new NextRequest("https://diecibottega.it/api/webhooks/instagram", {
    method: "POST",
    body: raw,
    headers: { "content-type": "application/json", "x-hub-signature-256": "sha256=" + createHmac("sha256", secret).update(raw).digest("hex") },
  });
}

const commentPayload = (id: string, text = "GUIDA") => ({
  object: "instagram",
  entry: [{ id: "17841400000000000", time: 1_790_000_000, changes: [{ field: "comments", value: { id, text, from: { id: "U1", username: "marco" }, media: { id: "M1" } } }] }],
});

beforeEach(() => {
  pending.length = 0;
  process.env.META_APP_SECRET = SECRET;
  process.env.META_VERIFY_TOKEN = "verify-me";
  process.env.LINKEDIN_CLIENT_SECRET = "li-secret";
  process.env.TIKTOK_CLIENT_SECRET = "tt-secret";
});

describe("Webhook Meta", () => {
  it("verifica challenge (hub.challenge)", async () => {
    const ok = metaVerify(new NextRequest("https://x/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=12345"));
    expect(ok.status).toBe(200);
    expect(await ok.text()).toBe("12345");
    const ko = metaVerify(new NextRequest("https://x/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345"));
    expect(ko.status).toBe(403);
  });

  it("firma non valida → 401, nessuna scrittura", async () => {
    const h = setup();
    const res = await metaReceive(signed(commentPayload("C1"), "wrong-secret"), () => h.deps);
    expect(res.status).toBe(401);
    expect(h.db.rows("social_webhook_events")).toHaveLength(0);
  });

  it("evento valido → 200 immediato, processing dopo la risposta, duplicato ignorato", async () => {
    const h = setup();
    const res = await metaReceive(signed(commentPayload("C1")), () => h.deps);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ received: 1, queued: 1 });
    expect(h.sent).toHaveLength(0); // non ancora processato
    for (const fn of pending.splice(0)) await fn();
    expect(h.sent.map((s) => s.op)).toEqual(["private_reply", "comment_reply"]);

    // Meta ritenta lo stesso evento
    const dup = await metaReceive(signed(commentPayload("C1")), () => h.deps);
    expect(await dup.json()).toMatchObject({ received: 1, queued: 0, duplicates: 1 });
    for (const fn of pending.splice(0)) await fn();
    expect(h.sent).toHaveLength(2);
  });

  it("errore di registrazione su DB → 500 (Meta ritenterà, nessuna perdita)", async () => {
    const res = await metaReceive(signed(commentPayload("C9")), () => {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY mancante");
    });
    expect(res.status).toBe(500);
  });
});

describe("Webhook LinkedIn / TikTok", () => {
  it("LinkedIn challengeCode → challengeResponse HMAC", async () => {
    const res = linkedinVerify(new NextRequest("https://x/api/webhooks/linkedin?challengeCode=abc"));
    expect(await res.json()).toEqual({ challengeCode: "abc", challengeResponse: createHmac("sha256", "li-secret").update("abc").digest("hex") });
  });

  it("TikTok lead: firma, import nel CRM, idempotenza", async () => {
    const h = setup();
    const body = JSON.stringify({ leads: [{ lead_id: "L1", field_data: [{ name: "email", value: "anna@bar.it" }, { name: "name", value: "Anna" }] }] });
    const req = () => {
      const t = Math.floor(Date.now() / 1000);
      return new NextRequest("https://x/api/webhooks/tiktok", {
        method: "POST",
        body,
        headers: { "tiktok-signature": `t=${t},s=${createHmac("sha256", "tt-secret").update(`${t}.${body}`).digest("hex")}` },
      });
    };
    const r1 = await tiktokReceive(req(), () => h.deps);
    expect(await r1.json()).toMatchObject({ results: ["created"] });
    const r2 = await tiktokReceive(req(), () => h.deps);
    expect(await r2.json()).toMatchObject({ results: ["duplicate"] });
    expect(h.db.rows("leads", { email: "anna@bar.it" })).toHaveLength(1);

    const bad = new NextRequest("https://x/api/webhooks/tiktok", { method: "POST", body, headers: { "tiktok-signature": "t=1,s=00" } });
    expect((await tiktokReceive(bad, () => h.deps)).status).toBe(401);
  });
});
