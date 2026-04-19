import { queryKeys } from "@/lib/query/query-keys";
import { deletePayout } from "@/services/payout";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** DELETE /user/payouts/{id} */
export function useDeletePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payoutId: string) => deletePayout(payoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}
