import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const USER_LOCATION_KEY = "buzz:user_location";

export type StoredUserLocation = {
  latitude: number;
  longitude: number;
  updatedAt: number;
  label?: string;
};

export async function persistUserLocationCoords(input: {
  latitude: number;
  longitude: number;
  updatedAt?: number;
  label?: string | null;
}): Promise<void> {
  const trimmed = input.label?.trim();
  const payload: StoredUserLocation = {
    latitude: input.latitude,
    longitude: input.longitude,
    updatedAt: input.updatedAt ?? Date.now(),
    ...(trimmed ? { label: trimmed } : {}),
  };
  await AsyncStorage.setItem(USER_LOCATION_KEY, JSON.stringify(payload));
}

export async function persistUserLocation(
  loc: Location.LocationObject
): Promise<void> {
  const { latitude, longitude } = loc.coords;
  let label: string | undefined;
  try {
    const [g] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (g) {
      // Android usually sets formattedAddress; iOS often leaves it null — use placemark fields.
      label =
        g.formattedAddress?.trim() ||
        [g.city ?? g.subregion ?? g.region, g.country ?? g.isoCountryCode]
          .filter(Boolean)
          .join(", ") ||
        undefined;
    }
  } catch (e) {
    console.warn("Reverse geocode failed", e);
  }
  await persistUserLocationCoords({
    latitude,
    longitude,
    updatedAt: loc.timestamp,
    label,
  });
}

export async function readUserLocation(): Promise<StoredUserLocation | null> {
  const raw = await AsyncStorage.getItem(USER_LOCATION_KEY);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as StoredUserLocation;
  } catch {
    return null;
  }
}
