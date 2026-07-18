import { createClient } from "@/lib/supabase/server";
import type { Accent } from "@/lib/accent";
import type { LocationStatus } from "@/lib/types";

export type Place = {
  id: string;
  name: string;
  description: string | null;
  locationStatus: LocationStatus;
  lat: number | null;
  lng: number | null;
  sourceReelUrl: string | null;
  country: string | null;
  region: string | null;
};

export type CollectionSummary = {
  id: string;
  name: string;
  accent: Accent;
  placesCount: number;
};

export type CollectionWithPlaces = {
  id: string;
  name: string;
  accent: Accent;
  places: Place[];
};

const ACCENTS: Accent[] = ["teal", "coral", "amber"];

export function accentForId(id: string): Accent {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[hash % ACCENTS.length];
}

export async function getCollections(): Promise<CollectionSummary[]> {
  const supabase = await createClient();

  const [{ data: collections, error: collectionsError }, { data: places, error: placesError }] =
    await Promise.all([
      supabase.from("collections").select("id, name").order("created_at", { ascending: false }),
      supabase.from("places").select("id, collection_id"),
    ]);

  if (collectionsError) throw collectionsError;
  if (placesError) throw placesError;

  const counts = new Map<string, number>();
  for (const place of places ?? []) {
    counts.set(place.collection_id, (counts.get(place.collection_id) ?? 0) + 1);
  }

  return (collections ?? []).map((collection) => ({
    id: collection.id,
    name: collection.name,
    accent: accentForId(collection.id),
    placesCount: counts.get(collection.id) ?? 0,
  }));
}

export async function findPlaceBySourceUrl(
  sourceReelUrl: string,
): Promise<{ collectionId: string; name: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("places")
    .select("collection_id, name")
    .eq("source_reel_url", sourceReelUrl)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { collectionId: data.collection_id, name: data.name };
}

export async function getCollection(id: string): Promise<CollectionWithPlaces | null> {
  const supabase = await createClient();

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (collectionError) throw collectionError;
  if (!collection) return null;

  const { data: places, error: placesError } = await supabase
    .from("places")
    .select("id, name, description, location_status, lat, lng, source_reel_url, country, region")
    .eq("collection_id", id)
    .order("created_at", { ascending: true });

  if (placesError) throw placesError;

  return {
    id: collection.id,
    name: collection.name,
    accent: accentForId(collection.id),
    places: (places ?? []).map((place) => ({
      id: place.id,
      name: place.name,
      description: place.description,
      locationStatus: place.location_status as LocationStatus,
      lat: place.lat,
      lng: place.lng,
      sourceReelUrl: place.source_reel_url,
      country: place.country,
      region: place.region,
    })),
  };
}

export async function createCollection(name: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .insert({ name })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function findOrCreateCollectionByCountry(country: string): Promise<string> {
  const supabase = await createClient();
  const { data: existing, error: findError } = await supabase
    .from("collections")
    .select("id")
    .ilike("name", country)
    .limit(1)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing.id;

  return createCollection(country);
}

export type NewPlace = {
  name: string;
  description: string;
  locationStatus: LocationStatus;
  sourceReelUrl: string;
  lat?: number | null;
  lng?: number | null;
  country?: string | null;
  region?: string | null;
};

export async function createPlace(collectionId: string, place: NewPlace) {
  const supabase = await createClient();
  const { error } = await supabase.from("places").insert({
    collection_id: collectionId,
    name: place.name,
    description: place.description,
    location_status: place.locationStatus,
    source_reel_url: place.sourceReelUrl,
    lat: place.lat ?? null,
    lng: place.lng ?? null,
    country: place.country ?? null,
    region: place.region ?? null,
  });

  if (error) throw error;
}

export type PlaceUpdate = {
  name: string;
  description: string;
  locationStatus: LocationStatus;
  lat: number | null;
  lng: number | null;
};

export async function updatePlace(placeId: string, updates: PlaceUpdate) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("places")
    .update({
      name: updates.name,
      description: updates.description,
      location_status: updates.locationStatus,
      lat: updates.lat,
      lng: updates.lng,
      updated_at: new Date().toISOString(),
    })
    .eq("id", placeId);

  if (error) throw error;
}

export async function deletePlace(placeId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("places").delete().eq("id", placeId);
  if (error) throw error;
}

export type ItineraryStop = {
  placeId: string;
  name: string;
  description: string | null;
  locationStatus: LocationStatus;
  lat: number;
  lng: number;
  travelToNextMinutes: number | null;
};

export type ItineraryDay = {
  day: number;
  title: string;
  stops: ItineraryStop[];
};

export type ItineraryPlan = {
  daysRequested: number;
  days: ItineraryDay[];
  unplaced: { placeId: string; name: string }[];
};

export async function getLatestItinerary(collectionId: string): Promise<ItineraryPlan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("itineraries")
    .select("plan_json")
    .eq("collection_id", collectionId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return data.plan_json as ItineraryPlan;
}

export async function saveItinerary(
  collectionId: string,
  daysRequested: number,
  plan: ItineraryPlan,
) {
  const supabase = await createClient();
  const { error } = await supabase.from("itineraries").insert({
    collection_id: collectionId,
    days_requested: daysRequested,
    plan_json: plan,
  });

  if (error) throw error;
}
