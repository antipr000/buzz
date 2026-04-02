import { queryKeys } from "@/lib/query/query-keys";
import { createAddress } from "@/services/address";
import type { AddressCreatePayload } from "@/services/types/address";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** POST /user/addresses */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddressCreatePayload) => createAddress(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}
