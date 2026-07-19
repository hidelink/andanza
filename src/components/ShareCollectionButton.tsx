"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { setCollectionPublicAction } from "@/lib/actions";

export function ShareCollectionButton({
  collectionId,
  initialIsPublic,
}: {
  collectionId: string;
  initialIsPublic: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/compartido/${collectionId}` : "";

  async function toggle() {
    setUpdating(true);
    const next = !isPublic;
    await setCollectionPublicAction(collectionId, next);
    setIsPublic(next);
    setUpdating(false);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        Compartir
      </Button>

      {open && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5">
            <p className="mb-3 text-sm font-medium">Compartir colección</p>

            <div className="mb-3 flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5">
              <span className="text-sm">
                {isPublic ? "Cualquiera con el link puede verla" : "Colección privada"}
              </span>
              <button
                onClick={toggle}
                disabled={updating}
                role="switch"
                aria-checked={isPublic}
                className={`relative h-6 w-10 flex-none rounded-full transition-colors ${
                  isPublic ? "bg-brand-teal-600" : "bg-border-strong"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    isPublic ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {isPublic && (
              <div className="mb-3">
                <label className="mb-1 block text-xs text-text-muted">
                  Link para compartir (solo lectura)
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    onClick={(event) => event.currentTarget.select()}
                    className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
                  />
                  <Button onClick={copyLink}>{copied ? "Copiado" : "Copiar"}</Button>
                </div>
              </div>
            )}

            <button
              onClick={() => setOpen(false)}
              className="mt-1 w-full py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
