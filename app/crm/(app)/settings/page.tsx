import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export default async function SettingsPage() {
  const supabase = await createClient();

  const [profilesRes, { data: { user } }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.auth.getUser(),
  ]);

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
          {isAdmin && (
            <span className="text-white/25 text-xs">
              Aggiungi utenti da Supabase Auth
            </span>
          )}
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
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                  ROLE_COLOR[profile.role] ?? "bg-white/[0.06] text-white/40"
                }`}
              >
                {ROLE_LABEL[profile.role] ?? profile.role}
              </span>
            </div>
          ))}
        </div>
      </div>

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
