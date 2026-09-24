"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, Zap } from "lucide-react";

interface DisplayCardProps {
  className?:      string;
  icon?:           React.ReactNode;
  title?:          string;
  description?:    string;
  date?:           string;
  iconBg?:         string;
  accent?:         string;
  active?:         boolean;
  onSelect?:       () => void;
}

function DisplayCard({
  className,
  icon       = <Sparkles className="size-4 text-ivory" />,
  title      = "Featured",
  description= "Discover amazing content",
  date       = "Adesso",
  iconBg     = "bg-rosewood",
  accent     = "text-rosewood",
  active     = false,
  onSelect,
}: DisplayCardProps) {
  return (
    <div
      data-active={active}
      onClick={onSelect}
      className={cn(
        "relative flex h-36 w-[17rem] sm:w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 border-obsidian/15 bg-ivory/95 backdrop-blur-sm px-4 py-3 transition-all duration-500 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[14rem] sm:after:w-[20rem] after:bg-gradient-to-l after:from-ivory after:to-transparent after:content-[''] hover:border-rosewood/40 hover:bg-ivory data-[active=true]:border-rosewood/40 data-[active=true]:bg-ivory data-[active=true]:shadow-atelier-lg [&>*]:flex [&>*]:items-center [&>*]:gap-2 shadow-atelier",
        className,
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
    >
      <div>
        <span className={cn("relative inline-flex items-center justify-center rounded-full p-1.5", iconBg)}>
          {icon}
        </span>
        <p
          className={cn("text-lg", accent)}
          style={{
            fontFamily:    "var(--db-archivo)",
            fontWeight:    900,
            letterSpacing: "-0.015em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </p>
      </div>
      <p
        className="whitespace-nowrap text-obsidian"
        style={{
          fontFamily: "var(--db-cardo)",
          fontStyle:  "italic",
          fontSize:   "1.0625rem",
          lineHeight: 1.35,
        }}
      >
        {description}
      </p>
      <p
        className="text-obsidian/40"
        style={{
          fontFamily:    "var(--db-jetbrains)",
          fontSize:      "0.625rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {date}
      </p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

// Velo "fuori fuoco" sulle card dietro: sparisce con hover (desktop) o quando la card è attiva (touch)
const veil =
  "before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-obsidian/15 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-ivory/40 before:left-0 before:top-0 before:transition-opacity before:duration-500 hover:before:opacity-0 data-[active=true]:before:opacity-0 hover:grayscale-0 data-[active=true]:grayscale-0";

/** Intervallo del giro automatico su touch (ms) */
const CYCLE_MS = 2600;

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaults: DisplayCardProps[] = [
    {
      icon:        <Sparkles className="size-4 text-ivory" />,
      title:       "Mestiere",
      description: "Codice scritto a mano",
      date:        "Sempre",
      iconBg:      "bg-rosewood",
      accent:      "text-rosewood",
      className:   `[grid-area:stack] grayscale-[80%] ${veil} md:hover:-translate-y-10 data-[active=true]:-translate-y-6 md:data-[active=true]:-translate-y-10`,
    },
    {
      icon:        <Zap className="size-4 text-ivory" />,
      title:       "Velocità",
      description: "Dieci giorni, non tre mesi",
      date:        "Consegna media",
      iconBg:      "bg-burgundy",
      accent:      "text-burgundy",
      className:   `[grid-area:stack] translate-x-8 translate-y-8 md:translate-x-16 md:translate-y-10 grayscale-[60%] ${veil} md:hover:-translate-y-1 data-[active=true]:translate-y-1 md:data-[active=true]:-translate-y-1`,
    },
    {
      icon:        <TrendingUp className="size-4 text-ivory" />,
      title:       "Onestà",
      description: "Prezzi pubblici, tempi reali",
      date:        "Sempre",
      iconBg:      "bg-obsidian",
      accent:      "text-obsidian",
      className:   "[grid-area:stack] translate-x-16 translate-y-16 md:translate-x-32 md:translate-y-20 md:hover:translate-y-10 data-[active=true]:translate-y-9 md:data-[active=true]:translate-y-10",
    },
  ];

  const items = cards ?? defaults;

  // Su touch (niente hover) le card si mettono a fuoco a turno; un tocco sceglie
  // la card e fa ripartire il giro da lì
  const [touch, setTouch]   = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    const noHover = window.matchMedia("(hover: none)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTouch(noHover);
    if (!noHover) return;
    setActive(a => a ?? 0);
    if (reduced) return;
    const id = window.setInterval(() => {
      setActive(a => ((a ?? -1) + 1) % items.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [items.length, cycleKey]);

  const select = (i: number) => {
    setActive(i);
    setCycleKey(k => k + 1);
  };

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 -translate-x-8 md:-translate-x-16">
      {items.map((c, i) => (
        <DisplayCard
          key={i}
          {...c}
          active={active === i}
          onSelect={touch ? () => select(i) : undefined}
        />
      ))}
    </div>
  );
}
