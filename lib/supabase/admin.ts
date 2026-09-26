import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase con service role — SOLO server-side (webhook, AI engine).
 * Bypassa RLS: non passarlo mai a componenti client.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY mancanti");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
