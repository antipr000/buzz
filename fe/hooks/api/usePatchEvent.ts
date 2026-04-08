import { queryKeys } from "@/lib/query/query-keys";
import { patchEvent } from "@/services/events";
import type { PatchEventBody } from "@/services/types/events";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type PatchEventVariables = {
  eventId: string;
  body: PatchEventBody;
};

export function usePatchEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, body }: PatchEventVariables) =>
      patchEvent(eventId, body),
    onSuccess: (data, { eventId }) => {
      queryClient.setQueryData(queryKeys.events.detail(eventId), data);
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.events.all, "discover"],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.events.all, "created"],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.events.all, "saved"],
      });
    },
  });
}
