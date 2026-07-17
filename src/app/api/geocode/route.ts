import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/extraction/geocoding";

export async function POST(request: Request) {
  const { query } = await request.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Falta la dirección a buscar" }, { status: 400 });
  }

  try {
    const result = await geocodeAddress(query);
    if (!result) {
      return NextResponse.json({ error: "No se encontró esa ubicación" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
