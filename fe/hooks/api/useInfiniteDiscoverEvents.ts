import { DISCOVER_RADIUS_KM } from "@/constants/discover";
import { queryKeys } from "@/lib/query/query-keys";
import { getDiscoverEvents } from "@/services/events";
import type { DiscoverResponse } from "@/services/types/events";
import { useInfiniteQuery } from "@tanstack/react-query";

export type UseInfiniteDiscoverEventsArgs = {
  lat: number | null | undefined;
  lng: number | null | undefined;
  radius?: number;
  category?: string | null;
  limit?: number;
  q?: string | null;
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

export function useInfiniteDiscoverEvents({
  lat,
  lng,
  radius = DISCOVER_RADIUS_KM,
  category,
  limit = 20,
  q,
  enabled: enabledProp = true,
}: UseInfiniteDiscoverEventsArgs) {
  const coords = resolveCoords(lat, lng);
  const enabled = coords !== null && enabledProp;
  const qKey = q?.trim() || null;

  return useInfiniteQuery<DiscoverResponse, Error, import("@tanstack/react-query").InfiniteData<DiscoverResponse>, readonly unknown[], string | null>({
    queryKey: coords !== null
      ? queryKeys.events.discover({
          lat: coords.lat,
          lng: coords.lng,
          radius,
          category: category ?? null,
          cursor: null,
          limit,
          q: qKey,
        })
      : ([...queryKeys.events.all, "discover", "idle"] as const),
    queryFn: ({ pageParam }) =>
      getDiscoverEvents({
        lat: coords!.lat,
        lng: coords!.lng,
        radius,
        category,
        cursor: pageParam,
        limit,
        q: qKey,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_more
        ? (lastPage.pagination.next_cursor ?? undefined)
        : undefined,
    enabled,
  });
}
