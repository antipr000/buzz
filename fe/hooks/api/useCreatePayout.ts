import { queryKeys } from "@/lib/query/query-keys";
import { createPayout } from "@/services/payout";
import type { PayoutCreatePayload } from "@/services/types/payout";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** POST /user/payouts */
export function useCreatePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PayoutCreatePayload) => createPayout(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}
