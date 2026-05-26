import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/crm/Sidebar";
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
      <Sidebar profile={profile} />
      <main className="pl-[220px] min-h-screen">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
