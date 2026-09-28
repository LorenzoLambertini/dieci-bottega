"use client";

import { useState } from "react";

export function CopyField({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex gap-2">
      <input readOnly value={value} onFocus={(e) => e.target.select()} className="flex-1 min-w-0 bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white/60 text-xs font-mono" />
      <button
        type="button"
        onClick={() => { navigator.clipboard?.writeText(value); setDone(true); setTimeout(() => setDone(false), 1500); }}
        className="shrink-0 bg-white/[0.08] hover:bg-white/[0.14] text-white/80 text-xs font-semibold rounded-lg px-3"
      >
        {done ? "Copiato ✓" : "Copia"}
      </button>
    </div>
  );
}
