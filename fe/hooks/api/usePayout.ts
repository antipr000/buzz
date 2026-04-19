import { queryKeys } from "@/lib/query/query-keys";
import { getPayout } from "@/services/payout";
import { useQuery } from "@tanstack/react-query";

/** GET /user/payouts/{id} */
export function usePayout(payoutId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.payouts.detail(payoutId ?? null),
    queryFn: () => getPayout(payoutId as string),
    enabled: Boolean(payoutId?.trim()),
  });
}
