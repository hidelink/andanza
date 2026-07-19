import { createClient } from "@supabase/supabase-js";

// Service-role client for the token-authenticated share endpoint, which has
// no browser session/cookies to derive a normal RLS-scoped client from.
// Every function that uses this MUST filter/set rows by an explicitly
// resolved user_id — it bypasses RLS entirely.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
