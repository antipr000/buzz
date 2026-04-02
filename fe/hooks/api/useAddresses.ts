import { queryKeys } from "@/lib/query/query-keys";
import { getAddresses } from "@/services/address";
import { useQuery } from "@tanstack/react-query";

/** GET /user/addresses */
export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: getAddresses,
  });
}
