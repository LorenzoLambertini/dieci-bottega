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
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-[#0f0f0f] border-r border-white/[0.06] flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E63B2E] flex items-center justify-center shrink-0">
            <span className="text-white font-black text-xs tracking-tight">10</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">Dieci Bottega</p>
            <p className="text-white/30 text-[10px] leading-none mt-0.5">CRM interno</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
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
