export type GeocodedLocation = {
  lat: number;
  lng: number;
  formattedAddress: string;
};

export async function geocodeAddress(query: string): Promise<GeocodedLocation | null> {
  const params = new URLSearchParams({
    address: query,
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
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
  };
}
