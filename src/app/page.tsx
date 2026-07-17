import { CollectionCard } from "@/components/CollectionCard";
import { NewCollectionForm } from "@/components/NewCollectionForm";
import { getCollections } from "@/lib/data";

export default async function Home() {
  const collections = await getCollections();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-medium">Tus colecciones</p>
        <NewCollectionForm />
      </div>
      {collections.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
          Todavía no tienes colecciones. Crea la primera para empezar a guardar lugares.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}
