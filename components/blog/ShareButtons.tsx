"use client";

/**
 * Condivisione dell'articolo: WhatsApp, Facebook, LinkedIn, X, Telegram, email, copia link.
 * Instagram non ha un link di condivisione per il web: su telefono si usa il menu di
 * condivisione del sistema (che include Instagram), altrimenti si copia il link.
 */
import { useState } from "react";
import { SocialIcon } from "@/components/crm/social/icons";

export function ShareButtons({ url, title, compact = false }: { url: string; title: string; compact?: boolean }) {
  const [msg, setMsg] = useState<string | null>(null);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { id: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { id: "x", label: "X", href: `https://x.com/intent/post?text=${t}&url=${u}` },
    { id: "telegram", label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}` },
  ];

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 3500);
  };
  const copy = async (m = "Link copiato") => {
    try {
      await navigator.clipboard.writeText(url);
      flash(m);
    } catch {
      flash(url);
    }
  };
  const instagram = async () => {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title, url });
        return;
      } catch {
        /* condivisione annullata */
      }
    }
    copy("Link copiato: incollalo in una storia o in un DM su Instagram");
  };

  const btn =
    "w-10 h-10 flex items-center justify-center border border-obsidian/15 text-obsidian/70 hover:bg-obsidian hover:text-ivory hover:border-obsidian transition-colors duration-200";

  return (
    <div className="space-y-2">
      {!compact && <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-obsidian/45">Condividi l&apos;articolo</p>}
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`Condividi su ${l.label}`} title={l.label} className={btn}>
            <SocialIcon platform={l.id} className="w-4 h-4" />
          </a>
        ))}
        <button type="button" onClick={instagram} aria-label="Condividi su Instagram" title="Instagram" className={btn}>
          <SocialIcon platform="instagram" className="w-4 h-4" />
        </button>
        <a href={`mailto:?subject=${t}&body=${encodeURIComponent(`${title}\n${url}`)}`} aria-label="Condividi via email" title="Email" className={btn}>
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="1.5" />
            <path d="m3.5 6 8.5 7 8.5-7" />
          </svg>
        </a>
        <button type="button" onClick={() => copy()} aria-label="Copia link" title="Copia link" className={btn}>
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
            <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
          </svg>
        </button>
      </div>
      {msg && <p className="font-mono text-[11px] text-rosewood" role="status">{msg}</p>}
    </div>
  );
}
