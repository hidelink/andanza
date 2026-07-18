export type GeocodedLocation = {
  lat: number;
  lng: number;
  formattedAddress: string;
  country: string | null;
  region: string | null;
};

export async function geocodeAddress(query: string): Promise<GeocodedLocation | null> {
  const params = new URLSearchParams({
    address: query,
    language: "es",
    key: process.env.GOOGLE_MAPS_API_KEY!,
  });

  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`);
  if (!response.ok) {
    throw new Error(`Google Geocoding request failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== "OK" || !data.results?.length) {
    return null;
  }

  const [result] = data.results;
  const components = result.address_components as Array<{
    long_name: string;
    types: string[];
  }>;
  const country =
    components.find((component) => component.types.includes("country"))?.long_name ?? null;
  const region =
    components.find((component) => component.types.includes("administrative_area_level_1"))
      ?.long_name ?? null;

  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
    country,
    region,
  };
}
