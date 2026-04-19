import { queryKeys } from "@/lib/query/query-keys";
import { patchPayout } from "@/services/payout";
import type { PayoutPatchPayload } from "@/services/types/payout";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** PATCH /user/payouts/{id} */
export function usePatchPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payoutId,
      patch,
    }: {
      payoutId: string;
      patch: PayoutPatchPayload;
    }) => patchPayout(payoutId, patch),
    onSuccess: (_data, { payoutId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payouts.detail(payoutId),
      });
    },
  });
}
