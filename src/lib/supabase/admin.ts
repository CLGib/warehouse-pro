import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalForSb = globalThis as unknown as {
  supabaseAdmin: SupabaseClient | undefined;
};

/**
 * Server-only client with the service role key. Bypasses RLS; use only in API routes,
 * server components, and auth callbacks — never in the browser.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  if (!globalForSb.supabaseAdmin) {
    globalForSb.supabaseAdmin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return globalForSb.supabaseAdmin;
}

export function newRowId(): string {
  return randomUUID();
}
