"use client";

import { useState } from "react";
import { PlaceCard } from "@/components/PlaceCard";
import { ReelEmbed } from "@/components/ReelEmbed";
import type { Accent } from "@/lib/accent";
import type { Place } from "@/lib/data";

type Tab = "lista" | "reels";

export function PlacesView({
  places,
  accent,
  collectionId,
  readOnly = false,
}: {
  places: Place[];
  accent: Accent;
  collectionId: string;
  readOnly?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("lista");
  const placesWithReel = places.filter((place) => place.sourceReelUrl);

  const regionGroups: [string, Place[]][] = [];
  for (const place of places) {
    const key = place.region?.trim() || "Otros";
    const group = regionGroups.find(([region]) => region === key);
    if (group) {
      group[1].push(place);
    } else {
      regionGroups.push([key, [place]]);
    }
  }

  return (
    <div>
      <div className="mb-3 flex gap-1.5">
        <button
          onClick={() => setTab("lista")}
          className={`rounded-lg border px-3.5 py-1.5 text-sm ${
            tab === "lista"
              ? "border-border-strong bg-surface-2 font-medium"
              : "border-border text-text-secondary"
          }`}
        >
          Lista
        </button>
        <button
          onClick={() => setTab("reels")}
          className={`rounded-lg border px-3.5 py-1.5 text-sm ${
            tab === "reels"
              ? "border-border-strong bg-surface-2 font-medium"
              : "border-border text-text-secondary"
          }`}
        >
          Reels
        </button>
      </div>

      {tab === "lista" ? (
        <div className="flex flex-col gap-5">
          {regionGroups.map(([region, groupPlaces]) => (
            <div key={region}>
              {regionGroups.length > 1 && (
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                  {region}
                </p>
              )}
              <div className="flex flex-col gap-3">
                {groupPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    accent={accent}
                    collectionId={collectionId}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : placesWithReel.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          Ninguno de tus lugares tiene un reel guardado todavía.
        </p>
      ) : (
        <div className="relative left-1/2 w-screen -translate-x-1/2">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {placesWithReel.map((place) => (
                <ReelEmbed key={place.id} url={place.sourceReelUrl!} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
