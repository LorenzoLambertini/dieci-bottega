"use client";

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
}

function DisplayCard({
  className,
  icon       = <Sparkles className="size-4 text-ivory" />,
  title      = "Featured",
  description= "Discover amazing content",
  date       = "Adesso",
  iconBg     = "bg-rosewood",
  accent     = "text-rosewood",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 border-obsidian/15 bg-ivory/95 backdrop-blur-sm px-4 py-3 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-ivory after:to-transparent after:content-[''] hover:border-rosewood/40 hover:bg-ivory [&>*]:flex [&>*]:items-center [&>*]:gap-2 shadow-atelier",
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

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaults: DisplayCardProps[] = [
    {
      icon:        <Sparkles className="size-4 text-ivory" />,
      title:       "Mestiere",
      description: "Codice scritto a mano",
      date:        "Sempre",
      iconBg:      "bg-rosewood",
      accent:      "text-rosewood",
      className:   "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-obsidian/15 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-ivory/40 grayscale-[80%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon:        <Zap className="size-4 text-ivory" />,
      title:       "Velocità",
      description: "Dieci giorni, non tre mesi",
      date:        "Consegna media",
      iconBg:      "bg-burgundy",
      accent:      "text-burgundy",
      className:   "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-obsidian/15 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-ivory/40 grayscale-[60%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon:        <TrendingUp className="size-4 text-ivory" />,
      title:       "Onestà",
      description: "Prezzi pubblici, tempi reali",
      date:        "Sempre",
      iconBg:      "bg-obsidian",
      accent:      "text-obsidian",
      className:   "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const items = cards ?? defaults;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {items.map((c, i) => <DisplayCard key={i} {...c} />)}
    </div>
  );
}
