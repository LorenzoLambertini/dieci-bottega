import Link from "next/link";
import { redirect } from "next/navigation";
import { getCrmUser } from "@/lib/social-ai/auth";
import { CsvImport } from "@/components/crm/CrmTools";

export default async function ImportPage() {
  const user = await getCrmUser();
  if (user?.role !== "admin") redirect("/crm/leads");
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-white/30 mb-6">
        <Link href="/crm/leads" className="hover:text-white/60 transition-colors">Lead</Link>
        <span>/</span>
        <span className="text-white/60">Importa</span>
      </div>
      <h1 className="text-white text-2xl font-bold mb-1">Importa contatti</h1>
      <p className="text-white/40 text-sm mb-6">Da un file CSV (Excel, Google Sheets, un altro CRM). Fino a 2000 righe per volta.</p>
      <CsvImport />
    </div>
  );
}
