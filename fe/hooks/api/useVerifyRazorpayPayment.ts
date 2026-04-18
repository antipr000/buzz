import { queryKeys } from "@/lib/query/query-keys";
import { postVerifyRazorpayPayment } from "@/services/booking";
import type { VerifyRazorpayPaymentBody } from "@/services/types/booking";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** POST /events/verify-razorpay-payment */
export function useVerifyRazorpayPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: VerifyRazorpayPaymentBody) =>
      postVerifyRazorpayPayment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.events.all, "bookings"],
      });
    },
  });
}
