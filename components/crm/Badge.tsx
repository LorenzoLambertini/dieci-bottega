import type { LeadStatus } from "@/lib/supabase/types";

const STATUS_MAP: Record<
  LeadStatus,
  { label: string; className: string }
> = {
  new: { label: "Nuovo", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  contacted: { label: "Contattato", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  qualified: { label: "Qualificato", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  proposal: { label: "Proposta", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  won: { label: "Vinto", className: "bg-green-500/10 text-green-400 border-green-500/20" },
  lost: { label: "Perso", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { label, className } = STATUS_MAP[status] ?? {
    label: status,
    className: "bg-white/10 text-white/40 border-white/10",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide ${className}`}
    >
      {label}
    </span>
  );
}
