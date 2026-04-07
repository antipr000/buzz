import * as Device from "expo-device";
import { Platform } from "react-native";

/**
 * Product model only for `device_name` (backend register).
 * Uses `modelName` + `brand` on Android when both help; never `deviceName` (no iOS entitlement path).
 */
export async function getDeviceDisplayName(): Promise<string> {
  if (Platform.OS === "web") {
    return "web";
  }

  const model = Device.modelName?.trim();
  const brand = Device.brand?.trim();

  if (Platform.OS === "android" && brand && model) {
    return `${brand} ${model}`;
  }
  if (model) {
    return model;
  }

  return Platform.OS;
}
