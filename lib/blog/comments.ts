/** Commenti del blog: lettura pubblica (solo approvati) e validazione anti-spam. */
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface PublicComment {
  id: string;
  parent_id: string | null;
  author_name: string;
  body: string;
  is_team: boolean;
  created_at: string;
}

export async function approvedComments(db: SupabaseClient, slug: string): Promise<PublicComment[]> {
  const { data } = await db
    .from("blog_comments")
    .select("id, parent_id, author_name, body, is_team, created_at")
    .eq("post_slug", slug)
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .limit(300);
  return (data ?? []) as PublicComment[];
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(`${process.env.CRON_SECRET ?? "db"}:${ip}`).digest("hex").slice(0, 32);
}

export interface CommentInput {
  name: string;
  email: string | null;
  body: string;
}

/** Valida il commento. Ritorna un errore leggibile o i dati puliti. */
export function validateComment(raw: { name?: unknown; email?: unknown; body?: unknown; website?: unknown; startedAt?: unknown; consent?: unknown }, now = Date.now()):
  | { ok: true; data: CommentInput }
  | { ok: false; error: string; spam?: boolean } {
  // honeypot: il campo "website" è nascosto, solo i bot lo compilano
  if (typeof raw.website === "string" && raw.website.trim()) return { ok: false, error: "Commento non valido", spam: true };
  // troppo veloce per essere scritto da una persona
  const started = Number(raw.startedAt);
  if (!Number.isFinite(started) || now - started < 3000) return { ok: false, error: "Commento non valido", spam: true };
  if (raw.consent !== true) return { ok: false, error: "Serve il consenso al trattamento dei dati per pubblicare" };
  const name = String(raw.name ?? "").replace(/\s+/g, " ").trim();
  const body = String(raw.body ?? "").replace(/\r/g, "").trim();
  const email = String(raw.email ?? "").trim().toLowerCase();
  if (name.length < 2 || name.length > 60) return { ok: false, error: "Scrivi un nome tra 2 e 60 caratteri" };
  if (body.length < 3 || body.length > 2000) return { ok: false, error: "Il commento deve avere tra 3 e 2000 caratteri" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Email non valida" };
  if ((body.match(/https?:\/\//g) ?? []).length > 2) return { ok: false, error: "Troppi link nel commento", spam: true };
  return { ok: true, data: { name, email: email || null, body } };
}
