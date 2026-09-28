"use server";

/** Accettazione online del preventivo da parte del cliente (pagina pubblica, niente login). */
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, rateLimit } from "@/lib/social-ai/rate-limit";
import { notifyTeam } from "@/lib/crm/notify";
import { eur } from "@/lib/crm/quotes";

export async function acceptQuote(token: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const h = await headers();
  if (!rateLimit(`quote-accept:${clientIp(h)}`, 10, 3600_000)) return { ok: false, error: "Troppi tentativi, riprova più tardi" };
  const who = name.trim().slice(0, 120);
  if (who.length < 3) return { ok: false, error: "Scrivi nome e cognome" };
  if (!/^[a-f0-9]{32,80}$/.test(token)) return { ok: false, error: "Link non valido" };

  const db = createAdminClient();
  const { data } = await db.from("quotes").select("id, lead_id, number, title, total, status, valid_until").eq("public_token", token).maybeSingle();
  const q = data as { id: string; lead_id: string; number: string; title: string; total: number; status: string; valid_until: string | null } | null;
  if (!q) return { ok: false, error: "Preventivo non trovato" };
  if (q.status === "accepted") return { ok: true };
  if (q.status === "rejected") return { ok: false, error: "Questo preventivo non è più valido: contattaci per aggiornarlo" };
  if (q.valid_until && new Date(`${q.valid_until}T23:59:59`) < new Date()) return { ok: false, error: "Il preventivo è scaduto: contattaci per aggiornarlo" };

  const now = new Date().toISOString();
  await db.from("quotes").update({ status: "accepted", accepted_at: now, accepted_name: who, updated_at: now }).eq("id", q.id);
  await db.from("activities").insert({ lead_id: q.lead_id, type: "system", subject: `✅ Preventivo ${q.number} accettato online da ${who}`, metadata: { quote_id: q.id } });
  // "Vinto": l'automazione crea il progetto
  const { data: won } = await db.from("pipeline_stages").select("id").eq("name", "Vinto").maybeSingle();
  await db.from("leads").update({ status: "won", ...(won ? { stage_id: (won as { id: string }).id } : {}), updated_at: now }).eq("id", q.lead_id);

  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://diecibottega.it").replace(/\/$/, "");
  await notifyTeam({ title: `🎉 Preventivo accettato · ${eur(Number(q.total))}`, body: `${who} ha accettato ${q.number} (${q.title})`, url: `/crm/leads/${q.lead_id}` }, db);
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.TEAM_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (apiKey && to.length) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Dieci Bottega CRM <crm@diecibottega.it>",
        to,
        subject: `🎉 Preventivo ${q.number} accettato (${eur(Number(q.total))})`,
        text: `${who} ha accettato il preventivo ${q.number} "${q.title}" da ${eur(Number(q.total))}.\n\nScheda: ${site}/crm/leads/${q.lead_id}`,
      }),
    }).catch(() => undefined);
  }
  revalidatePath(`/preventivo/${token}`);
  return { ok: true };
}
