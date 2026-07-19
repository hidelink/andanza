"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { createPlaceAutoAction } from "@/lib/actions";
import { extractInstagramUrl } from "@/lib/instagramUrl";

type Step = "processing" | "error" | "duplicate" | "not-found";

type DuplicateInfo = {
  name: string;
  collectionId: string;
};

export function ShareTargetClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(null);
  const [reelUrl, setReelUrl] = useState("");

  useEffect(() => {
    const combined = [
      searchParams.get("url"),
      searchParams.get("text"),
      searchParams.get("title"),
    ]
      .filter(Boolean)
      .join(" ");

    const url = extractInstagramUrl(combined);
    if (!url) {
      setStep("not-found");
      return;
    }

    setReelUrl(url);
    void run(url, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(url: string, force: boolean) {
    setStep("processing");
    try {
      const response = await fetch("/api/reels/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, force }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo extraer el reel");

      if (data.duplicate) {
        setDuplicateInfo({ name: data.existingPlaceName, collectionId: data.existingCollectionId });
        setStep("duplicate");
        return;
      }

      const collectionId = await createPlaceAutoAction({
        name: data.extractionFailed ? "Reel pendiente de revisar" : data.name,
        description: data.extractionFailed ? "" : data.description,
        locationStatus: data.extractionFailed ? "inferred" : data.locationStatus,
        sourceReelUrl: url,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        country: data.country ?? null,
        region: data.region ?? null,
        needsReview: Boolean(data.extractionFailed),
      });
      router.push(`/colecciones/${collectionId}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
      setStep("error");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      {step === "processing" && (
        <p className="text-sm text-text-secondary">
          Recibimos tu reel, lo estamos analizando (transcribiendo audio, ubicación y país)…
        </p>
      )}

      {step === "not-found" && (
        <p className="text-sm text-brand-coral-600">
          No encontramos un link de Instagram en lo que compartiste.
        </p>
      )}

      {step === "error" && (
        <div>
          <p className="mb-3 text-sm text-brand-coral-600">{errorMessage}</p>
          {reelUrl && <Button onClick={() => run(reelUrl, false)}>Intentar de nuevo</Button>}
        </div>
      )}

      {step === "duplicate" && duplicateInfo && (
        <div>
          <p className="mb-3 text-sm text-text-secondary">
            Ya habías agregado este reel como{" "}
            <span className="font-medium text-text-primary">{duplicateInfo.name}</span>.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/colecciones/${duplicateInfo.collectionId}`)}>
              Ver ese lugar
            </Button>
            <Button onClick={() => run(reelUrl, true)}>Agregar de todas formas</Button>
          </div>
        </div>
      )}
    </div>
  );
}
