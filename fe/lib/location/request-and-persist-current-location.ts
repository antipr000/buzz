import * as Location from "expo-location";

import { persistUserLocation } from "@/lib/location/user-location";

export type RequestAndPersistCurrentLocationResult =
  | { ok: true }
  | { ok: false; reason: "denied" | "error" };

const SETTLE_AFTER_PERMISSION_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    await sleep(SETTLE_AFTER_PERMISSION_MS);
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: true,
    });
    await persistUserLocation(position);
    return { ok: true };
  } catch (e) {
    console.warn("Location error", e);
    return { ok: false, reason: "error" };
  }
}
