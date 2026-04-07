import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { uuidV4 } from "@/lib/device/uuid-v4";

const STORAGE_KEY = "buzz_device_install_key";

async function getStoredKey(): Promise<string | null> {
  if (Platform.OS === "web") return AsyncStorage.getItem(STORAGE_KEY);
  return SecureStore.getItemAsync(STORAGE_KEY);
}

async function storeKey(id: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(STORAGE_KEY, id);
  } else {
    await SecureStore.setItemAsync(STORAGE_KEY, id);
  }
}

/** Stable id for this app install (not the OS marketing / user-set name). */
export async function getOrCreateDeviceKey(): Promise<string> {
  const existing = await getStoredKey();
  if (existing) return existing;
  const id = uuidV4();
  await storeKey(id);
  return id;
}
