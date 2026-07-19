import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function generateToken(): string {
  return randomBytes(24).toString("hex");
}

export async function getOrCreateShareToken(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: existing, error: findError } = await supabase
    .from("share_tokens")
    .select("token")
    .eq("user_id", user.id)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing.token;

  const token = generateToken();
  const { error } = await supabase.from("share_tokens").insert({ user_id: user.id, token });
  if (error) throw error;
  return token;
}

export async function regenerateShareToken(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const token = generateToken();
  const { error } = await supabase
    .from("share_tokens")
    .upsert({ user_id: user.id, token }, { onConflict: "user_id" });
  if (error) throw error;
  return token;
}

export async function resolveUserIdFromToken(token: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("share_tokens")
    .select("user_id")
    .eq("token", token)
    .maybeSingle();

  if (error) throw error;
  return data?.user_id ?? null;
}
