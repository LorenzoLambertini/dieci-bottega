import type { ReactNode } from "react";

/** Layout per pagine legali (privacy, eliminazione dati): testo leggibile, stile del sito. */
export function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: ReactNode }) {
  return (
    <div className="pt-16 lg:pt-[72px] bg-ivory text-obsidian">
      <article className="mx-auto max-w-[760px] px-6 lg:px-12 pt-20 pb-24 lg:pt-28">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-8 h-px bg-rosewood" />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-rosewood">{eyebrow}</span>
        </div>
        <h1 className="font-archivo font-black uppercase tracking-tight text-4xl lg:text-6xl leading-[0.95]">{title}</h1>
        <p className="font-mono text-xs text-obsidian/45 mt-4">Ultimo aggiornamento: {updated}</p>
        <div className="mt-12 space-y-8 text-obsidian/75 leading-relaxed [&_h2]:font-archivo [&_h2]:font-bold [&_h2]:text-obsidian [&_h2]:text-xl [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-rosewood [&_a]:underline">
          {children}
        </div>
      </article>
    </div>
  );
}
