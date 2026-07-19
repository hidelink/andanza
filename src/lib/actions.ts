"use server";

import { revalidatePath } from "next/cache";
import {
  createCollection,
  createPlace,
  findOrCreateCollectionByCountry,
  updatePlace,
  deletePlace,
  saveItinerary,
  setCollectionPublic,
  type NewPlace,
  type PlaceUpdate,
} from "@/lib/data";
import { generateItineraryPlan } from "@/lib/itinerary/generate";
import { regenerateShareToken } from "@/lib/shareToken";

export async function createCollectionAction(name: string) {
  const id = await createCollection(name);
  revalidatePath("/");
  return id;
}

export async function createPlaceAction(collectionId: string, place: NewPlace) {
  await createPlace(collectionId, place);
  revalidatePath(`/colecciones/${collectionId}`);
}

export async function createPlaceAutoAction(place: NewPlace) {
  const countryName = place.country?.trim() || "Sin país detectado";
  const collectionId = await findOrCreateCollectionByCountry(countryName);
  await createPlace(collectionId, place);
  revalidatePath("/");
  revalidatePath(`/colecciones/${collectionId}`);
  return collectionId;
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

export async function setCollectionPublicAction(collectionId: string, isPublic: boolean) {
  await setCollectionPublic(collectionId, isPublic);
  revalidatePath(`/colecciones/${collectionId}`);
  revalidatePath(`/compartido/${collectionId}`);
}

export async function regenerateShareTokenAction() {
  const token = await regenerateShareToken();
  revalidatePath("/ajustes");
  return token;
}
