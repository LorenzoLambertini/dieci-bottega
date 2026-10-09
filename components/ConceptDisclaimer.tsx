import { CONCEPT_DISCLAIMER } from "@/lib/concepts";

/** Dicitura obbligatoria su ogni pagina dei concept: ben visibile, mai nel footer. */
export default function ConceptDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p role="note" className={`inline-flex items-center gap-2 bg-[#F2B8A2] text-obsidian px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] ${className}`}>
      <span aria-hidden>◆</span> {CONCEPT_DISCLAIMER}
    </p>
  );
}
