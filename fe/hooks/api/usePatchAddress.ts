import { queryKeys } from "@/lib/query/query-keys";
import { patchAddress } from "@/services/address";
import type { AddressPatchPayload } from "@/services/types/address";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** PATCH /user/addresses/{id} */
export function usePatchAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      patch,
    }: {
      addressId: string;
      patch: AddressPatchPayload;
    }) => patchAddress(addressId, patch),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.addresses.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}
