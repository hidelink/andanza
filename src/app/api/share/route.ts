import { NextResponse } from "next/server";
import { extractPlaceFromReel } from "@/lib/extraction/pipeline";
import { resolveUserIdFromToken } from "@/lib/shareToken";
import { extractInstagramUrl } from "@/lib/instagramUrl";
import {
  adminFindPlaceBySourceUrl,
  adminFindOrCreateCollectionByCountry,
  adminCreatePlace,
} from "@/lib/data-admin";

// Max allowed on Vercel Hobby without Fluid Compute; waitForSnapshot() in
// brightdata.ts budgets its polling so the rest of the pipeline still fits.
export const maxDuration = 60;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Falta el token de autorización" }, { status: 401 });
  }

  const userId = await resolveUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { text } = await request.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Falta el contenido compartido" }, { status: 400 });
  }

  const url = extractInstagramUrl(text);
  if (!url) {
    return NextResponse.json(
      { error: "No encontramos un link de Instagram en lo que compartiste" },
      { status: 400 },
    );
  }

  const existing = await adminFindPlaceBySourceUrl(userId, url);
  if (existing) {
    return NextResponse.json({ duplicate: true, existingPlaceName: existing.name });
  }

  const extracted = await extractPlaceFromReel(url);
  const countryName = extracted?.country?.trim() || "Sin país detectado";
  const collectionId = await adminFindOrCreateCollectionByCountry(userId, countryName);

  await adminCreatePlace(userId, collectionId, {
    name: extracted?.name ?? "Reel pendiente de revisar",
    description: extracted?.description ?? "",
    locationStatus: extracted?.locationStatus ?? "inferred",
    sourceReelUrl: url,
    lat: extracted?.lat ?? null,
    lng: extracted?.lng ?? null,
    country: extracted?.country ?? null,
    region: extracted?.region ?? null,
    needsReview: !extracted,
  });

  return NextResponse.json({
    ok: true,
    name: extracted?.name ?? "Reel pendiente de revisar",
    needsReview: !extracted,
  });
}
