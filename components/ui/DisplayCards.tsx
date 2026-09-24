"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, Zap } from "lucide-react";

/**
 * DisplayCards · mazzo di tre card sfalsate.
 * Toccando (o cliccando) una card, questa viene sfilata, sollevata e posata
 * davanti; le altre scalano di un posto verso il fondo. Su touch il mazzo
 * gira da solo finché l'utente non tocca una card.
 */

interface CardData {
  icon:        React.ReactNode;
  title:       string;
  description: string;
  date:        string;
  iconBg:      string;
  accent:      string;
}

const CARDS: CardData[] = [
  {
    icon:        <Sparkles className="size-4 text-ivory" />,
    title:       "Mestiere",
    description: "Codice scritto a mano",
    date:        "Sempre",
    iconBg:      "bg-rosewood",
    accent:      "text-rosewood",
  },
  {
    icon:        <Zap className="size-4 text-ivory" />,
    title:       "Velocità",
    description: "Dieci giorni, non tre mesi",
    date:        "Consegna media",
    iconBg:      "bg-burgundy",
    accent:      "text-burgundy",
  },
  {
    icon:        <TrendingUp className="size-4 text-ivory" />,
    title:       "Onestà",
    description: "Prezzi pubblici, tempi reali",
    date:        "Sempre",
    iconBg:      "bg-obsidian",
    accent:      "text-obsidian",
  },
];

/** Intervallo del giro automatico su touch (ms) */
const CYCLE_MS = 3500;

/** Durata dello "sfila e posa" della card scelta (s) */
const LIFT_S = 0.72;
/** Momento (0–1) in cui la card, ormai sollevata sopra il mazzo, passa davanti alle altre */
const RAISE_AT = 0.42;
/** Quanto sale la card sfilata sopra la sua posizione di partenza (px, ~70% dell'altezza) */
const RISE_PX = 100;

/** Molla morbida: si assesta senza rimbalzi finti */
const spring = { type: "spring", stiffness: 170, damping: 24, mass: 0.9 } as const;

/** Posizione nel mazzo: 0 = in fondo, n-1 = davanti */
function slotStyle(slot: number, n: number, step: { x: number; y: number }) {
  const depth = n - 1 - slot; // 0 davanti, cresce verso il fondo
  return {
    x:     slot * step.x,
    y:     slot * step.y,
    scale: 1 - depth * 0.035,
  };
}

export default function DisplayCards() {
  const n = CARDS.length;
  const reduced = useReducedMotion();

  // order[k] = indice della card nella posizione k (0 = fondo, n-1 = davanti)
  const [order, setOrder]     = useState<number[]>(() => CARDS.map((_, i) => i));
  // Card in fase di "sfila e posa": da che posizione parte e se ha già superato il mazzo
  const [lift, setLift] = useState<{ card: number; fromSlot: number; raised: boolean } | null>(null);
  const raiseTimer = useRef<number | undefined>(undefined);
  const [hovered, setHovered] = useState<number | null>(null);
  const [picked, setPicked]   = useState(false);
  const [wide, setWide]       = useState(false);

  // Sfalsamento più ampio da md in su
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const step = wide ? { x: 64, y: 40 } : { x: 32, y: 32 };

  const orderRef = useRef(order);
  orderRef.current = order;

  const bringToFront = (card: number) => {
    const prev = orderRef.current;
    if (prev[prev.length - 1] === card) return;
    window.clearTimeout(raiseTimer.current);
    setLift({ card, fromSlot: prev.indexOf(card), raised: false });
    // Passa davanti solo quando è già salita sopra le altre, non prima
    raiseTimer.current = window.setTimeout(
      () => setLift(l => (l && l.card === card ? { ...l, raised: true } : l)),
      LIFT_S * RAISE_AT * 1000,
    );
    setOrder([...prev.filter(c => c !== card), card]);
  };
  useEffect(() => () => window.clearTimeout(raiseTimer.current), []);

  // Giro automatico su touch finché l'utente non sceglie: porta davanti la card in fondo
  useEffect(() => {
    if (picked || reduced) return;
    if (!window.matchMedia("(hover: none)").matches) return;
    const id = window.setInterval(() => bringToFront(orderRef.current[0]), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [picked, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center -translate-x-8 md:-translate-x-16">
      {CARDS.map((c, i) => {
        const slot   = order.indexOf(i);
        const front  = slot === n - 1;
        const target = slotStyle(slot, n, step);
        const hoverLift = hovered === i && !front ? -10 : 0;
        const isLifting = !reduced && lift?.card === i;
        const from      = isLifting ? slotStyle(lift.fromSlot, n, step) : target;
        // Mentre sale resta al suo livello; scavalca il mazzo solo a metà movimento
        const zIndex    = isLifting && !lift.raised ? lift.fromSlot + 1 : slot + 1;

        return (
          <motion.div
            key={c.title}
            role="button"
            tabIndex={0}
            aria-pressed={front}
            aria-label={`${c.title}: ${c.description}`}
            onClick={() => { setPicked(true); bringToFront(i); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPicked(true); bringToFront(i); }
            }}
            onHoverStart={() => setHovered(i)}
            onHoverEnd={() => setHovered(h => (h === i ? null : h))}
            style={{ zIndex }}
            initial={false}
            animate={
              isLifting
                ? {
                    // Sfila verso l'alto restando in posizione, poi si posa davanti
                    x:     [null, from.x, target.x],
                    y:     [null, from.y - RISE_PX, target.y],
                    scale: [null, from.scale * 1.02, target.scale],
                    skewY: -8,
                  }
                : { x: target.x, y: target.y + hoverLift, scale: target.scale, skewY: -8 }
            }
            transition={
              reduced
                ? { duration: 0 }
                : isLifting
                  ? { duration: LIFT_S, times: [0, RAISE_AT, 1], ease: [0.3, 0, 0.2, 1] }
                  // Le altre scalano indietro mentre la scelta sta salendo
                  : { ...spring, delay: lift ? 0.12 + (n - 1 - slot) * 0.06 : 0 }
            }
            onAnimationComplete={() => { if (isLifting) setLift(null); }}
            data-front={front}
            className={cn(
              "[grid-area:stack] relative flex h-36 w-[17rem] sm:w-[22rem] select-none flex-col justify-between rounded-xl border-2 bg-ivory px-4 py-3 cursor-pointer outline-none",
              "transition-[border-color,box-shadow,filter] duration-500 ease-out focus-visible:ring-2 focus-visible:ring-rosewood",
              "[&>*]:flex [&>*]:items-center [&>*]:gap-2",
              front
                ? "border-rosewood/40 shadow-atelier-lg grayscale-0"
                : "border-obsidian/15 shadow-atelier",
              !front && (slot === 0 ? "grayscale-[80%]" : "grayscale-[50%]"),
            )}
          >
            {/* Velo sulle card dietro: le spinge "fuori fuoco" */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl bg-ivory transition-opacity duration-500 ease-out"
              style={{ opacity: front ? 0 : slot === 0 ? 0.45 : 0.3 }}
            />
            {/* Sfumatura a destra solo sulle card dietro */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-1 top-[-5%] h-[110%] w-[14rem] sm:w-[20rem] bg-gradient-to-l from-ivory to-transparent transition-opacity duration-500 ease-out"
              style={{ opacity: front ? 0 : 1 }}
            />

            <div className="relative">
              <span className={cn("relative inline-flex items-center justify-center rounded-full p-1.5", c.iconBg)}>
                {c.icon}
              </span>
              <p
                className={cn("text-lg", c.accent)}
                style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, letterSpacing: "-0.015em", textTransform: "uppercase" }}
              >
                {c.title}
              </p>
            </div>
            <p
              className="relative whitespace-nowrap text-obsidian"
              style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1.0625rem", lineHeight: 1.35 }}
            >
              {c.description}
            </p>
            <p
              className="relative text-obsidian/40"
              style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.625rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              {c.date}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
