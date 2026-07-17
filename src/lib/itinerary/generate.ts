import { getCollection, type ItineraryPlan } from "@/lib/data";
import { kmeansCluster, orderNearestNeighbor, haversineKm, estimateTravelMinutes } from "@/lib/itinerary/geo";
import { labelItineraryDays } from "@/lib/itinerary/label";

export async function generateItineraryPlan(
  collectionId: string,
  days: number,
): Promise<ItineraryPlan> {
  const collection = await getCollection(collectionId);
  if (!collection) throw new Error("Colección no encontrada");

  const located = collection.places.filter(
    (place): place is typeof place & { lat: number; lng: number } =>
      place.lat != null && place.lng != null,
  );
  const unplaced = collection.places.filter((place) => place.lat == null || place.lng == null);

  const clusters = kmeansCluster(
    located.map((place) => ({ id: place.id, lat: place.lat, lng: place.lng })),
    days,
  );

  const dayPlaceNames = clusters.map((cluster, index) => ({
    day: index + 1,
    placeNames: cluster.map((point) => located.find((p) => p.id === point.id)!.name),
  }));

  const titles = await labelItineraryDays(dayPlaceNames);

  const planDays = clusters.map((cluster, index) => {
    const ordered = orderNearestNeighbor(cluster);
    const stops = ordered.map((point, i) => {
      const place = located.find((p) => p.id === point.id)!;
      const next = ordered[i + 1];
      const travelToNextMinutes = next
        ? estimateTravelMinutes(haversineKm(point, next))
        : null;
      return {
        placeId: place.id,
        name: place.name,
        description: place.description,
        locationStatus: place.locationStatus,
        lat: point.lat,
        lng: point.lng,
        travelToNextMinutes,
      };
    });
    return { day: index + 1, title: titles[index + 1] ?? `Día ${index + 1}`, stops };
  });

  return {
    daysRequested: days,
    days: planDays,
    unplaced: unplaced.map((place) => ({ placeId: place.id, name: place.name })),
  };
}
