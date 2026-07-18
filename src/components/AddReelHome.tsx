"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { createPlaceAutoAction } from "@/lib/actions";
import type { LocationStatus } from "@/lib/types";

type Step = "idle" | "processing" | "review" | "saving" | "error";

type Extracted = {
  name: string;
  description: string;
  locationStatus: LocationStatus;
  lat: number | null;
  lng: number | null;
  country: string | null;
  region: string | null;
};

export function AddReelHome() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [url, setUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function reset() {
    setStep("idle");
    setUrl("");
    setExtracted(null);
    setErrorMessage("");
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
        country: data.country,
        region: data.region,
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
    const collectionId = await createPlaceAutoAction({
      name,
      description,
      locationStatus: extracted.locationStatus,
      sourceReelUrl: url.trim(),
      lat: extracted.lat,
      lng: extracted.lng,
      country: extracted.country,
      region: extracted.region,
    });
    router.push(`/colecciones/${collectionId}`);
  }

  const destinationLabel = extracted?.country?.trim() || "Sin país detectado";

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      {step === "idle" && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Pega el link de tu reel de Instagram…"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-border-strong"
          />
          <Button onClick={extract} className="justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Agregar reel
          </Button>
        </div>
      )}

      {step === "processing" && (
        <p className="py-1.5 text-sm text-text-secondary">
          Analizando reel: transcribiendo audio, ubicación y país…
        </p>
      )}

      {step === "error" && (
        <div>
          <p className="mb-3 text-sm text-brand-coral-600">{errorMessage}</p>
          <div className="flex gap-2">
            <Button onClick={extract}>Intentar de nuevo</Button>
            <button
              onClick={reset}
              className="px-1 text-sm text-text-secondary hover:text-text-primary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {(step === "review" || step === "saving") && extracted && (
        <div>
          <p className="mb-3 text-sm font-medium">Revisa antes de guardar</p>
          <label className="mb-1 block text-xs text-text-muted">Nombre del lugar</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mb-2 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-border-strong"
          />
          <label className="mb-1 block text-xs text-text-muted">Descripción</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="mb-3 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-border-strong"
          />
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {extracted.locationStatus === "confirmed" ? (
              <Badge tone="success">Ubicación confirmada</Badge>
            ) : (
              <Badge tone="warning">Ubicación inferida, revisar</Badge>
            )}
            <Badge tone="neutral">
              Se guardará en: {destinationLabel}
              {extracted.region ? ` · ${extracted.region}` : ""}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={step === "saving"}>
              {step === "saving" ? "Guardando…" : "Guardar lugar"}
            </Button>
            <button
              onClick={reset}
              className="px-1 text-sm text-text-secondary hover:text-text-primary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
