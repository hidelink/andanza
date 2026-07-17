"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center pt-16 text-center">
      <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-teal-50 text-brand-teal-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="5" r="2" />
          <path d="M8 19h7a4 4 0 0 0 4-4v-1a4 4 0 0 0-4-4H9a4 4 0 0 1-4-4v-1" />
        </svg>
      </span>
      <p className="mb-1 text-base font-medium">Entrar a Andanza</p>
      <p className="mb-6 text-sm text-text-secondary">
        Te mandamos un link para entrar sin contraseña.
      </p>

      {status === "sent" ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          Revisa tu correo <span className="font-medium text-text-primary">{email}</span> y
          abre el link para entrar.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="email"
            required
            placeholder="tu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-border-strong"
          />
          <Button
            type="submit"
            disabled={status === "sending"}
            className="w-full justify-center"
          >
            {status === "sending" ? "Enviando…" : "Enviar link de acceso"}
          </Button>
          {status === "error" && (
            <p className="mt-2 text-sm text-brand-coral-600">
              No se pudo enviar el link. Intenta de nuevo.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
