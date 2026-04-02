import { queryKeys } from "@/lib/query/query-keys";
import { deleteAddress } from "@/services/address";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** DELETE /user/addresses/{id} */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => deleteAddress(addressId),
    onSuccess: (_, addressId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.addresses.detail(addressId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}
