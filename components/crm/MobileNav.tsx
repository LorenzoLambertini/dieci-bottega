"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

const NAV = [
  { href: "/crm/dashboard",    label: "Dashboard",    emoji: "▦" },
  { href: "/crm/leads",        label: "Lead",         emoji: "◎" },
  { href: "/crm/pipeline",     label: "Pipeline",     emoji: "▤" },
  { href: "/crm/automations",  label: "Automazioni",  emoji: "◷" },
  { href: "/crm/settings",     label: "Impostazioni", emoji: "◈" },
];

interface MobileNavProps {
  profile: Profile | null;
}

export function MobileNav({ profile }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
          <div className="w-7 h-7 rounded-lg bg-[#E63B2E] flex items-center justify-center">
            <span className="text-white font-black text-[10px]">10</span>
          </div>
          <span className="text-white font-semibold text-sm">Dieci Bottega</span>
        </div>
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
            <div className="w-8 h-8 rounded-lg bg-[#E63B2E] flex items-center justify-center">
              <span className="text-white font-black text-xs">10</span>
            </div>
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
          {NAV.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f0f] border-t border-white/[0.06] flex">
        {NAV.slice(0, 4).map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors ${
                active ? "text-[#E63B2E]" : "text-white/30"
              }`}
            >
              <span className="text-base leading-none">
                {href.includes("dashboard") ? "▦" :
                 href.includes("leads") ? "◎" :
                 href.includes("pipeline") ? "▤" : "◷"}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
