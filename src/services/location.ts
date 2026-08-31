import * as Location from "expo-location";
import { Coordinates } from "@/utils/distance";

export type LocationPermissionStatus = "undetermined" | "granted" | "denied";

export interface LocationResult {
  coords: Coordinates | null;
  status: LocationPermissionStatus;
  errorMessage?: string;
}

/**
 * Requests foreground location permissions from the user.
 */
export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.GRANTED) {
      return "granted";
    }
    return "denied";
  } catch (error) {
    console.warn("Location permission request failed:", error);
    return "denied";
  }
}

/**
 * Checks current foreground location permission without prompting.
 */
export async function checkLocationPermission(): Promise<LocationPermissionStatus> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.GRANTED) {
      return "granted";
    } else if (status === Location.PermissionStatus.DENIED) {
      return "denied";
    }
    return "undetermined";
  } catch {
    return "undetermined";
  }
}

/**
 * Gets the current GPS coordinates of the device.
 */
export async function getCurrentUserLocation(): Promise<LocationResult> {
  try {
    const permStatus = await requestLocationPermission();
    if (permStatus !== "granted") {
      return {
        coords: null,
        status: permStatus,
        errorMessage: "Location permission denied. Please enable location to find nearby pharmacies.",
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      status: "granted",
    };
  } catch (error: any) {
    console.warn("Error getting current location:", error);
    return {
      coords: null,
      status: "denied",
      errorMessage: error?.message || "Could not retrieve GPS location.",
    };
  }
}

/**
 * Watches user location updates for live tracking.
 */
export async function watchUserLocation(
  onUpdate: (coords: Coordinates) => void,
  onError?: (err: any) => void
): Promise<Location.LocationSubscription | null> {
  try {
    const permStatus = await requestLocationPermission();
    if (permStatus !== "granted") {
      if (onError) onError(new Error("Location permission denied"));
      return null;
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (loc) => {
        onUpdate({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    );

    return subscription;
  } catch (err) {
    if (onError) onError(err);
    return null;
  }
}
