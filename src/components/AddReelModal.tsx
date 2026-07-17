"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { createPlaceAction } from "@/lib/actions";
import type { LocationStatus } from "@/lib/types";

type Step = "closed" | "form" | "processing" | "review" | "saving" | "error";

type Extracted = {
  name: string;
  description: string;
  locationStatus: LocationStatus;
  lat: number | null;
  lng: number | null;
};

export function AddReelModal({ collectionId }: { collectionId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("closed");
  const [url, setUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function close() {
    setStep("closed");
  }

  async function extract() {
    if (!url.trim()) return;
    setStep("processing");
    try {
      const response = await fetch("/api/reels/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo extraer el reel");

      setExtracted({
        name: data.name,
        description: data.description,
        locationStatus: data.locationStatus,
        lat: data.lat,
        lng: data.lng,
      });
      setName(data.name);
      setDescription(data.description);
      setStep("review");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
      setStep("error");
    }
  }

  async function save() {
    if (!extracted) return;
    setStep("saving");
    await createPlaceAction(collectionId, {
      name,
      description,
      locationStatus: extracted.locationStatus,
      sourceReelUrl: url.trim(),
      lat: extracted.lat,
      lng: extracted.lng,
    });
    router.refresh();
    setUrl("");
    setExtracted(null);
    close();
  }

  return (
    <>
      <Button onClick={() => setStep("form")}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Agregar reel
      </Button>

      {step !== "closed" && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5">
            {step === "form" && (
              <div>
                <p className="mb-3 text-sm font-medium">Agregar reel</p>
                <input
                  type="text"
                  placeholder="https://www.instagram.com/reel/..."
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-border-strong"
                />
                <Button onClick={extract} className="mt-3 w-full justify-center">
                  Extraer datos
                </Button>
                <button
                  onClick={close}
                  className="mt-2 w-full py-2 text-sm text-text-secondary hover:text-text-primary"
                >
                  Cancelar
                </button>
              </div>
            )}

            {step === "processing" && (
              <div className="py-6 text-center">
                <p className="text-sm text-text-secondary">
                  Analizando reel: transcribiendo audio y ubicación…
                </p>
              </div>
            )}

            {step === "error" && (
              <div>
                <p className="mb-3 text-sm font-medium">No se pudo extraer el reel</p>
                <p className="mb-3 text-sm text-brand-coral-600">{errorMessage}</p>
                <Button onClick={() => setStep("form")} className="w-full justify-center">
                  Intentar de nuevo
                </Button>
                <button
                  onClick={close}
                  className="mt-2 w-full py-2 text-sm text-text-secondary hover:text-text-primary"
                >
                  Cancelar
                </button>
              </div>
            )}

            {(step === "review" || step === "saving") && extracted && (
              <div>
                <p className="mb-3 text-sm font-medium">Revisa antes de guardar</p>
                <label className="mb-1 block text-xs text-text-muted">
                  Nombre del lugar
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mb-2 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-border-strong"
                />
                <label className="mb-1 block text-xs text-text-muted">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="mb-3 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-border-strong"
                />
                <div className="mb-3">
                  {extracted.locationStatus === "confirmed" ? (
                    <Badge tone="success">Ubicación confirmada</Badge>
                  ) : (
                    <Badge tone="warning">Ubicación inferida, revisar</Badge>
                  )}
                </div>
                <Button
                  onClick={save}
                  disabled={step === "saving"}
                  className="w-full justify-center"
                >
                  {step === "saving" ? "Guardando…" : "Guardar lugar"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
