/**
 * Utility functions for calculating and formatting geographical distance
 * based on real GPS coordinates using the Haversine formula.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates great-circle distance between two points on the Earth in kilometers.
 * @param lat1 Latitude of point 1 (in degrees)
 * @param lon1 Longitude of point 1 (in degrees)
 * @param lat2 Latitude of point 2 (in degrees)
 * @param lon2 Longitude of point 2 (in degrees)
 * @returns Distance in kilometers, or null if coordinates are invalid
 */
export function calculateDistance(
  lat1: number | null | undefined,
  lon1: number | null | undefined,
  lat2: number | null | undefined,
  lon2: number | null | undefined
): number | null {
  if (
    lat1 === null ||
    lat1 === undefined ||
    lon1 === null ||
    lon1 === undefined ||
    lat2 === null ||
    lat2 === undefined ||
    lon2 === null ||
    lon2 === undefined ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return null;
  }

  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  return distanceKm;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats a distance in kilometers into a human-friendly string:
 * - < 1.0 km -> formatted in meters (e.g. "500 m", "850 m")
 * - >= 1.0 km -> formatted in km with 1 decimal place (e.g. "1.2 km", "4.8 km")
 * - null/undefined -> "Distance unavailable"
 */
export function formatDistance(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) {
    return "Distance unavailable";
  }

  if (distanceKm < 0.05) {
    return "Under 50 m";
  }

  if (distanceKm < 1.0) {
    const meters = Math.round((distanceKm * 1000) / 50) * 50; // round to nearest 50m
    return `${Math.max(50, meters)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Helper to get formatted distance between patient location and pharmacy coordinates
 */
export function getPharmacyDistanceText(
  userLoc: Coordinates | null | undefined,
  pharmacyLat: number | null | undefined,
  pharmacyLng: number | null | undefined
): string {
  if (!userLoc) return "Location not set";
  const dist = calculateDistance(
    userLoc.latitude,
    userLoc.longitude,
    pharmacyLat,
    pharmacyLng
  );
  return formatDistance(dist);
}
