import Link from "next/link";
import { NewLeadForm } from "@/components/crm/LeadTools";

export default function NewLeadPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-white/30 mb-6">
        <Link href="/crm/leads" className="hover:text-white/60 transition-colors">Lead</Link>
        <span>/</span>
        <span className="text-white/60">Nuovo contatto</span>
      </div>
      <h1 className="text-white text-2xl font-bold mb-1">Nuovo contatto</h1>
      <p className="text-white/40 text-sm mb-6">Se l&apos;email esiste già, ti porto al contatto esistente invece di creare un doppione.</p>
      <NewLeadForm />
    </div>
  );
}
