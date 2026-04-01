import { queryKeys } from "@/lib/query/query-keys";
import { getEventById } from "@/services/events";
import { useQuery } from "@tanstack/react-query";

export function useEventDetail(eventId: string | undefined) {
  const id = eventId?.trim() || undefined;

  return useQuery({
    queryKey: id
      ? queryKeys.events.detail(id)
      : ([...queryKeys.events.all, "detail", "idle"] as const),
    queryFn: () => getEventById(id!),
    enabled: Boolean(id),
  });
}
