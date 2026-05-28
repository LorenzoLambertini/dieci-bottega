"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { getServiceBySlug } from "@/lib/services";

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
};

export default function AddToCartButton({
  slug,
  variant = "primary",
}: {
  slug: string;
  variant?: "primary" | "secondary" | "compact";
}) {
  const add = useCart(s => s.add);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const svc = getServiceBySlug(slug);
    if (!svc) return;
    add(svc);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleAdd}
        className="relative bg-obsidian text-ivory py-2 px-3 overflow-hidden group press"
        style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}
      >
        <span
          className="absolute inset-0 bg-rosewood translate-y-full group-hover:translate-y-0 transition-transform duration-400"
          style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
          aria-hidden
        />
        <span className="relative">{added ? "✓ Aggiunto" : "+ Carrello"}</span>
      </button>
    );
  }

  const isPrimary = variant === "primary";
  return (
    <button
      onClick={handleAdd}
      className={[
        "relative w-full flex items-center justify-center gap-2 overflow-hidden group press transition-colors duration-300",
        isPrimary
          ? "bg-rosewood text-ivory py-3.5 px-5"
          : "border border-obsidian/20 text-obsidian hover:border-obsidian/40 py-3.5 px-5",
      ].join(" ")}
      style={labelStyle}
    >
      <span
        className={[
          "absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500",
          isPrimary ? "bg-ivory" : "bg-obsidian",
        ].join(" ")}
        style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
        aria-hidden
      />
      <span className={`relative flex items-center gap-2 transition-colors duration-150 ${isPrimary ? "group-hover:text-obsidian" : "group-hover:text-ivory"}`}>
        {added ? (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 7L6 11L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Aggiunto al carrello</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: "0.875rem", lineHeight: 1 }}>+</span>
            <span>Aggiungi al carrello</span>
          </>
        )}
      </span>
    </button>
  );
}
