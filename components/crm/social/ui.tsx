/**
 * Primitive UI del modulo Social AI — stesse classi del CRM esistente
 * (card #141414, bordi white/[0.06], accento #E63B2E).
 */
import Link from "next/link";
import type { ReactNode } from "react";

export const PLATFORM_META: Record<string, { label: string; short: string; className: string }> = {
  instagram: { label: "Instagram", short: "IG", className: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  facebook: { label: "Facebook", short: "FB", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  linkedin: { label: "LinkedIn", short: "IN", className: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  tiktok: { label: "TikTok", short: "TT", className: "bg-white/10 text-white/70 border-white/20" },
};

export function PlatformBadge({ platform, full }: { platform: string; full?: boolean }) {
  const m = PLATFORM_META[platform] ?? { label: platform, short: platform.slice(0, 2).toUpperCase(), className: "bg-white/10 text-white/40 border-white/10" };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide ${m.className}`}>
      {full ? m.label : m.short}
    </span>
  );
}

const TONE: Record<string, string> = {
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  red: "bg-[#E63B2E]/10 text-[#E63B2E] border-[#E63B2E]/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  gray: "bg-white/[0.06] text-white/40 border-white/10",
};

export function Pill({ tone = "gray", children }: { tone?: keyof typeof TONE; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide whitespace-nowrap ${TONE[tone]}`}>
      {children}
    </span>
  );
}

export function TemperaturePill({ temperature, score }: { temperature: string | null; score?: number }) {
  const t = temperature ?? "cold";
  const tone = t === "hot" ? "red" : t === "warm" ? "orange" : "blue";
  const label = t === "hot" ? "Hot" : t === "warm" ? "Warm" : "Cold";
  return <Pill tone={tone}>{label}{score != null ? ` · ${score}` : ""}</Pill>;
}

export const CAPABILITY_STATUS: Record<string, { label: string; tone: keyof typeof TONE }> = {
  supported: { label: "Supported", tone: "green" },
  requires_approval: { label: "Requires approval", tone: "yellow" },
  not_available: { label: "Not available", tone: "gray" },
  not_connected: { label: "Not connected", tone: "orange" },
};

export function Card({ title, action, children, className = "" }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
          <h2 className="text-white font-semibold text-sm">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="text-white text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export const SOCIAL_TABS = [
  { href: "/crm/social", label: "Dashboard" },
  { href: "/crm/social/inbox", label: "Inbox" },
  { href: "/crm/leads?channel=social", label: "Contatti" },
  { href: "/crm/social/guides", label: "Guide" },
  { href: "/crm/social/automations", label: "Automazioni" },
  { href: "/crm/ai/knowledge", label: "Knowledge" },
  { href: "/crm/social/logs", label: "AI Logs" },
  { href: "/crm/settings/social-ai", label: "Impostazioni" },
];

/** Barra di navigazione secondaria del modulo (utile soprattutto su mobile). */
export function SocialTabs({ active }: { active: string }) {
  return (
    <div className="flex gap-1 overflow-x-auto mb-6 -mx-1 px-1 pb-1">
      {SOCIAL_TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            active === t.href ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

export function MigrationNotice({ error }: { error: string }) {
  return (
    <div className="bg-[#E63B2E]/10 border border-[#E63B2E]/20 rounded-xl p-5 mb-6">
      <p className="text-[#E63B2E] text-sm font-semibold">Database del modulo Social AI non pronto</p>
      <p className="text-white/50 text-sm mt-1">
        Applica la migration <code className="text-white/70">supabase/migrations/20260926120000_social_ai.sql</code> (vedi SOCIAL_AI_SETUP.md).
      </p>
      <p className="text-white/25 text-xs mt-2 font-mono">{error}</p>
    </div>
  );
}

export function isMissingTable(err: { code?: string; message?: string } | null | undefined): boolean {
  return !!err && (err.code === "42P01" || err.code === "PGRST205" || /does not exist|schema cache/i.test(err.message ?? ""));
}

export function fmtDate(iso: string | null | undefined, withTime = true): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("it-IT", {
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : { year: "numeric" }),
    timeZone: "Europe/Rome",
  });
}

export const inputCls =
  "w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#E63B2E]/50 transition-colors";
export const labelCls = "text-white/30 text-xs uppercase tracking-wider block mb-1.5";
export const btnPrimary =
  "bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors";
export const btnGhost =
  "bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 text-white/70 text-sm px-3 py-2 rounded-lg transition-colors";
