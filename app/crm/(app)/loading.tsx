/** Scheletro mostrato subito durante la navigazione tra le pagine del CRM. */
export default function CrmLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Caricamento">
      <div className="h-7 w-48 bg-white/[0.06] rounded-lg mb-2" />
      <div className="h-4 w-72 bg-white/[0.04] rounded mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-[#141414] border border-white/[0.06] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-72 bg-[#141414] border border-white/[0.06] rounded-xl" />
        <div className="h-72 bg-[#141414] border border-white/[0.06] rounded-xl" />
      </div>
    </div>
  );
}
