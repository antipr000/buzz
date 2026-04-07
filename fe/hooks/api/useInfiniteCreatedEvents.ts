import { queryKeys } from "@/lib/query/query-keys";
import { getCreatedEvents } from "@/services/events";
import type { CreatedListResponse } from "@/services/types/events";
import { useInfiniteQuery } from "@tanstack/react-query";

export type UseInfiniteCreatedEventsArgs = {
  limit?: number;
  enabled?: boolean;
};

export function useInfiniteCreatedEvents({
  limit = 20,
  enabled: enabledProp = true,
}: UseInfiniteCreatedEventsArgs = {}) {
  return useInfiniteQuery<
    CreatedListResponse,
    Error,
    import("@tanstack/react-query").InfiniteData<CreatedListResponse>,
    readonly unknown[],
    string | null
  >({
    queryKey: queryKeys.events.created({ limit }),
    queryFn: ({ pageParam }) =>
      getCreatedEvents({ cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_more
        ? (lastPage.pagination.next_cursor ?? undefined)
        : undefined,
    enabled: enabledProp,
  });
}
