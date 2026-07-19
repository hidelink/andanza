import { scrapeInstagramPost } from "@/lib/extraction/brightdata";
import { transcribeVideoUrl } from "@/lib/extraction/elevenlabs";
import { structurePlace } from "@/lib/extraction/anthropic";
import { geocodeAddress } from "@/lib/extraction/geocoding";
import type { LocationStatus } from "@/lib/types";

export type ExtractedPlace = {
  name: string;
  description: string;
  locationStatus: LocationStatus;
  lat: number | null;
  lng: number | null;
  country: string | null;
  region: string | null;
};

export async function extractPlaceFromReel(url: string): Promise<ExtractedPlace | null> {
  let post;
  let structured;
  try {
    post = await scrapeInstagramPost(url);

    const videoUrl = post.videos?.[0] ?? null;
    let transcript: string | null = null;
    if (videoUrl) {
      try {
        transcript = await transcribeVideoUrl(videoUrl);
      } catch (error) {
        console.error("Transcription failed, continuing without it", error);
      }
    }

    const locationTag =
      post.location?.join(", ") ?? post.location_details?.name ?? null;

    structured = await structurePlace({
      caption: post.description,
      transcript,
      locationTag,
    });
  } catch (error) {
    console.error("Reel extraction failed after retries, marking for manual review", error);
    return null;
  }

  let lat: number | null = null;
  let lng: number | null = null;
  let country: string | null = null;
  let region: string | null = null;
  try {
    const geocoded = await geocodeAddress(structured.geocodeQuery);
    if (geocoded) {
      lat = geocoded.lat;
      lng = geocoded.lng;
      country = geocoded.country;
      region = geocoded.region;
    }
  } catch (error) {
    console.error("Geocoding failed, continuing without coordinates", error);
  }

  return {
    name: structured.name,
    description: structured.description,
    locationStatus: structured.locationStatus,
    lat,
    lng,
    country,
    region,
  };
}
