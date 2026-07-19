import { NextResponse } from "next/server";
import { extractPlaceFromReel } from "@/lib/extraction/pipeline";
import { findPlaceBySourceUrl } from "@/lib/data";

// Max allowed on Vercel Hobby without Fluid Compute; waitForSnapshot() in
// brightdata.ts budgets its polling so the rest of the pipeline still fits.
export const maxDuration = 60;

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
  } catch (error) {
    console.error("Duplicate check failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }

  const extracted = await extractPlaceFromReel(url);
  if (!extracted) {
    return NextResponse.json({ extractionFailed: true, sourceReelUrl: url });
  }

  return NextResponse.json({
    name: extracted.name,
    description: extracted.description,
    locationStatus: extracted.locationStatus,
    sourceReelUrl: url,
    lat: extracted.lat,
    lng: extracted.lng,
    country: extracted.country,
    region: extracted.region,
  });
}
