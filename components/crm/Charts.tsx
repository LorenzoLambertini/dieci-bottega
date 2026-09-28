/**
 * Grafici leggeri in HTML/CSS (niente librerie): colonne mensili e barre orizzontali.
 * Colori validati sul fondo scuro del CRM (#141414); tooltip al passaggio del mouse / tocco.
 */
export const CHART_BLUE = "#3987e5";
export const CHART_AQUA = "#199e70";

export interface Point {
  label: string; // es. "set"
  full: string; // es. "settembre 2026"
  value: number;
}

export function ColumnChart({ data, color = CHART_BLUE, format = (n: number) => String(n), unit }: { data: Point[]; color?: string; format?: (n: number) => string; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const maxIdx = data.findIndex((d) => d.value === max);
  const last = data.length - 1;
  return (
    <div>
      <div className="relative h-44 flex items-end gap-[2px] border-b border-white/15">
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-white/[0.06]" aria-hidden />
        {data.map((d, i) => (
          <div key={d.full} className="group relative flex-1 h-full flex items-end" tabIndex={0}>
            <div className="w-full rounded-t-[4px] transition-opacity group-hover:opacity-80" style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 2 : 0, background: color }} />
            {(i === maxIdx || i === last) && d.value > 0 && (
              <span className="absolute left-1/2 -translate-x-1/2 text-[10px] text-white/60 tabular-nums" style={{ bottom: `calc(${(d.value / max) * 100}% + 3px)` }}>{format(d.value)}</span>
            )}
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-6 hidden group-hover:block group-focus:block z-10 whitespace-nowrap bg-[#222] border border-white/10 rounded-md px-2.5 py-1.5 text-xs shadow-xl">
              <p className="text-white/50 capitalize">{d.full}</p>
              <p className="text-white font-semibold tabular-nums">{format(d.value)}{unit ? ` ${unit}` : ""}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-[2px] mt-1.5">
        {data.map((d) => <span key={d.full} className="flex-1 text-center text-[10px] text-white/30 capitalize">{d.label}</span>)}
      </div>
    </div>
  );
}

export function HBarList({ rows, color = CHART_BLUE, format = (n: number) => String(n) }: { rows: { label: string; value: number; note?: string }[]; color?: string; format?: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="group" title={`${r.label}: ${format(r.value)}${r.note ? ` · ${r.note}` : ""}`}>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="text-white/75 text-sm capitalize truncate">{r.label}</span>
            <span className="text-white/60 text-xs tabular-nums shrink-0">{format(r.value)}{r.note ? <span className="text-white/35"> · {r.note}</span> : null}</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
            <div className="h-full rounded-full group-hover:opacity-80" style={{ width: `${(r.value / max) * 100}%`, minWidth: r.value ? 4 : 0, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
