/**
 * Approximate city-center coordinates (WGS84) for settings quick-picks.
 * Used only for discover radius; not survey-grade.
 */
export type IndiaCityPresetCoords = {
  latitude: number;
  longitude: number;
};

/** Keys must match display labels in settings location UI. */
export const INDIA_CITY_PRESETS: Record<string, IndiaCityPresetCoords> = {
  Bangalore: { latitude: 12.9716, longitude: 77.5946 },
  Mumbai: { latitude: 19.076, longitude: 72.8777 },
  Hyderabad: { latitude: 17.385, longitude: 78.4867 },
  Ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  "Delhi-NCR": { latitude: 28.6139, longitude: 77.209 },
  Pune: { latitude: 18.5204, longitude: 73.8567 },
  Kolkata: { latitude: 22.5726, longitude: 88.3639 },
  Gurugram: { latitude: 28.4595, longitude: 77.0266 },
  Chennai: { latitude: 13.0827, longitude: 80.2707 },
  Kochi: { latitude: 9.9312, longitude: 76.2673 },
};

export function getIndiaCityPreset(name: string): IndiaCityPresetCoords | null {
  return INDIA_CITY_PRESETS[name] ?? null;
}
