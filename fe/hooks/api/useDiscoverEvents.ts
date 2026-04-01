import { DISCOVER_RADIUS_KM } from "@/constants/discover";
import { queryKeys } from "@/lib/query/query-keys";
import { getDiscoverEvents } from "@/services/events";
import { useQuery } from "@tanstack/react-query";

export type UseDiscoverEventsArgs = {
  lat: number | null | undefined;
  lng: number | null | undefined;
  radius?: number;
  category?: string | null;
  cursor?: string | null;
  limit?: number;
  /** Defaults to true when coordinates are present */
  enabled?: boolean;
};

function resolveCoords(
  lat: number | null | undefined,
  lng: number | null | undefined
): { lat: number; lng: number } | null {
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    Number.isNaN(lat) ||
    Number.isNaN(lng)
  ) {
    return null;
  }
  return { lat, lng };
}

export function useDiscoverEvents({
  lat,
  lng,
  radius = DISCOVER_RADIUS_KM,
  category,
  cursor,
  limit,
  enabled: enabledProp = true,
}: UseDiscoverEventsArgs) {
  const coords = resolveCoords(lat, lng);
  const enabled = coords !== null && enabledProp;

  return useQuery({
    queryKey:
      coords !== null
        ? queryKeys.events.discover({
            lat: coords.lat,
            lng: coords.lng,
            radius,
            category: category ?? null,
            cursor: cursor ?? null,
            limit,
          })
        : ([...queryKeys.events.all, "discover", "idle"] as const),
    queryFn: () =>
      getDiscoverEvents({
        lat: coords!.lat,
        lng: coords!.lng,
        radius,
        category,
        cursor,
        limit,
      }),
    enabled,  // only enabled when we have coordinates
    // see other parameters in useQuery hook too
  });
}
