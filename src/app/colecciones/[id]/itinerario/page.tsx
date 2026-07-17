import { notFound } from "next/navigation";
import { ItineraryView } from "@/components/ItineraryView";
import { getCollection, getLatestItinerary } from "@/lib/data";

export default async function ItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollection(id);

  if (!collection) {
    notFound();
  }

  const plan = await getLatestItinerary(id);

  return (
    <ItineraryView
      collectionId={collection.id}
      collectionName={collection.name}
      placesCount={collection.places.length}
      initialPlan={plan}
    />
  );
}
