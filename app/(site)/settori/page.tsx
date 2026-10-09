import Link from "next/link";
import type { Metadata } from "next";
import { SECTORS } from "@/lib/sectors";

export const metadata: Metadata = {
  title: "Siti web per settore a Bologna | Dieci Bottega",
  description:
    "Cosa deve avere il sito della tua attività: ristoranti, B&B, studi professionali, palestre, estetiste, artigiani, negozi, agenzie immobiliari e pet sitter.",
  alternates: { canonical: "/settori" },
};

const VARIANTS = ["bg-rosewood text-ivory", "bg-obsidian text-rosewood", "bg-ivory text-rosewood border border-obsidian/10"];

export default function SettoriPage() {
  return (
    <div className="blog-body pt-16 lg:pt-[72px] bg-ivory text-obsidian">
      <section className="mx-auto max-w-[1480px] px-6 lg:px-12 pt-12 lg:pt-20 pb-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-rosewood mb-6">Siti web per settore</p>
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-14">
          <h1 className="lg:col-span-7 font-archivo font-black uppercase tracking-tight text-5xl sm:text-6xl lg:text-8xl leading-[0.9]">
            Ogni lavoro<br /><span className="text-obsidian/40">ha il suo sito.</span>
          </h1>
          <p className="lg:col-span-5 text-obsidian/65 text-lg leading-relaxed">
            Un ristorante, uno studio e un idraulico non hanno bisogno dello stesso sito. Qui trovi cosa serve davvero
            nel tuo settore, quanto costa e quanto tempo ci vuole.
          </p>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {SECTORS.map((s, i) => (
            <li key={s.slug}>
              <Link href={`/settori/${s.slug}`} className="group block">
                <div className={`relative aspect-[16/9] overflow-hidden flex items-end justify-end p-5 mb-4 ${VARIANTS[i % 3]}`}>
                  <span className="absolute top-4 left-5 font-mono text-[10px] uppercase tracking-[0.16em] opacity-60">Dieci Bottega · Settori</span>
                  <span className="font-archivo font-black uppercase leading-none tracking-tight text-6xl lg:text-7xl transition-transform duration-500 group-hover:scale-105">{s.glyph}</span>
                </div>
                <h2 className="font-archivo font-black uppercase tracking-tight text-xl leading-tight group-hover:text-rosewood transition-colors">
                  Sito web per {s.name}
                </h2>
                <p className="text-obsidian/60 mt-2 leading-relaxed">{s.intro}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
