"use server";

/**
 * Eliminazione definitiva di un contatto (solo admin), con conferma "ELIMINA".
 * Oltre al lead (attività, tag, opportunità ed email vanno via in cascata) rimuove
 * anche i dati social collegati, che altrimenti resterebbero orfani nell'Inbox.
 */
import { revalidatePath } from "next/cache";
import { requireCrmUser } from "@/lib/social-ai/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAction } from "@/lib/social-ai/crm";

const DELETE_CONFIRM_WORD = "ELIMINA"; // i file "use server" possono esportare solo funzioni async

export async function deleteLead(leadId: string, confirmation: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await requireCrmUser(["admin"]);
    if (confirmation.trim().toUpperCase() !== DELETE_CONFIRM_WORD) return { ok: false, error: `Scrivi ${DELETE_CONFIRM_WORD} per confermare` };

    const db = createAdminClient();
    const { data: lead } = await db.from("leads").select("id, name, email").eq("id", leadId).maybeSingle<{ id: string; name: string | null; email: string | null }>();
    if (!lead) return { ok: false, error: "Contatto non trovato" };

    const { data: convs } = await db.from("social_conversations").select("id").eq("contact_id", leadId);
    const convIds = (convs ?? []).map((c: { id: string }) => c.id);
    const byContact = ["social_comments", "guide_deliveries", "ai_runs", "ai_actions"] as const;
    for (const t of byContact) {
      const { error } = await db.from(t).delete().eq("contact_id", leadId);
      if (error) throw new Error(`${t}: ${error.message}`);
      if (convIds.length) {
        const { error: e2 } = await db.from(t).delete().in("conversation_id", convIds);
        if (e2) throw new Error(`${t}: ${e2.message}`);
      }
    }
    // i messaggi vanno via in cascata con le conversazioni
    if (convIds.length) {
      const { error } = await db.from("social_conversations").delete().in("id", convIds);
      if (error) throw new Error(`social_conversations: ${error.message}`);
    }
    const { error: idErr } = await db.from("social_identities").delete().eq("lead_id", leadId);
    if (idErr) throw new Error(`social_identities: ${idErr.message}`);

    const { error } = await db.from("leads").delete().eq("id", leadId);
    if (error) throw new Error(error.message);

    await logAction(db, {
      action_type: "delete_contact",
      actor: "human",
      actor_user_id: user.id,
      summary: `Contatto eliminato: ${lead.name ?? lead.email ?? leadId}`,
    });
    revalidatePath("/crm/leads");
    revalidatePath("/crm/social/inbox");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
