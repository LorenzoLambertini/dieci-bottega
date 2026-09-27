/**
 * Operazioni CRM usate dal modulo Social AI.
 * Il "contatto" è una riga della tabella esistente `leads`:
 * nessun secondo CRM, nessuna tabella contatti duplicata.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConversationRow, InboundEvent, Platform } from "./types";

export interface IdentityRow {
  id: string;
  platform: Platform;
  platform_user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  lead_id: string | null;
}

export interface LeadRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  status: string;
  source: string | null;
  score: number;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  temperature: string | null;
  interests: string[] | null;
  created_at: string;
}

const nowIso = () => new Date().toISOString();

/* ─── Audit log ─────────────────────────────────────────────── */

export interface ActionLog {
  contact_id?: string | null;
  conversation_id?: string | null;
  platform?: string | null;
  action_type: string;
  actor?: "ai" | "rule" | "human" | "system";
  actor_user_id?: string | null;
  summary?: string | null;
  input?: unknown;
  output?: unknown;
  status?: "success" | "error" | "skipped" | "pending";
  error?: string | null;
}

/** Scrive in ai_actions. Non deve mai far fallire il flusso principale. */
export async function logAction(db: SupabaseClient, a: ActionLog): Promise<string | null> {
  const { data, error } = await db
    .from("ai_actions")
    .insert({
      contact_id: a.contact_id ?? null,
      conversation_id: a.conversation_id ?? null,
      platform: a.platform ?? null,
      action_type: a.action_type,
      actor: a.actor ?? "ai",
      actor_user_id: a.actor_user_id ?? null,
      summary: a.summary ?? null,
      input: a.input ?? null,
      output: a.output ?? null,
      status: a.status ?? "success",
      error: a.error ?? null,
    })
    .select("id")
    .single();
  if (error) console.error("[social-ai] logAction:", error.message);
  return (data as { id?: string } | null)?.id ?? null;
}

/* ─── Identità e contatto ──────────────────────────────────── */

export async function findOrCreateIdentity(
  db: SupabaseClient,
  ev: Pick<InboundEvent, "platform" | "senderId" | "senderUsername" | "senderName">,
  accountId: string | null,
  profile?: { name?: string | null; username?: string | null; avatarUrl?: string | null } | null
): Promise<IdentityRow> {
  const { data: existing } = await db
    .from("social_identities")
    .select("*")
    .eq("platform", ev.platform)
    .eq("platform_user_id", ev.senderId)
    .maybeSingle();

  const username = profile?.username ?? ev.senderUsername ?? null;
  const displayName = profile?.name ?? ev.senderName ?? null;

  if (existing) {
    const patch: Record<string, unknown> = {};
    if (username && username !== existing.username) patch.username = username;
    if (displayName && displayName !== existing.display_name) patch.display_name = displayName;
    if (profile?.avatarUrl && profile.avatarUrl !== existing.avatar_url) patch.avatar_url = profile.avatarUrl;
    if (Object.keys(patch).length) {
      patch.updated_at = nowIso();
      await db.from("social_identities").update(patch).eq("id", existing.id);
      return { ...(existing as IdentityRow), ...(patch as Partial<IdentityRow>) };
    }
    return existing as IdentityRow;
  }

  const { data: created, error } = await db
    .from("social_identities")
    .upsert(
      {
        platform: ev.platform,
        platform_user_id: ev.senderId,
        account_id: accountId,
        username,
        display_name: displayName,
        avatar_url: profile?.avatarUrl ?? null,
      },
      { onConflict: "platform,platform_user_id" }
    )
    .select("*")
    .single();
  if (error || !created) throw new Error(`social_identities: ${error?.message}`);
  return created as IdentityRow;
}

/** Garantisce che l'identità social sia collegata a un lead (contatto CRM). */
export async function ensureContact(db: SupabaseClient, identity: IdentityRow, platform: Platform): Promise<LeadRow> {
  if (identity.lead_id) {
    const { data } = await db.from("leads").select("*").eq("id", identity.lead_id).maybeSingle();
    if (data) return data as LeadRow;
  }
  const name = identity.display_name || (identity.username ? `@${identity.username}` : `Utente ${platform}`);
  const { data: lead, error } = await db
    .from("leads")
    .insert({
      name,
      email: null,
      status: "new",
      source: platform,
      score: 0,
      metadata: {
        social: { platform, username: identity.username, platform_user_id: identity.platform_user_id },
      },
    })
    .select("*")
    .single();
  if (error || !lead) throw new Error(`leads insert: ${error?.message}`);

  await db.from("social_identities").update({ lead_id: lead.id, updated_at: nowIso() }).eq("id", identity.id);
  await db.from("activities").insert({
    lead_id: lead.id,
    user_id: null,
    type: "system",
    subject: `Contatto creato da ${platform}`,
    body: identity.username ? `Username: @${identity.username}` : null,
    metadata: { source: platform, social_identity_id: identity.id },
  });
  identity.lead_id = lead.id;
  return lead as LeadRow;
}

export async function findOrCreateConversation(
  db: SupabaseClient,
  args: { platform: Platform; externalId: string; contactId: string; identityId: string; accountId: string | null }
): Promise<ConversationRow> {
  const { data: existing } = await db
    .from("social_conversations")
    .select("*")
    .eq("platform", args.platform)
    .eq("external_conversation_id", args.externalId)
    .maybeSingle();
  if (existing) return existing as ConversationRow;
  const { data, error } = await db
    .from("social_conversations")
    .upsert(
      {
        platform: args.platform,
        external_conversation_id: args.externalId,
        contact_id: args.contactId,
        identity_id: args.identityId,
        account_id: args.accountId,
      },
      { onConflict: "platform,external_conversation_id" }
    )
    .select("*")
    .single();
  if (error || !data) throw new Error(`social_conversations: ${error?.message}`);
  return data as ConversationRow;
}

export async function updateConversation(db: SupabaseClient, id: string, patch: Partial<ConversationRow> & Record<string, unknown>) {
  const { error } = await db.from("social_conversations").update({ ...patch, updated_at: nowIso() }).eq("id", id);
  if (error) throw new Error(`update conversation: ${error.message}`);
}

/* ─── Tag (tabelle esistenti tags / lead_tags) ─────────────── */

export function sanitizeTag(name: string): string | null {
  const t = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9:_\-àèéìòù]/g, "").slice(0, 40);
  return t.length >= 2 ? t : null;
}

export async function addTag(db: SupabaseClient, leadId: string, rawName: string): Promise<string | null> {
  const name = sanitizeTag(rawName);
  if (!name) return null;
  let { data: tag } = await db.from("tags").select("id, name").eq("name", name).maybeSingle();
  if (!tag) {
    const ins = await db.from("tags").insert({ name, color: "#E63B2E" }).select("id, name").single();
    tag = ins.data;
    if (!tag) {
      // creato in parallelo da un altro evento
      tag = (await db.from("tags").select("id, name").eq("name", name).maybeSingle()).data;
    }
  }
  if (!tag) return null;
  await db.from("lead_tags").upsert({ lead_id: leadId, tag_id: tag.id }, { onConflict: "lead_id,tag_id", ignoreDuplicates: true });
  return name;
}

export async function removeTag(db: SupabaseClient, leadId: string, rawName: string): Promise<boolean> {
  const name = sanitizeTag(rawName);
  if (!name) return false;
  const { data: tag } = await db.from("tags").select("id").eq("name", name).maybeSingle();
  if (!tag) return false;
  await db.from("lead_tags").delete().eq("lead_id", leadId).eq("tag_id", tag.id);
  return true;
}

export async function getTags(db: SupabaseClient, leadId: string): Promise<string[]> {
  const { data: links } = await db.from("lead_tags").select("tag_id").eq("lead_id", leadId);
  const ids = (links ?? []).map((l: { tag_id: string }) => l.tag_id);
  if (!ids.length) return [];
  const { data: tags } = await db.from("tags").select("name").in("id", ids);
  return (tags ?? []).map((t: { name: string }) => t.name).sort();
}

/* ─── Note / attività / notifiche ─────────────────────────── */

export async function createNote(db: SupabaseClient, leadId: string, subject: string, body?: string | null, metadata?: Record<string, unknown>) {
  await db.from("activities").insert({
    lead_id: leadId,
    user_id: null,
    type: "note",
    subject: subject.slice(0, 200),
    body: body ?? null,
    metadata: { source: "social-ai", ...(metadata ?? {}) },
  });
}

export async function createSystemActivity(db: SupabaseClient, leadId: string, subject: string, body?: string | null, metadata?: Record<string, unknown>) {
  await db.from("activities").insert({
    lead_id: leadId,
    user_id: null,
    type: "system",
    subject: subject.slice(0, 200),
    body: body ?? null,
    metadata: { source: "social-ai", ...(metadata ?? {}) },
  });
}

export async function createNotification(
  db: SupabaseClient,
  n: { type: string; title: string; body?: string | null; link?: string | null; userId?: string | null }
) {
  await db.from("notifications").insert({
    user_id: n.userId ?? null,
    type: n.type,
    title: n.title.slice(0, 200),
    body: n.body ?? null,
    link: n.link ?? null,
  });
}

/* ─── Lead ─────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactPatch {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  interests?: string[];
}

/**
 * Aggiorna i dati anagrafici del contatto.
 * Sicurezza: se l'email appartiene a un altro lead NON unisce i record
 * (evita che qualcuno "si colleghi" alla scheda di un altro dichiarando
 * la sua email): crea una nota per verifica umana.
 */
export async function updateContactFields(db: SupabaseClient, lead: LeadRow, patch: ContactPatch): Promise<{ updated: string[]; conflicts: string[] }> {
  const update: Record<string, unknown> = {};
  const conflicts: string[] = [];
  if (patch.name && patch.name.trim().length >= 2) update.name = patch.name.trim().slice(0, 120);
  if (patch.phone && /^[+\d][\d\s\-().]{5,24}$/.test(patch.phone.trim())) update.phone = patch.phone.trim();
  if (patch.company) update.company = patch.company.trim().slice(0, 160);
  if (patch.website && /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(patch.website.trim())) {
    const w = patch.website.trim();
    update.website = w.startsWith("http") ? w : `https://${w}`;
  }
  if (patch.interests?.length) {
    update.interests = [...new Set([...(lead.interests ?? []), ...patch.interests.map((i) => i.trim().toLowerCase().slice(0, 40)).filter(Boolean)])].slice(0, 20);
  }
  if (patch.email) {
    const email = patch.email.trim().toLowerCase();
    if (EMAIL_RE.test(email) && email !== lead.email) {
      const { data: other } = await db.from("leads").select("id").eq("email", email).maybeSingle();
      if (other && other.id !== lead.id) {
        conflicts.push("email");
        await createNote(db, lead.id, "Possibile duplicato da verificare", `L'utente ha indicato l'email ${email}, già associata a un altro lead (${other.id}). Nessun merge automatico.`, { duplicate_of: other.id });
      } else {
        update.email = email;
      }
    }
  }
  if (Object.keys(update).length) {
    update.updated_at = nowIso();
    const { error } = await db.from("leads").update(update).eq("id", lead.id);
    if (error) throw new Error(`leads update: ${error.message}`);
    Object.assign(lead, update);
  }
  return { updated: Object.keys(update).filter((k) => k !== "updated_at"), conflicts };
}

export async function setLeadScore(db: SupabaseClient, leadId: string, score: number, temperature: string) {
  await db.from("leads").update({ score, temperature, updated_at: nowIso() }).eq("id", leadId);
}

/** Stati che l'AI può impostare. "won"/"lost"/"proposal" restano decisioni umane. */
export const AI_ALLOWED_STATUSES = ["new", "contacted", "qualified"] as const;
