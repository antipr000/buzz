import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LocationObject } from "expo-location";

const USER_LOCATION_KEY = "buzz:user_location";

export type StoredUserLocation = {
  latitude: number;
  longitude: number;
  updatedAt: number;
};

export async function persistUserLocationCoords(input: {
  latitude: number;
  longitude: number;
  updatedAt?: number;
}): Promise<void> {
  const updatedAt = input.updatedAt ?? Date.now();
  await AsyncStorage.setItem(
    USER_LOCATION_KEY,
    JSON.stringify({
      latitude: input.latitude,
      longitude: input.longitude,
      updatedAt,
    } satisfies StoredUserLocation)
  );
}

export async function persistUserLocation(loc: LocationObject): Promise<void> {
  const { latitude, longitude } = loc.coords;
  await persistUserLocationCoords({
    latitude,
    longitude,
    updatedAt: loc.timestamp,
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
