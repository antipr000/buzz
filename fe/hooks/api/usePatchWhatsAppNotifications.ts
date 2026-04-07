import { queryKeys } from "@/lib/query/query-keys";
import { patchProfileMe } from "@/services/profile";
import type { ProfileMeResponse } from "@/services/types/profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function usePatchWhatsAppNotifications() {
  const queryClient = useQueryClient();
  const meKey = queryKeys.profile.me();

  return useMutation({
    mutationFn: (enabled: boolean) =>
      patchProfileMe({ whatsapp_notifications_enabled: enabled }),
    onMutate: async (enabled) => {
      await queryClient.cancelQueries({ queryKey: meKey });
      const previous = queryClient.getQueryData<ProfileMeResponse>(meKey);
      if (previous) {
        queryClient.setQueryData<ProfileMeResponse>(meKey, {
          ...previous,
          whatsapp_notifications_enabled: enabled,
        });
      }
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(meKey, ctx.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(meKey, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.stats() });
    },
  });
}
