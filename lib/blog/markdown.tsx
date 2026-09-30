/**
 * Markdown minimale per gli articoli del blog, reso come componenti React
 * (niente HTML iniettato). Supporta: ## e ### (con ancore per l'indice),
 * paragrafi, elenchi puntati e numerati, > note in evidenza, tabelle,
 * **grassetto**, *corsivo*, `codice` e [link](url) (interni con next/link).
 */
import Link from "next/link";
import type { ReactNode } from "react";

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const stripInline = (s: string) => s.replace(/\*\*|\*|`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

/** Titoli di secondo livello per l'indice dell'articolo. */
export function extractHeadings(md: string): { id: string; text: string }[] {
  return md
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const text = stripInline(l.slice(3).trim());
      return { id: slugifyHeading(text), text };
    });
}

export function countWords(md: string): number {
  return stripInline(md).split(/\s+/).filter(Boolean).length;
}

/* ─── Inline ──────────────────────────────────────────────── */

export function inline(text: string, keyPrefix = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyPrefix}-${n++}`;
    if (m[2]) out.push(<strong key={k} className="font-semibold text-obsidian">{m[2]}</strong>);
    else if (m[3]) out.push(<em key={k}>{m[3]}</em>);
    else if (m[4]) out.push(<code key={k} className="font-mono text-[0.9em] bg-obsidian/[0.06] px-1.5 py-0.5 rounded">{m[4]}</code>);
    else if (m[5] && m[6]) {
      const href = m[6];
      out.push(
        href.startsWith("/") ? (
          <Link key={k} href={href} className="text-rosewood underline underline-offset-4 decoration-rosewood/40 hover:decoration-rosewood">{m[5]}</Link>
        ) : (
          <a key={k} href={href} target="_blank" rel="noopener noreferrer" className="text-rosewood underline underline-offset-4 decoration-rosewood/40 hover:decoration-rosewood">{m[5]}</a>
        )
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/* ─── Blocchi ─────────────────────────────────────────────── */

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  const isBlockStart = (l: string) => /^(#{2,3} |- |\d+\. |> |\|)/.test(l);

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const k = `b${key++}`;

    if (line.startsWith("### ")) {
      const t = line.slice(4).trim();
      blocks.push(<h3 key={k} id={slugifyHeading(stripInline(t))} className="font-archivo font-bold text-obsidian text-xl lg:text-2xl mt-10 mb-3 scroll-mt-28">{inline(t, k)}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      const t = line.slice(3).trim();
      blocks.push(
        <h2 key={k} id={slugifyHeading(stripInline(t))} className="font-archivo font-black uppercase tracking-tight text-obsidian text-2xl lg:text-[2rem] leading-tight mt-14 mb-4 scroll-mt-28">
          {inline(t, k)}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) items.push(lines[i++].slice(2));
      blocks.push(
        <ul key={k} className="my-5 space-y-2.5">
          {items.map((it, j) => (
            <li key={j} className="relative pl-6">
              <span className="absolute left-0 top-[0.7em] w-2.5 h-px bg-rosewood" aria-hidden />
              {inline(it, `${k}-${j}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) items.push(lines[i++].replace(/^\d+\. /, ""));
      blocks.push(
        <ol key={k} className="my-5 space-y-3 counter-reset">
          {items.map((it, j) => (
            <li key={j} className="relative pl-10">
              <span className="absolute left-0 top-0 font-mono text-xs text-rosewood border border-rosewood/40 w-7 h-7 flex items-center justify-center">{String(j + 1).padStart(2, "0")}</span>
              {inline(it, `${k}-${j}`)}
            </li>
          ))}
        </ol>
      );
      continue;
    }
    if (line.startsWith("> ")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) parts.push(lines[i++].slice(2));
      blocks.push(
        <aside key={k} className="my-8 border-l-2 border-rosewood bg-rosewood/[0.06] px-5 py-4 text-obsidian/85">
          {parts.map((p, j) => (
            <p key={j} className={j ? "mt-2" : ""}>{inline(p, `${k}-${j}`)}</p>
          ))}
        </aside>
      );
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      blocks.push(
        <div key={k} className="my-8 overflow-x-auto border border-obsidian/10">
          <table className="w-full text-sm">
            <thead className="bg-obsidian text-ivory">
              <tr>{head.map((h, j) => <th key={j} className="text-left font-mono text-[11px] uppercase tracking-wider px-4 py-3">{inline(h, `${k}-h${j}`)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="border-t border-obsidian/10 odd:bg-white/40">
                  {r.map((c, ci) => <td key={ci} className="px-4 py-3 align-top">{inline(c, `${k}-${ri}-${ci}`)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    // paragrafo: righe consecutive fino a riga vuota o nuovo blocco
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) para.push(lines[i++].trim());
    blocks.push(<p key={k} className="my-5">{inline(para.join(" "), k)}</p>);
  }
  return <>{blocks}</>;
}
