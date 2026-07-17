import { notFound } from "next/navigation";
import { CollectionDetail } from "@/components/CollectionDetail";
import { getCollection } from "@/lib/data";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollection(id);

  if (!collection) {
    notFound();
  }

  return (
    <CollectionDetail
      collectionId={collection.id}
      name={collection.name}
      accent={collection.accent}
      places={collection.places}
    />
  );
}
