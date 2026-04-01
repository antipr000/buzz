import { queryKeys } from "@/lib/query/query-keys";
import { getSavedEvents } from "@/services/events";
import type { SavedListResponse } from "@/services/types/events";
import { useInfiniteQuery } from "@tanstack/react-query";

export type UseInfiniteSavedEventsArgs = {
  limit?: number;
  enabled?: boolean;
};

export function useInfiniteSavedEvents({
  limit = 20,
  enabled: enabledProp = true,
}: UseInfiniteSavedEventsArgs = {}) {
  return useInfiniteQuery<
    SavedListResponse,
    Error,
    import("@tanstack/react-query").InfiniteData<SavedListResponse>,
    readonly unknown[],
    string | null
  >({
    queryKey: queryKeys.events.saved({ limit }),
    queryFn: ({ pageParam }) =>
      getSavedEvents({ cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_more
        ? (lastPage.pagination.next_cursor ?? undefined)
        : undefined,
    enabled: enabledProp,
  });
}
