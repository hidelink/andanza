import { createAdminClient } from "@/lib/supabase/admin";
import { extractInstagramShortcode } from "@/lib/instagramUrl";
import type { NewPlace } from "@/lib/data";

// Counterparts to the RLS-scoped functions in data.ts, for the token-
// authenticated share endpoint which has no browser session to derive a
// normal client from. Every query here filters/sets rows by an explicitly
// passed userId — never trust a caller that doesn't resolve one first.

export async function adminFindPlaceBySourceUrl(
  userId: string,
  sourceReelUrl: string,
): Promise<{ collectionId: string; name: string } | null> {
  const admin = createAdminClient();
  const shortcode = extractInstagramShortcode(sourceReelUrl);

  const { data, error } = await (shortcode
    ? admin.from("places").select("collection_id, name").eq("user_id", userId).eq("reel_shortcode", shortcode)
    : admin.from("places").select("collection_id, name").eq("user_id", userId).eq("source_reel_url", sourceReelUrl)
  )
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { collectionId: data.collection_id, name: data.name };
}

export async function adminFindOrCreateCollectionByCountry(
  userId: string,
  country: string,
): Promise<string> {
  const admin = createAdminClient();
  const { data: existing, error: findError } = await admin
    .from("collections")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", country)
    .limit(1)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing.id;

  const { data, error } = await admin
    .from("collections")
    .insert({ name: country, user_id: userId })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function adminCreatePlace(userId: string, collectionId: string, place: NewPlace) {
  const admin = createAdminClient();
  const { error } = await admin.from("places").insert({
    collection_id: collectionId,
    user_id: userId,
    name: place.name,
    description: place.description,
    location_status: place.locationStatus,
    source_reel_url: place.sourceReelUrl,
    reel_shortcode: extractInstagramShortcode(place.sourceReelUrl),
    lat: place.lat ?? null,
    lng: place.lng ?? null,
    country: place.country ?? null,
    region: place.region ?? null,
    needs_review: place.needsReview ?? false,
  });

  if (error) throw error;
}
