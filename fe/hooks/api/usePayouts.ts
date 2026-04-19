import { queryKeys } from "@/lib/query/query-keys";
import { getPayouts } from "@/services/payout";
import { useQuery } from "@tanstack/react-query";

/** GET /user/payouts */
export function usePayouts() {
  return useQuery({
    queryKey: queryKeys.payouts.list(),
    queryFn: () => getPayouts(),
  });
}
