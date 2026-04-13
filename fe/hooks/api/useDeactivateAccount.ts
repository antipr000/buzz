import { useAuth } from "@/providers/AuthProvider";
import { deactivateAccount } from "@/services/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** DELETE /users/{id} — soft-deactivate; caller should sign out after success. */
export function useDeactivateAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const uid = user?.id;
      if (!uid) throw new Error("Not signed in");
      await deactivateAccount(uid);
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
