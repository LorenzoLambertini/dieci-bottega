"use client";

import { useState } from "react";
import { SearchButton } from "./CommandPalette";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import { badgeText, useUnreadCount } from "./useUnread";

const NAV = [
  { href: "/crm/dashboard",    label: "Dashboard",    emoji: "▦" },
  { href: "/crm/leads",        label: "Lead",         emoji: "◎" },
  { href: "/crm/pipeline",     label: "Pipeline",     emoji: "▤" },
  { href: "/crm/calendar",     label: "Calendario",   emoji: "▣" },
  { href: "/crm/projects",     label: "Progetti",     emoji: "▭" },
  { href: "/crm/reports",      label: "Report",       emoji: "▥" },
  { href: "/crm/automations",  label: "Automazioni",  emoji: "◷" },
  { href: "/crm/blog",         label: "Blog",         emoji: "▧" },
  { href: "/crm/settings",     label: "Impostazioni", emoji: "◈" },
];

// Barra in basso da telefono: le 4 sezioni usate di più (l'Inbox social al posto delle automazioni)
const TABS = [
  { href: "/crm/dashboard",    label: "Dashboard" },
  { href: "/crm/leads",        label: "Lead" },
  { href: "/crm/pipeline",     label: "Pipeline" },
  { href: "/crm/social/inbox", label: "Inbox" },
];

const SOCIAL_NAV = [
  { href: "/crm/social",               label: "Social AI · Dashboard" },
  { href: "/crm/social/inbox",         label: "Social AI · Inbox" },
  { href: "/crm/social/replies",       label: "Social AI · Risposte AI" },
  { href: "/crm/leads?channel=social", label: "Social AI · Contatti" },
  { href: "/crm/social/guides",        label: "Social AI · Lead magnet" },
  { href: "/crm/social/automations",   label: "Social AI · Automazioni" },
  { href: "/crm/ai/knowledge",         label: "Social AI · Knowledge" },
  { href: "/crm/social/logs",          label: "Social AI · AI Logs" },
  { href: "/crm/settings/social-ai",   label: "Social AI · Impostazioni" },
];

interface MobileNavProps {
  profile: Profile | null;
}

export function MobileNav({ profile }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const unread = useUnreadCount();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/crm/login");
  }

  return (
    <>
      {/* Top bar — mobile only */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f] border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo-mark.png" alt="Dieci Bottega" className="h-6 w-auto shrink-0" />
          <span className="text-white font-semibold text-sm">Dieci Bottega</span>
        </div>
        <div className="flex items-center gap-1">
        <SearchButton className="text-white/60 hover:text-white p-1.5 text-base" />
        <button
          onClick={() => setOpen(true)}
          className="text-white/50 hover:text-white transition-colors p-1"
          aria-label="Apri menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        </div>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-[#0f0f0f] border-r border-white/[0.06] flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-mark.png" alt="Dieci Bottega" className="h-7 w-auto shrink-0" />
            <span className="text-white font-semibold text-sm">Dieci Bottega</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/30 hover:text-white/70 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {[...NAV, ...SOCIAL_NAV].map(({ href, label }) => {
            const active = href.includes("?")
              ? false
              : href === "/crm/social"
                ? pathname === href
                : (pathname === href || pathname.startsWith(href + "/")) &&
                  !(href === "/crm/settings" && pathname.startsWith("/crm/settings/social-ai"));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                <span className="flex-1">{label}</span>
                {href === "/crm/social/inbox" && unread > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#E63B2E] text-white text-[10px] font-bold flex items-center justify-center">{badgeText(unread)}</span>
                )}
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
              className="text-white/20 hover:text-white/60 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 7h7M9 5l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom tab bar — mobile only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f0f] border-t border-white/[0.06] flex pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors ${
                active ? "text-[#E63B2E]" : "text-white/30"
              }`}
            >
              <span className="relative text-base leading-none">
                {href.includes("dashboard") ? "▦" :
                 href.includes("leads") ? "◎" :
                 href.includes("pipeline") ? "▤" : "✉"}
                {href === "/crm/social/inbox" && unread > 0 && (
                  <span className="absolute -top-1.5 -right-3 min-w-4 h-4 px-1 rounded-full bg-[#E63B2E] text-white text-[9px] font-bold flex items-center justify-center">{badgeText(unread)}</span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
