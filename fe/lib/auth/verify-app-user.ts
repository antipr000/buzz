import { apiClient } from "@/lib/api/client";
import { getSupabase } from "@/lib/auth/supabase";
import { isAxiosError } from "axios";

/** After Supabase sign-in: ensure Buzz API accepts this user (active app row). */
export async function verifyAppUserOrSignOut(
  supabase: ReturnType<typeof getSupabase>
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await apiClient.get("/users/me");
    return { ok: true };
  } catch (err) {
    if (!isAxiosError(err)) {
      return {
        ok: false,
        message:
          "Could not reach the app. Check your connection and try again.",
      };
    }
    const status = err.response?.status;

    if (status === 403) {
      await supabase.auth.signOut();
      return {
        ok: false,
        message: "This account is deactivated or blocked.",
      };
    }
    if (status === 404) {
      await supabase.auth.signOut();
      return {
        ok: false,
        message: "You can't sign in with this account.",
      };
    }
    return {
      ok: false,
      message: "Could not load your account. Please try again.",
    };
  }
}
