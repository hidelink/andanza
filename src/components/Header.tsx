import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-teal-50 text-brand-teal-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="19" r="2" />
              <circle cx="18" cy="5" r="2" />
              <path d="M8 19h7a4 4 0 0 0 4-4v-1a4 4 0 0 0-4-4H9a4 4 0 0 1-4-4v-1" />
            </svg>
          </span>
          <span className="text-[15px] font-medium">Andanza</span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <Link
              href="/ajustes"
              className="text-sm text-text-secondary hover:text-text-primary"
            >
              Ajustes
            </Link>
            <SignOutButton />
          </div>
        )}
      </div>
    </header>
  );
}
