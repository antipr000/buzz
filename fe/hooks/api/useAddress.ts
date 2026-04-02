import { queryKeys } from "@/lib/query/query-keys";
import { getAddress } from "@/services/address";
import { useQuery } from "@tanstack/react-query";

/** GET /user/addresses/{id} — disabled when `addressId` is missing. */
export function useAddress(addressId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.addresses.detail(addressId ?? null),
    queryFn: () => getAddress(addressId!),
    enabled: Boolean(addressId),
  });
}
