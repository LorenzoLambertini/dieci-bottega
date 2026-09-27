/**
 * Crittografia token + verifica firme webhook.
 * Tutto server-side (node:crypto). Mai importare da componenti client.
 */
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/* ─── AES-256-GCM per access/refresh token ─────────────────── */

function getKey(): Buffer {
  const raw = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY non configurata");
  const key = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY deve essere di 32 byte (hex o base64)");
  return key;
}

/** Formato: v1.<iv b64>.<tag b64>.<ciphertext b64> */
export function encryptToken(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(".");
}

export function decryptToken(payload: string): string {
  const [v, iv, tag, data] = payload.split(".");
  if (v !== "v1" || !iv || !tag || !data) throw new Error("Token cifrato non valido");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
}

/* ─── HMAC helpers ─────────────────────────────────────────── */

export function hmacHex(secret: string, data: string | Buffer): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Meta (Instagram/Facebook): header `X-Hub-Signature-256: sha256=<hex>`,
 * HMAC-SHA256 del body grezzo con l'App Secret.
 */
export function verifyMetaSignature(rawBody: string, header: string | null, appSecret: string | undefined): boolean {
  if (!header || !appSecret) return false;
  const expected = "sha256=" + hmacHex(appSecret, rawBody);
  return safeEqual(expected, header.trim());
}

/**
 * LinkedIn: header `X-LI-Signature` = hex(HMAC-SHA256("hmacsha256=" + body, clientSecret)).
 */
export function verifyLinkedInSignature(rawBody: string, header: string | null, clientSecret: string | undefined): boolean {
  if (!header || !clientSecret) return false;
  const expected = hmacHex(clientSecret, "hmacsha256=" + rawBody);
  return safeEqual(expected, header.trim().replace(/^hmacsha256=/, ""));
}

/** LinkedIn challenge: challengeResponse = hex(HMAC-SHA256(challengeCode, clientSecret)). */
export function linkedInChallengeResponse(challengeCode: string, clientSecret: string): string {
  return hmacHex(clientSecret, challengeCode);
}

/**
 * TikTok: header `TikTok-Signature: t=<ts>,s=<hex>`,
 * s = hex(HMAC-SHA256("<t>.<body>", clientSecret)). Rifiuta timestamp più vecchi di toleranceSec.
 */
export function verifyTikTokSignature(
  rawBody: string,
  header: string | null,
  clientSecret: string | undefined,
  nowSec = Math.floor(Date.now() / 1000),
  toleranceSec = 300
): boolean {
  if (!header || !clientSecret) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    })
  );
  const t = Number(parts.t);
  if (!parts.s || !Number.isFinite(t)) return false;
  if (Math.abs(nowSec - t) > toleranceSec) return false;
  return safeEqual(hmacHex(clientSecret, `${parts.t}.${rawBody}`), parts.s);
}

export function randomState(): string {
  return randomBytes(24).toString("base64url");
}
