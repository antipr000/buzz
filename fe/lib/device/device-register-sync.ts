import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { registerDevice } from "@/lib/api/devices";
import { getDeviceDisplayName } from "@/lib/device/device-info";
import { getOrCreateDeviceKey } from "@/lib/device/device-key";

const LAST_PING_DATE_KEY = "buzz_device_last_ping_date";

/** Full local calendar date `YYYY-MM-DD` (year + month + day — not “day-of-month” alone). */
function localCalendarDayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getLastSuccessfulPingDay(): Promise<string | null> {
  if (Platform.OS === "web") return AsyncStorage.getItem(LAST_PING_DATE_KEY);
  return SecureStore.getItemAsync(LAST_PING_DATE_KEY);
}

async function setLastSuccessfulPingDay(day: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(LAST_PING_DATE_KEY, day);
  } else {
    await SecureStore.setItemAsync(LAST_PING_DATE_KEY, day);
  }
}

async function postRegisterAndRecordDay(): Promise<void> {
  const [deviceKey, deviceName] = await Promise.all([
    getOrCreateDeviceKey(),
    getDeviceDisplayName(),
  ]);
  await registerDevice({ device_key: deviceKey, device_name: deviceName });
  await setLastSuccessfulPingDay(localCalendarDayString());
}

/** Call after `SIGNED_IN` — always hits the API (then records today as last ping). */
export async function syncDeviceOnSignedIn(): Promise<void> {
  try {
    await postRegisterAndRecordDay();
  } catch {
    // Offline / API down — auth still works; next foreground or sign-in will retry.
  }
}

/** Call on `INITIAL_SESSION` or when app is `active` — at most once per local calendar day (duplicate calls are cheap no-ops). */
export async function syncDeviceIfNewLocalDay(): Promise<void> {
  const today = localCalendarDayString();
  try {
    const last = await getLastSuccessfulPingDay();
    if (last === today) return;
    await postRegisterAndRecordDay();
  } catch {
    // Do not record day on failure so we retry later the same day.
  }
}
