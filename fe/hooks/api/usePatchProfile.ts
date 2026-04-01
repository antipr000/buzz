import { queryKeys } from "@/lib/query/query-keys";
import { patchProfileMe } from "@/services/profile";
import type { ProfilePatchPayload } from "@/services/types/profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function usePatchProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: ProfilePatchPayload) => patchProfileMe(patch),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile.me(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.stats() });  // invalidates fields like name fetched from it.
    },
  });
}
