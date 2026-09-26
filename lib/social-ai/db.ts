import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Client con la sessione dell'utente CRM (RLS attiva), non tipizzato:
 * le tabelle Social AI non fanno parte del tipo `Database` generato.
 */
export async function createSocialClient(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient;
}
