import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";
import { DeleteTagButton, SendDigestButton, TagPill } from "@/components/crm/LeadTools";
import { InviteUserForm, RoleSelect } from "@/components/crm/CrmTools";
import { PushSetup } from "@/components/crm/PushSetup";

export default async function SettingsPage() {
  const supabase = await createClient();

  const [profilesRes, { data: { user } }, tagsRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.auth.getUser(),
    supabase.from("tags").select("id, name, color, lead_tags(count)").order("name"),
  ]);
  const tags = ((tagsRes.data ?? []) as unknown as { id: string; name: string; color: string; lead_tags: { count: number }[] }[]).map((t) => ({
    ...t,
    count: t.lead_tags?.[0]?.count ?? 0,
  }));

  const profiles = (profilesRes.data ?? []) as Profile[];
  const currentProfile = profiles.find((p) => p.id === user?.id);
  const isAdmin = currentProfile?.role === "admin";

  const ROLE_LABEL: Record<string, string> = {
    admin: "Admin",
    sales: "Sales",
    marketing: "Marketing",
  };

  const ROLE_COLOR: Record<string, string> = {
    admin: "bg-[#E63B2E]/10 text-[#E63B2E]",
    sales: "bg-blue-500/10 text-blue-400",
    marketing: "bg-purple-500/10 text-purple-400",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Impostazioni</h1>
        <p className="text-white/40 text-sm mt-0.5">Gestione team e configurazione.</p>
      </div>

      {/* Team */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">
            Team ({profiles.length})
          </h2>

        </div>
        <div className="divide-y divide-white/[0.04]">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full bg-[#E63B2E]/10 flex items-center justify-center shrink-0">
                <span className="text-[#E63B2E] text-sm font-bold">
                  {(profile.full_name?.[0] ?? profile.email?.[0] ?? "?").toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm font-medium">
                  {profile.full_name ?? "—"}
                  {profile.id === user?.id && (
                    <span className="text-white/25 text-xs ml-2">(tu)</span>
                  )}
                </p>
                <p className="text-white/30 text-xs truncate">{profile.email}</p>
              </div>
              {isAdmin && profile.id !== user?.id ? (
                <RoleSelect userId={profile.id} role={profile.role} />
              ) : (
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    ROLE_COLOR[profile.role] ?? "bg-white/[0.06] text-white/40"
                  }`}
                >
                  {ROLE_LABEL[profile.role] ?? profile.role}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 mb-6 -mt-3">
          <h2 className="text-white font-semibold text-sm mb-3">Invita nel team</h2>
          <InviteUserForm />
        </div>
      )}

      {/* Notifiche push */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 mb-6">
        <h2 className="text-white font-semibold text-sm">🔔 Notifiche sul telefono</h2>
        <p className="text-white/40 text-sm mt-1 mb-3">Ti avviso subito quando arriva un contatto dal sito o dal chatbot, quando una chat social richiede una persona e quando un cliente accetta un preventivo.</p>
        <PushSetup />
      </div>

      {/* App sul telefono */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 mb-6">
        <h2 className="text-white font-semibold text-sm">📱 Il CRM come app sul telefono</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-3 text-sm text-white/50 leading-relaxed">
          <div>
            <p className="text-white/70 font-medium mb-1">iPhone (Safari)</p>
            <p>Apri il CRM in Safari → tocca il pulsante <span className="text-white/80">Condividi</span> (quadrato con freccia) → <span className="text-white/80">Aggiungi alla schermata Home</span> → Aggiungi.</p>
          </div>
          <div>
            <p className="text-white/70 font-medium mb-1">Android (Chrome)</p>
            <p>Apri il CRM in Chrome → menu <span className="text-white/80">⋮</span> → <span className="text-white/80">Installa app</span> (o &quot;Aggiungi a schermata Home&quot;).</p>
          </div>
        </div>
        <p className="text-white/30 text-xs mt-3">Si apre a tutto schermo con l&apos;icona 10/B, senza la barra del browser. Tenendo premuta l&apos;icona hai le scorciatoie: nuovo contatto, da ricontattare, inbox.</p>
      </div>

      {/* Email del mattino */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 mb-6">
        <h2 className="text-white font-semibold text-sm">☀️ Email del mattino</h2>
        <p className="text-white/40 text-sm mt-1 mb-3">
          Ogni mattina verso le 9 il team riceve un&apos;email con i promemoria del giorno, i nuovi contatti delle ultime 24 ore e le chat social da seguire. Se non c&apos;è niente, non arriva nulla.
        </p>
        {isAdmin && <SendDigestButton />}
      </div>

      {/* Tag */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">Tag ({tags.length})</h2>
          <span className="text-white/25 text-xs">Si creano dalla scheda di un contatto</span>
        </div>
        {tags.length === 0 ? (
          <p className="px-5 py-4 text-white/25 text-sm">Nessun tag. Aggiungine uno da un contatto: es. ristorante, caldo, bologna.</p>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {tags.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-2.5">
                <TagPill tag={t} />
                <a href={`/crm/leads?tag=${t.id}`} className="text-white/35 hover:text-white/70 text-xs flex-1">
                  {t.count} contatt{t.count === 1 ? "o" : "i"} →
                </a>
                {isAdmin && <DeleteTagButton id={t.id} name={t.name} count={t.count} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <a href="/crm/health" className="block bg-[#141414] border border-white/[0.06] rounded-xl p-5 mb-6 hover:border-[#E63B2E]/30 transition-colors">
          <h2 className="text-white font-semibold text-sm">🩺 Salute del sistema →</h2>
          <p className="text-white/40 text-sm mt-1">Collegamenti configurati, errori di email, AI e webhook degli ultimi 7 giorni.</p>
        </a>
      )}

      {/* Social AI */}
      <a
        href="/crm/settings/social-ai"
        className="block bg-[#141414] border border-white/[0.06] rounded-xl p-5 mb-6 hover:border-[#E63B2E]/30 transition-colors"
      >
        <h2 className="text-white font-semibold text-sm">Social AI →</h2>
        <p className="text-white/40 text-sm mt-1">
          Collegamento Instagram, Facebook, LinkedIn, TikTok e comportamento dell&apos;assistente AI.
        </p>
      </a>

      {/* Info block */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
        <h2 className="text-white font-semibold text-sm mb-3">
          Connessione Supabase
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-sm">Progetto</span>
            <span className="text-white/60 text-sm font-mono text-xs">
              voyhwqqubcathcvjatyk
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-sm">Region</span>
            <span className="text-white/60 text-sm">eu-west-2</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-sm">Status</span>
            <span className="flex items-center gap-1.5 text-green-400 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Attivo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
