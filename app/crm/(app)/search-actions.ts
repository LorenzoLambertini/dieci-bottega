"use server";

/** Ricerca globale del CRM e ricerca "a parole" tradotta in filtri dall'AI. */
import type Anthropic from "@anthropic-ai/sdk";
import { requireCrmUser } from "@/lib/social-ai/auth";
import { createSocialClient } from "@/lib/social-ai/db";
import { anthropicConfigured, defaultLlm, supportsEffort } from "@/lib/social-ai/claude";
import { loadSettings, resolveModel } from "@/lib/social-ai/settings";
import { rateLimit } from "@/lib/social-ai/rate-limit";
import { cleanSearch } from "@/lib/crm/lead-filters";

export interface SearchHit {
  type: "lead" | "quote" | "project" | "tag";
  title: string;
  sub?: string;
  href: string;
}

export async function globalSearch(raw: string): Promise<SearchHit[]> {
  await requireCrmUser();
  const q = cleanSearch(raw);
  if (q.length < 2) return [];
  const db = await createSocialClient();
  const like = `%${q}%`;
  const [leads, quotes, projects, tags] = await Promise.all([
    db.from("leads").select("id, name, company, email, phone, status").or(`name.ilike.${like},email.ilike.${like},company.ilike.${like},phone.ilike.${like},notes.ilike.${like}`).order("updated_at", { ascending: false }).limit(8),
    db.from("quotes").select("id, number, title, lead_id, total").or(`number.ilike.${like},title.ilike.${like}`).limit(4),
    db.from("projects").select("id, name, phase").ilike("name", like).limit(4),
    db.from("tags").select("id, name").ilike("name", like).limit(4),
  ]);
  const hits: SearchHit[] = [];
  for (const l of (leads.data ?? []) as { id: string; name: string; company: string | null; email: string | null; phone: string | null }[])
    hits.push({ type: "lead", title: l.name, sub: [l.company, l.email ?? l.phone].filter(Boolean).join(" · "), href: `/crm/leads/${l.id}` });
  for (const x of (quotes.data ?? []) as { id: string; number: string; title: string; lead_id: string; total: number }[])
    hits.push({ type: "quote", title: `Preventivo ${x.number}`, sub: x.title, href: `/crm/leads/${x.lead_id}` });
  for (const p of (projects.data ?? []) as { id: string; name: string; phase: string }[])
    hits.push({ type: "project", title: p.name, sub: `Progetto · ${p.phase}`, href: `/crm/projects#${p.id}` });
  for (const t of (tags.data ?? []) as { id: string; name: string }[])
    hits.push({ type: "tag", title: `#${t.name}`, sub: "Contatti con questo tag", href: `/crm/leads?tag=${t.id}` });
  return hits;
}

const ALLOWED: Record<string, RegExp> = {
  q: /^.{1,60}$/,
  status: /^(new|contacted|qualified|proposal|won|lost)$/,
  follow: /^(due|planned|none)$/,
  view: /^(hot|idle|clients)$/,
  channel: /^social$/,
  tag: /^[0-9a-f-]{36}$/,
};

/** Traduce una domanda ("lead instagram caldi senza risposta") nei filtri della lista contatti. */
export async function aiSearch(question: string): Promise<{ ok: boolean; href?: string; explain?: string; error?: string }> {
  const user = await requireCrmUser();
  if (!anthropicConfigured()) return { ok: false, error: "AI non configurata" };
  if (!rateLimit(`crm-ai-search:${user.id}`, 60, 3600_000)) return { ok: false, error: "Troppe richieste, riprova più tardi" };
  const db = await createSocialClient();
  const [{ data: tags }, settings] = await Promise.all([db.from("tags").select("id, name"), loadSettings(db)]);
  const model = resolveModel(settings);
  const tagList = ((tags ?? []) as { id: string; name: string }[]).map((t) => `${t.name}=${t.id}`).join(", ") || "nessuno";
  const res = await defaultLlm().createMessage({
    model,
    max_tokens: 400,
    system:
      "Traduci la richiesta in filtri per la lista contatti di un CRM. Rispondi SOLO con JSON con queste chiavi opzionali: " +
      'q (testo da cercare in nome/email/azienda/telefono/note), status (new|contacted|qualified|proposal|won|lost), follow (due=da richiamare oggi|planned=con promemoria|none=senza prossima azione), view (hot=caldi|idle=fermi da 30 giorni|clients=clienti), channel ("social" per Instagram/Facebook/LinkedIn/TikTok), tag (id di un tag), explain (frase breve in italiano che descrive il filtro). ' +
      `Tag disponibili (nome=id): ${tagList}. Se la richiesta nomina un canale social specifico e non esiste un tag con quel nome, usa channel=social.`,
    messages: [{ role: "user", content: `<richiesta>${question.slice(0, 300)}</richiesta>` }],
    ...(supportsEffort(model) ? { output_config: { effort: "low" as const } } : {}),
  });
  const text = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("");
  try {
    const j = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "") as Record<string, string>;
    const params = new URLSearchParams();
    for (const [k, re] of Object.entries(ALLOWED)) if (typeof j[k] === "string" && re.test(j[k])) params.set(k, j[k]);
    return { ok: true, href: `/crm/leads${params.size ? `?${params}` : ""}`, explain: typeof j.explain === "string" ? j.explain.slice(0, 200) : undefined };
  } catch {
    return { ok: false, error: "Non ho capito la richiesta, prova a riformularla" };
  }
}
