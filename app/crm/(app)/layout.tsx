import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/crm/Sidebar";
import { MobileNav } from "@/components/crm/MobileNav";
import type { Profile } from "@/lib/supabase/types";

export const metadata = {
  title: "CRM — Dieci Bottega",
  robots: { index: false, follow: false },
};

export default async function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/crm/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      {/* Desktop sidebar */}
      <Sidebar profile={profile} />
      {/* Mobile top bar + drawer + bottom tabs */}
      <MobileNav profile={profile} />
      {/* Main content */}
      <main className="lg:pl-[220px] min-h-screen pt-[56px] pb-[64px] lg:pt-0 lg:pb-0">
        <div className="max-w-[1400px] mx-auto px-4 py-5 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
