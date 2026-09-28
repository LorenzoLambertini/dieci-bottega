import Link from "next/link";
import { redirect } from "next/navigation";
import { getCrmUser } from "@/lib/social-ai/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { pushConfigured } from "@/lib/crm/notify";

export const dynamic = "force-dynamic";

const fmt = (iso: string) => new Date(iso).toLocaleString("it-IT", { timeZone: "Europe/Rome", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function HealthPage() {
  const user = await getCrmUser();
  if (user?.role !== "admin") redirect("/crm/dashboard");
  const db = createAdminClient();
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const [events, emails, ai, sends, push] = await Promise.all([
    db.from("social_webhook_events").select("platform, event_type, status, last_error, received_at").in("status", ["failed", "dead"]).gte("received_at", since).order("received_at", { ascending: false }).limit(20),
    db.from("email_logs").select("to_email, subject, error, sent_at").eq("status", "failed").gte("sent_at", since).order("sent_at", { ascending: false }).limit(20),
    db.from("ai_runs").select("purpose, model, error, created_at").not("error", "is", null).gte("created_at", since).order("created_at", { ascending: false }).limit(20),
    db.from("social_messages").select("platform, error, created_at").eq("direction", "outbound").eq("delivery_status", "failed").gte("created_at", since).order("created_at", { ascending: false }).limit(20),
    db.from("push_subscriptions").select("id", { count: "exact", head: true }),
  ]);

  const config: [string, boolean, string][] = [
    ["Database (service role)", !!process.env.SUPABASE_SERVICE_ROLE_KEY, "Necessario per webhook, cron e preventivi pubblici"],
    ["AI (Anthropic)", !!process.env.ANTHROPIC_API_KEY, "Assistente AI, Social AI, ricerca a parole"],
    ["Email (Resend)", !!process.env.RESEND_API_KEY, "Email ai clienti, preventivi, email del mattino"],
    ["Destinatari team", !!process.env.TEAM_EMAILS, "TEAM_EMAILS: chi riceve avvisi ed email del mattino"],
    ["Cron giornaliero", !!process.env.CRON_SECRET, "Retry automatici ed email del mattino"],
    ["Notifiche push", pushConfigured(), `Chiavi VAPID · ${push.count ?? 0} dispositivi iscritti`],
    ["Social (Meta)", !!(process.env.META_APP_ID && process.env.META_APP_SECRET), "Instagram e Facebook"],
  ];

  const sections: { title: string; rows: { when: string; what: string; err: string | null }[] }[] = [
    { title: "Webhook social falliti", rows: ((events.data ?? []) as { platform: string; event_type: string; status: string; last_error: string | null; received_at: string }[]).map((e) => ({ when: e.received_at, what: `${e.platform} · ${e.event_type} · ${e.status}`, err: e.last_error })) },
    { title: "Email non consegnate", rows: ((emails.data ?? []) as { to_email: string; subject: string; error: string | null; sent_at: string }[]).map((e) => ({ when: e.sent_at, what: `${e.to_email} · ${e.subject}`, err: e.error })) },
    { title: "Errori AI", rows: ((ai.data ?? []) as { purpose: string; model: string; error: string | null; created_at: string }[]).map((e) => ({ when: e.created_at, what: `${e.purpose} · ${e.model}`, err: e.error })) },
    { title: "Messaggi social non inviati", rows: ((sends.data ?? []) as { platform: string; error: string | null; created_at: string }[]).map((e) => ({ when: e.created_at, what: e.platform, err: e.error })) },
  ];
  const problems = sections.reduce((n, s) => n + s.rows.length, 0) + config.filter((c) => !c[1]).length;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-white/30 mb-6">
        <Link href="/crm/settings" className="hover:text-white/60 transition-colors">Impostazioni</Link>
        <span>/</span>
        <span className="text-white/60">Salute del sistema</span>
      </div>
      <h1 className="text-white text-2xl font-bold mb-1">Salute del sistema</h1>
      <p className={`text-sm mb-6 ${problems ? "text-yellow-300" : "text-green-400"}`}>
        {problems ? `${problems} cose da controllare negli ultimi 7 giorni.` : "✓ Tutto funziona: nessun errore negli ultimi 7 giorni."}
      </p>

      <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-white/[0.06]"><h2 className="text-white font-semibold text-sm">Collegamenti</h2></div>
        <div className="divide-y divide-white/[0.04]">
          {config.map(([name, ok, note]) => (
            <div key={name} className="flex items-center gap-3 px-5 py-2.5">
              <span className={`text-xs font-semibold w-16 shrink-0 ${ok ? "text-green-400" : "text-yellow-400"}`}>{ok ? "✓ OK" : "⚠ Manca"}</span>
              <span className="text-white/80 text-sm w-48 shrink-0">{name}</span>
              <span className="text-white/35 text-xs">{note}</span>
            </div>
          ))}
        </div>
      </div>

      {sections.map((s) => (
        <div key={s.title} className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">{s.title}</h2>
            <span className={`text-xs ${s.rows.length ? "text-yellow-300" : "text-green-400"}`}>{s.rows.length ? s.rows.length : "✓ nessuno"}</span>
          </div>
          {s.rows.length > 0 && (
            <div className="divide-y divide-white/[0.04]">
              {s.rows.map((r, i) => (
                <div key={i} className="px-5 py-2.5 text-xs">
                  <p className="text-white/70"><span className="text-white/35">{fmt(r.when)}</span> · {r.what}</p>
                  {r.err && <p className="text-[#E63B2E]/80 mt-0.5 break-words">{r.err}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
