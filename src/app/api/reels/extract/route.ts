import { NextResponse } from "next/server";
import { scrapeInstagramPost } from "@/lib/extraction/brightdata";
import { transcribeVideoUrl } from "@/lib/extraction/elevenlabs";
import { structurePlace } from "@/lib/extraction/anthropic";
import { geocodeAddress } from "@/lib/extraction/geocoding";
import { findPlaceBySourceUrl } from "@/lib/data";

export async function POST(request: Request) {
  const { url, force } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Falta la URL del reel" }, { status: 400 });
  }

  try {
    if (!force) {
      const existing = await findPlaceBySourceUrl(url);
      if (existing) {
        return NextResponse.json({
          duplicate: true,
          existingPlaceName: existing.name,
          existingCollectionId: existing.collectionId,
        });
      }
    }

    const post = await scrapeInstagramPost(url);

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

    const structured = await structurePlace({
      caption: post.description,
      transcript,
      locationTag,
    });

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

    return NextResponse.json({
      name: structured.name,
      description: structured.description,
      locationStatus: structured.locationStatus,
      sourceReelUrl: url,
      lat,
      lng,
      country,
      region,
    });
  } catch (error) {
    console.error("Reel extraction failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
