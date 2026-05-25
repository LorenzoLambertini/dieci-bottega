interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export function KPICard({ label, value, sub, accent }: KPICardProps) {
  return (
    <div
      className={`
        rounded-xl border px-6 py-5
        ${accent
          ? "bg-[#E63B2E]/10 border-[#E63B2E]/20"
          : "bg-[#141414] border-white/[0.06]"
        }
      `}
    >
      <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">
        {label}
      </p>
      <p
        className={`text-3xl font-bold tabular-nums ${
          accent ? "text-[#E63B2E]" : "text-white"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-white/30 text-xs mt-1.5">{sub}</p>}
    </div>
  );
}
