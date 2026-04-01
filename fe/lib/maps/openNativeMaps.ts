import { Linking } from "react-native";

type OpenNativeMapsArgs = {
  latitude: number | null;
  longitude: number | null;
  placeLabel: string;
};

/**
 * Opens Google Maps. Uses coordinates when present, otherwise searches by venue text.
 */
export async function openNativeMaps({
  latitude,
  longitude,
  placeLabel,
}: OpenNativeMapsArgs): Promise<void> {
  const hasCoords =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const query = hasCoords
    ? `${latitude},${longitude}`
    : placeLabel.trim() || "Event";

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  await Linking.openURL(url);
}
