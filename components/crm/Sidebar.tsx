"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

const NAV = [
  {
    href: "/crm/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    href: "/crm/leads",
    label: "Lead",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" fill="currentColor" opacity="0.8" />
        <path d="M2 13c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      </svg>
    ),
  },
  {
    href: "/crm/pipeline",
    label: "Pipeline",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="3" height="10" rx="1" fill="currentColor" opacity="0.8" />
        <rect x="6" y="5" width="3" height="8" rx="1" fill="currentColor" opacity="0.8" />
        <rect x="11" y="7" width="3" height="6" rx="1" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    href: "/crm/calendar",
    label: "Calendario",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
        <path d="M2 7h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      </svg>
    ),
  },
  {
    href: "/crm/projects",
    label: "Progetti",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h3l1.5 1.5h4.5A1.5 1.5 0 0 1 14 6v5.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5v-7Z" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
      </svg>
    ),
  },
  {
    href: "/crm/reports",
    label: "Report",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M4 11V8M8 11V4M12 11V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      </svg>
    ),
  },
  {
    href: "/crm/automations",
    label: "Automazioni",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 8a6 6 0 1 1 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <path d="M8 4V8l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      </svg>
    ),
  },
  {
    href: "/crm/settings",
    label: "Impostazioni",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  },
];

const SOCIAL_NAV = [
  { href: "/crm/social", label: "Dashboard", exact: true },
  { href: "/crm/social/inbox", label: "Inbox" },
  { href: "/crm/social/replies", label: "Risposte AI" },
  { href: "/crm/leads?channel=social", label: "Contatti" },
  { href: "/crm/social/guides", label: "Guide" },
  { href: "/crm/social/automations", label: "Automazioni" },
  { href: "/crm/ai/knowledge", label: "Knowledge" },
  { href: "/crm/social/logs", label: "AI Logs" },
  { href: "/crm/settings/social-ai", label: "Impostazioni" },
];

function isSocialActive(pathname: string, href: string, exact?: boolean) {
  if (href.includes("?")) return false;
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

interface SidebarProps {
  profile: Profile | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/crm/login");
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[220px] bg-[#0f0f0f] border-r border-white/[0.06] flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <img src="/logo-mark.png" alt="Dieci Bottega" className="h-7 w-auto shrink-0" />
          <div>
            <p className="text-white font-semibold text-sm leading-none">Dieci Bottega</p>
            <p className="text-white/30 text-[10px] leading-none mt-0.5">CRM interno</p>
          </div>
        </div>
      </div>

      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("crm:search"))}
          className="w-full flex items-center gap-2 text-left text-white/35 hover:text-white/70 text-xs bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 transition-colors"
        >
          <span aria-hidden>🔍</span>
          <span className="flex-1">Cerca…</span>
          <kbd className="text-[10px] text-white/25">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const active =
            (pathname === href || pathname.startsWith(href + "/")) &&
            !(href === "/crm/settings" && pathname.startsWith("/crm/settings/social-ai"));
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${active
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }
              `}
            >
              <span className={active ? "text-[#E63B2E]" : ""}>{icon}</span>
              {label}
            </Link>
          );
        })}

        {/* Social AI */}
        <p className="px-3 pt-5 pb-1.5 text-white/25 text-[10px] font-semibold uppercase tracking-wider">
          Social AI
        </p>
        {SOCIAL_NAV.map(({ href, label, exact }) => {
          const active = isSocialActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${active
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }
              `}
            >
              <span className={`w-1.5 h-1.5 rounded-full ml-[5px] mr-[5px] ${active ? "bg-[#E63B2E]" : "bg-white/20"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-[#E63B2E]/20 flex items-center justify-center shrink-0">
            <span className="text-[#E63B2E] text-xs font-bold">
              {profile?.full_name?.[0] ?? profile?.email?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-xs font-medium truncate">
              {profile?.full_name ?? profile?.email ?? "Utente"}
            </p>
            <p className="text-white/30 text-[10px] capitalize">{profile?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Esci"
            className="text-white/20 hover:text-white/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 7h7M9 5l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
