import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

export interface CrmUser {
  id: string;
  email: string;
  role: UserRole;
}

/** Verifica sessione CRM (stesso sistema di autenticazione esistente: Supabase Auth + profiles). */
export async function getCrmUser(): Promise<CrmUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("id, email, role").eq("id", user.id).maybeSingle<{ id: string; email: string; role: UserRole }>();
  return profile ?? null;
}

export async function requireCrmUser(roles?: UserRole[]): Promise<CrmUser> {
  const u = await getCrmUser();
  if (!u) throw new Error("Non autenticato");
  if (roles && !roles.includes(u.role)) throw new Error("Permessi insufficienti");
  return u;
}
