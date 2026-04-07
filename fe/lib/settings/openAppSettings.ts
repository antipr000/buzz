import { Linking, Platform } from "react-native";

/** Opens this app's page in system Settings (notifications, location, etc.). */
export async function openAppSettings(): Promise<void> {
  if (Platform.OS === "web") return;
  await Linking.openSettings();
}
