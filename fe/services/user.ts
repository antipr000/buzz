import { apiClient } from "@/lib/api/client";

/** User domain API — add async functions using `apiClient`. */
export const usersRoot = "/users";

type MessageResponse = { message: string };

/** DELETE /users/{userId} — soft-deactivate own account; requires auth. */
export async function deactivateAccount(userId: string): Promise<MessageResponse> {
  const { data } = await apiClient.delete<MessageResponse>(
    `${usersRoot}/${encodeURIComponent(userId)}`
  );
  return data;
}
