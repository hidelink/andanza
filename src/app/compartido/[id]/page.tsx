import { notFound } from "next/navigation";
import Link from "next/link";
import { PlacesView } from "@/components/PlacesView";
import { getCollection } from "@/lib/data";

export default async function SharedCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollection(id);

  if (!collection || !collection.isPublic) {
    notFound();
  }

  return (
    <div>
      <p className="mb-3 text-sm text-text-secondary">
        Colección compartida desde{" "}
        <Link href="/" className="text-brand-teal-800 underline">
          Andanza
        </Link>
      </p>
      <p className="mb-4 text-base font-medium">{collection.name}</p>

      {collection.places.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          Esta colección todavía no tiene lugares.
        </p>
      ) : (
        <PlacesView
          places={collection.places}
          accent={collection.accent}
          collectionId={collection.id}
          readOnly
        />
      )}
    </div>
  );
}
