"use server";

import { revalidatePath } from "next/cache";
import {
  createCollection,
  createPlace,
  updatePlace,
  deletePlace,
  saveItinerary,
  type NewPlace,
  type PlaceUpdate,
} from "@/lib/data";
import { generateItineraryPlan } from "@/lib/itinerary/generate";

export async function createCollectionAction(name: string) {
  const id = await createCollection(name);
  revalidatePath("/");
  return id;
}

export async function createPlaceAction(collectionId: string, place: NewPlace) {
  await createPlace(collectionId, place);
  revalidatePath(`/colecciones/${collectionId}`);
}

export async function updatePlaceAction(
  collectionId: string,
  placeId: string,
  updates: PlaceUpdate,
) {
  await updatePlace(placeId, updates);
  revalidatePath(`/colecciones/${collectionId}`);
}

export async function deletePlaceAction(collectionId: string, placeId: string) {
  await deletePlace(placeId);
  revalidatePath(`/colecciones/${collectionId}`);
  revalidatePath("/");
}

export async function generateItineraryAction(collectionId: string, days: number) {
  const plan = await generateItineraryPlan(collectionId, days);
  await saveItinerary(collectionId, days, plan);
  revalidatePath(`/colecciones/${collectionId}/itinerario`);
  return plan;
}
