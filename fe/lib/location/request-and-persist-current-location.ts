import * as Location from "expo-location";

import { persistUserLocation } from "@/lib/location/user-location";

export type RequestAndPersistCurrentLocationResult =
  | { ok: true }
  | { ok: false; reason: "denied" | "error" };

/**
 * Foreground permission → current position → persist to user-location storage.
 * Used by onboarding and settings “auto detect” flows.
 */
export async function requestAndPersistCurrentLocation(): Promise<RequestAndPersistCurrentLocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return { ok: false, reason: "denied" };
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    await persistUserLocation(position);
    return { ok: true };
  } catch (e) {
    console.warn("Location error", e);
    return { ok: false, reason: "error" };
  }
}
