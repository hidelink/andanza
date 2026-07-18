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
}: {
  places: Place[];
  accent: Accent;
  collectionId: string;
}) {
  const [tab, setTab] = useState<Tab>("lista");
  const placesWithReel = places.filter((place) => place.sourceReelUrl);

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
        <div className="flex flex-col gap-3">
          {places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              accent={accent}
              collectionId={collectionId}
            />
          ))}
        </div>
      ) : placesWithReel.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          Ninguno de tus lugares tiene un reel guardado todavía.
        </p>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3">
          {placesWithReel.map((place) => (
            <div key={place.id} className="mb-3 break-inside-avoid">
              <ReelEmbed url={place.sourceReelUrl!} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
