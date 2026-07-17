export type GeoPoint = { id: string; lat: number; lng: number };

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function estimateTravelMinutes(distanceKm: number): number {
  const speedKmh = distanceKm <= 1.5 ? 4.5 : 35;
  const minutes = (distanceKm / speedKmh) * 60;
  return Math.max(5, Math.round(minutes / 5) * 5);
}

export function kmeansCluster(points: GeoPoint[], k: number): GeoPoint[][] {
  if (points.length === 0) return [];
  const clusterCount = Math.max(1, Math.min(k, points.length));

  const centroids: GeoPoint[] = [points[0]];
  while (centroids.length < clusterCount) {
    let farthest = points[0];
    let farthestDist = -1;
    for (const point of points) {
      const minDist = Math.min(...centroids.map((c) => haversineKm(point, c)));
      if (minDist > farthestDist) {
        farthestDist = minDist;
        farthest = point;
      }
    }
    centroids.push(farthest);
  }

  let assignments = new Array(points.length).fill(0);
  for (let iter = 0; iter < 10; iter++) {
    assignments = points.map((point) => {
      let best = 0;
      let bestDist = Infinity;
      centroids.forEach((centroid, i) => {
        const d = haversineKm(point, centroid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    });

    for (let i = 0; i < clusterCount; i++) {
      const members = points.filter((_, idx) => assignments[idx] === i);
      if (members.length === 0) continue;
      centroids[i] = {
        id: "centroid",
        lat: members.reduce((sum, m) => sum + m.lat, 0) / members.length,
        lng: members.reduce((sum, m) => sum + m.lng, 0) / members.length,
      };
    }
  }

  const clusters: GeoPoint[][] = Array.from({ length: clusterCount }, () => []);
  points.forEach((point, idx) => clusters[assignments[idx]].push(point));
  return clusters.filter((cluster) => cluster.length > 0);
}

export function orderNearestNeighbor(points: GeoPoint[]): GeoPoint[] {
  if (points.length <= 1) return [...points];

  const centroid: GeoPoint = {
    id: "centroid",
    lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length,
  };

  const remaining = [...points].sort(
    (a, b) => haversineKm(a, centroid) - haversineKm(b, centroid),
  );
  const ordered = [remaining.shift()!];

  while (remaining.length) {
    const last = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((point, idx) => {
      const d = haversineKm(last, point);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = idx;
      }
    });
    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }

  return ordered;
}
