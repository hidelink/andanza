import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export function SignOutButton() {
  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <form action={signOut}>
      <button
        type="submit"
        aria-label="Cerrar sesión"
        className="flex items-center rounded-lg p-1.5 text-text-secondary hover:bg-surface-2 hover:text-text-primary"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5M21 12H9" />
        </svg>
      </button>
    </form>
  );
}
