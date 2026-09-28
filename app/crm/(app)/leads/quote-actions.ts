"use server";

/** Preventivi dalla scheda contatto: crea/modifica, invia al cliente, cambia stato, elimina. */
import { revalidatePath } from "next/cache";
import { requireCrmUser } from "@/lib/social-ai/auth";
import { createSocialClient } from "@/lib/social-ai/db";
import { nextQuoteNumber, quoteTotals, sanitizeItems, eur } from "@/lib/crm/quotes";
import { sendLeadEmail } from "@/lib/crm/email";

type R = { ok: boolean; error?: string; id?: string };

const SITE = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://diecibottega.it").replace(/\/$/, "");
const PROPOSTA_STAGE = "Proposta inviata";

export async function saveQuote(input: {
  id?: string;
  leadId: string;
  title: string;
  items: unknown;
  discount: number;
  notes: string;
  validUntil: string | null;
}): Promise<R> {
  const user = await requireCrmUser();
  const db = await createSocialClient();
  const items = sanitizeItems(input.items);
  if (!input.title.trim()) return { ok: false, error: "Titolo obbligatorio" };
  if (!items.length) return { ok: false, error: "Aggiungi almeno una voce" };
  const t = quoteTotals(items, input.discount);
  const row = {
    title: input.title.trim().slice(0, 200),
    items,
    discount: t.discount,
    total: t.total,
    notes: input.notes.trim().slice(0, 5000) || null,
    valid_until: input.validUntil || null,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await db.from("quotes").update(row).eq("id", input.id).in("status", ["draft", "sent"]);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/crm/leads/${input.leadId}`);
    return { ok: true, id: input.id };
  }

  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: nums } = await db.from("quotes").select("number").like("number", `${year}-%`);
    const number = nextQuoteNumber(year, ((nums ?? []) as { number: string }[]).map((n) => n.number));
    const { data, error } = await db.from("quotes").insert({ ...row, lead_id: input.leadId, number, created_by: user.id }).select("id").single();
    if (!error && data) {
      await db.from("activities").insert({ lead_id: input.leadId, user_id: user.id, type: "note", subject: `Preventivo ${number} creato · ${eur(t.total)}` });
      revalidatePath(`/crm/leads/${input.leadId}`);
      return { ok: true, id: (data as { id: string }).id };
    }
    if (!/duplicate|unique/i.test(error?.message ?? "")) return { ok: false, error: error?.message };
  }
  return { ok: false, error: "Numero preventivo occupato, riprova" };
}

export async function sendQuote(quoteId: string, message: string): Promise<R> {
  const user = await requireCrmUser();
  const db = await createSocialClient();
  const { data: q } = await db.from("quotes").select("id, lead_id, number, title, total, public_token, status").eq("id", quoteId).maybeSingle();
  const quote = q as { id: string; lead_id: string; number: string; title: string; total: number; public_token: string; status: string } | null;
  if (!quote) return { ok: false, error: "Preventivo non trovato" };
  const { data: l } = await db.from("leads").select("email, name, status").eq("id", quote.lead_id).maybeSingle();
  const lead = l as { email: string | null; name: string; status: string } | null;
  if (!lead?.email) return { ok: false, error: "Il contatto non ha un'email: copia il link e mandalo su WhatsApp" };
  const { data: me } = await db.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle();
  const sender = me as { full_name: string | null; email: string | null } | null;
  const senderName = sender?.full_name?.split(" ")[0] || user.email.split("@")[0];
  const link = `${SITE()}/preventivo/${quote.public_token}`;
  const body = message.includes(link) ? message : `${message.trim()}\n\n${link}`;

  const r = await sendLeadEmail(db, {
    leadId: quote.lead_id,
    to: lead.email,
    subject: `Preventivo ${quote.number} · ${quote.title}`,
    body,
    senderName,
    senderEmail: sender?.email ?? user.email,
    userId: user.id,
  });
  if (!r.ok) return r;
  await db.from("quotes").update({ status: quote.status === "draft" ? "sent" : quote.status, sent_at: new Date().toISOString() }).eq("id", quote.id);
  // il contatto passa a "Proposta inviata" (le automazioni programmano il sollecito)
  if (["new", "contacted", "qualified"].includes(lead.status)) {
    const { data: st } = await db.from("pipeline_stages").select("id").eq("name", PROPOSTA_STAGE).maybeSingle();
    await db.from("leads").update({ status: "proposal", ...(st ? { stage_id: (st as { id: string }).id } : {}), updated_at: new Date().toISOString() }).eq("id", quote.lead_id);
  }
  revalidatePath(`/crm/leads/${quote.lead_id}`);
  return { ok: true };
}

export async function markQuoteSent(quoteId: string): Promise<R> {
  await requireCrmUser();
  const db = await createSocialClient();
  const { data } = await db.from("quotes").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", quoteId).eq("status", "draft").select("lead_id").maybeSingle();
  if (data) revalidatePath(`/crm/leads/${(data as { lead_id: string }).lead_id}`);
  return { ok: true };
}

export async function setQuoteStatus(quoteId: string, status: "accepted" | "rejected" | "sent"): Promise<R> {
  const user = await requireCrmUser();
  const db = await createSocialClient();
  const { data } = await db
    .from("quotes")
    .update({ status, accepted_at: status === "accepted" ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq("id", quoteId)
    .select("lead_id, number")
    .maybeSingle();
  const q = data as { lead_id: string; number: string } | null;
  if (!q) return { ok: false, error: "Preventivo non trovato" };
  await db.from("activities").insert({ lead_id: q.lead_id, user_id: user.id, type: "note", subject: `Preventivo ${q.number}: ${status === "accepted" ? "accettato" : status === "rejected" ? "rifiutato" : "riaperto"}` });
  if (status === "accepted") await db.from("leads").update({ status: "won", updated_at: new Date().toISOString() }).eq("id", q.lead_id);
  revalidatePath(`/crm/leads/${q.lead_id}`);
  return { ok: true };
}

export async function deleteQuote(quoteId: string): Promise<R> {
  await requireCrmUser(["admin"]);
  const db = await createSocialClient();
  const { data } = await db.from("quotes").delete().eq("id", quoteId).select("lead_id").maybeSingle();
  if (data) revalidatePath(`/crm/leads/${(data as { lead_id: string }).lead_id}`);
  return { ok: true };
}
