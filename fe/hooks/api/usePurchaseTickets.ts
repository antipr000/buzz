import { queryKeys } from "@/lib/query/query-keys";
import { postPurchase } from "@/services/booking";
import type { PurchaseBody } from "@/services/types/booking";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** POST /events/purchase */
export function usePurchaseTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PurchaseBody) => postPurchase(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.events.all, "bookings"],
      });
      /** New checkout addresses are created on the server during purchase (not via useCreateAddress). */
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}
