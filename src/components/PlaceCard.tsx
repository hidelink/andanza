"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { accentClasses, type Accent } from "@/lib/accent";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ItineraryMap } from "@/components/ItineraryMap";
import { updatePlaceAction, deletePlaceAction } from "@/lib/actions";
import type { Place } from "@/lib/data";

export function PlaceCard({
  place,
  accent,
  collectionId,
  readOnly = false,
}: {
  place: Place;
  accent: Accent;
  collectionId: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const accentClass = accentClasses[accent];

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(place.name);
  const [description, setDescription] = useState(place.description ?? "");
  const [addressQuery, setAddressQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] = useState<{
    lat: number;
    lng: number;
    formattedAddress: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  function openEdit() {
    setName(place.name);
    setDescription(place.description ?? "");
    setAddressQuery("");
    setSearchResult(null);
    setSearchError("");
    setEditing(true);
  }

  async function searchAddress() {
    if (!addressQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: addressQuery.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo buscar la ubicación");
      setSearchResult(data);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setSearching(false);
    }
  }

  async function save() {
    setSaving(true);
    await updatePlaceAction(collectionId, place.id, {
      name,
      description,
      lat: searchResult ? searchResult.lat : place.lat,
      lng: searchResult ? searchResult.lng : place.lng,
      locationStatus: searchResult ? "confirmed" : place.locationStatus,
      needsReview: false,
    });
    router.refresh();
    setSaving(false);
    setEditing(false);
  }

  async function remove() {
    if (!confirm(`¿Eliminar "${place.name}" de esta colección?`)) return;
    await deletePlaceAction(collectionId, place.id);
    router.refresh();
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
      <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-lg ${accentClass.bg} ${accentClass.text}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="m21 15-5-5-11 9" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="mb-0.5 flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{place.name}</p>
          {!readOnly && (
            <div className="flex flex-none gap-1">
              <button
                onClick={openEdit}
                aria-label="Editar"
                className="rounded-md p-1 text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
              <button
                onClick={remove}
                aria-label="Eliminar"
                className="rounded-md p-1 text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <p className="mb-2 text-sm text-text-secondary">{place.description}</p>
        {place.needsReview ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="warning">Falta procesar, revisar manualmente</Badge>
            {place.sourceReelUrl && (
              <a
                href={place.sourceReelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-teal-800 underline"
              >
                Ver el post original
              </a>
            )}
          </div>
        ) : place.locationStatus === "confirmed" ? (
          <Badge tone="success">Ubicación confirmada</Badge>
        ) : (
          <Badge tone="warning">Ubicación inferida, revisar</Badge>
        )}
      </div>

      {!readOnly && editing && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5">
            <p className="mb-3 text-sm font-medium">Editar lugar</p>

            <label className="mb-1 block text-xs text-text-muted">Nombre</label>
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

            <label className="mb-1 block text-xs text-text-muted">
              Buscar o corregir la ubicación
            </label>
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                placeholder="Ej. Cuevas del Manzano, Cajón del Maipo, Chile"
                value={addressQuery}
                onChange={(event) => setAddressQuery(event.target.value)}
                className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-border-strong"
              />
              <Button onClick={searchAddress} disabled={searching}>
                {searching ? "Buscando…" : "Buscar"}
              </Button>
            </div>

            {searchError && (
              <p className="mb-2 text-sm text-brand-coral-600">{searchError}</p>
            )}

            {searchResult && (
              <div className="mb-3">
                <ItineraryMap
                  stops={[
                    {
                      id: place.id,
                      lat: searchResult.lat,
                      lng: searchResult.lng,
                      name,
                      day: 1,
                      order: 1,
                    },
                  ]}
                />
                <p className="mt-1.5 text-xs text-text-muted">{searchResult.formattedAddress}</p>
              </div>
            )}

            <Button onClick={save} disabled={saving} className="w-full justify-center">
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
            <button
              onClick={() => setEditing(false)}
              className="mt-2 w-full py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
