import Link from "next/link";
import { accentClasses } from "@/lib/accent";
import type { CollectionSummary } from "@/lib/data";

export function CollectionCard({ collection }: { collection: CollectionSummary }) {
  const accent = accentClasses[collection.accent];

  return (
    <Link
      href={`/colecciones/${collection.id}`}
      className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
    >
      <div className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg ${accent.bg} ${accent.text}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      </div>
      <p className="mb-1 text-sm font-medium">{collection.name}</p>
      <p className="text-sm text-text-secondary">
        {collection.placesCount} {collection.placesCount === 1 ? "lugar" : "lugares"}
      </p>
    </Link>
  );
}
