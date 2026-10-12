"use client";

/** Galleria orizzontale delle pagine del brand book: scorre con dito, rotella o frecce; ogni pagina apre il PDF a quella pagina. */
import Image from "next/image";
import { useRef } from "react";

export default function BookGallery({ slug, name, pages, fg, line }: { slug: string; name: string; pages: { page: string; title: string }[]; fg: string; line: string }) {
  const track = useRef<HTMLUListElement>(null);
  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 640), behavior: "smooth" });
  };
  const btn = "w-11 h-11 grid place-items-center border text-lg transition-opacity duration-200 hover:opacity-70";
  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button type="button" onClick={() => go(-1)} aria-label="Pagine precedenti" className={btn} style={{ borderColor: line, color: fg }}>←</button>
        <button type="button" onClick={() => go(1)} aria-label="Pagine successive" className={btn} style={{ borderColor: line, color: fg }}>→</button>
      </div>
      <ul ref={track} className="flex gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 lg:-mx-12 lg:px-12 [scrollbar-width:thin]" aria-label={`Pagine del brand book di ${name}`}>
        {pages.map((p) => (
          <li key={p.page} className="snap-start shrink-0 w-[82vw] sm:w-[520px] lg:w-[620px]">
            <a href={`/concept/${slug}/brand-identity.pdf#page=${Number(p.page)}`} target="_blank" rel="noopener" className="group block">
              <span className="block relative aspect-video overflow-hidden rounded-[4px] ring-1 ring-white/10 shadow-[0_18px_50px_-18px_rgba(0,0,0,.6)]">
                <Image src={`/concept/${slug}/book/${p.page}.webp`} alt={`Brand book di ${name}, pagina ${Number(p.page)}: ${p.title}`} fill sizes="(min-width: 1024px) 620px, (min-width: 640px) 520px, 82vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              </span>
              <span className="flex justify-between gap-4 mt-3 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: fg }}>
                <span>{p.title}</span>
                <span className="opacity-60">p. {Number(p.page)} ↗</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
