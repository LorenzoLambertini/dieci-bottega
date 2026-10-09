"use client";

/**
 * Esempi di Video Spot (dati in lib/video-portfolio.ts). Ogni video si scarica
 * solo quando si preme play: in pagina c'è soltanto la copertina.
 */
import { useState } from "react";
import Link from "next/link";
import { PORTFOLIO_VIDEOS, type PortfolioVideo } from "@/lib/video-portfolio";

const label = "font-mono text-[11px] uppercase tracking-[0.16em]";

function VideoCard({ v }: { v: PortfolioVideo }) {
  const [playing, setPlaying] = useState(false);
  const vertical = v.format === "9:16";
  return (
    <figure className={vertical ? "max-w-[320px] w-full mx-auto" : ""}>
      <div className={`relative overflow-hidden bg-black ${vertical ? "aspect-[9/16]" : "aspect-video"}`}>
        {playing ? (
          <video className="absolute inset-0 h-full w-full" src={v.src} poster={v.poster} controls autoPlay playsInline preload="auto" aria-label={v.title} />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 w-full h-full cursor-pointer" aria-label={`Guarda il video: ${v.title} (${v.seconds} secondi)`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v.poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
            <span className="absolute left-4 bottom-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-rosewood text-ivory shadow-[0_10px_30px_rgba(230,59,46,0.45)] transition-transform duration-300 group-hover:scale-110">
                <svg viewBox="0 0 24 24" className="w-5 h-5 translate-x-0.5" fill="currentColor" aria-hidden>
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
                </svg>
              </span>
              <span className={`bg-obsidian/90 text-ivory px-3 py-2 ${label}`}>0:{String(v.seconds).padStart(2, "0")}</span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3">
        <p className="font-archivo font-bold text-ivory">{v.title}</p>
        <p className={`${label} text-ivory/45 mt-1`}>{v.client} · {v.format}</p>
      </figcaption>
    </figure>
  );
}

export default function VideoPortfolio() {
  const placeholders = Math.max(0, 3 - PORTFOLIO_VIDEOS.length);
  return (
    <section id="esempi" className="bg-obsidian text-ivory py-16 lg:py-24 border-b border-ivory/10">
      <div className="mx-auto max-w-[1480px] px-6 lg:px-12">
        <p className={`${label} text-rosewood mb-3`}>Esempi</p>
        <h2 className="font-archivo font-black uppercase tracking-tight text-ivory text-4xl lg:text-6xl leading-[0.9] mb-10">
          Video già fatti.
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {PORTFOLIO_VIDEOS.map((v) => <VideoCard key={v.src} v={v} />)}
          {Array.from({ length: placeholders }, (_, i) => (
            <Link key={i} href="/inizia-progetto" className="group flex flex-col justify-between aspect-video border border-dashed border-ivory/25 p-6 hover:border-rosewood transition-colors">
              <span className={`${label} text-ivory/40`}>Spazio {String(PORTFOLIO_VIDEOS.length + i + 1).padStart(2, "0")}</span>
              <span>
                <span className="block font-archivo font-black uppercase text-2xl leading-tight text-ivory group-hover:text-rosewood transition-colors">Il prossimo può essere il tuo.</span>
                <span className={`${label} text-ivory/50 mt-2 block`}>50€ ogni 30 secondi →</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
