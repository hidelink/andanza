import Link from "next/link";
import { PlaceCard } from "@/components/PlaceCard";
import { AddReelModal } from "@/components/AddReelModal";
import { Button } from "@/components/Button";
import type { Accent } from "@/lib/accent";
import type { Place } from "@/lib/data";

export function CollectionDetail({
  collectionId,
  name,
  accent,
  places,
}: {
  collectionId: string;
  name: string;
  accent: Accent;
  places: Place[];
}) {
  return (
    <div>
      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7M5 12h14" />
        </svg>
        Colecciones
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-medium">{name}</p>
        <div className="flex gap-2">
          <AddReelModal collectionId={collectionId} />
          <Link href={`/colecciones/${collectionId}/itinerario`}>
            <Button>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 20 3 17V4l6 3m0 13 6-3m-6 3V7m6 10 6 3V7l-6-3m0 16V4m0 3-6-3" />
              </svg>
              Generar plan
            </Button>
          </Link>
        </div>
      </div>

      {places.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          Todavía no hay lugares en esta colección. Agrega tu primer reel.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} accent={accent} collectionId={collectionId} />
          ))}
        </div>
      )}
    </div>
  );
}
