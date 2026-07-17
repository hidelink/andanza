"use server";

import { createClient } from "@/lib/supabase/server";

export async function requestMagicLink(email: string, origin: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: origin },
  });

  return { error: error?.message ?? null };
}
