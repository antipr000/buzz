import { createSessionFromUrl, getAuthRedirectUri } from "./auth-redirect";
import { getSupabase } from "./supabase";
import * as WebBrowser from "expo-web-browser";

export { createSessionFromUrl, getAuthRedirectUri } from "./auth-redirect";

export type GoogleSignInResult =
  | { status: "success" }
  | { status: "cancelled" }
  | { status: "error"; message: string };

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  let supabase: ReturnType<typeof getSupabase>;
  try {
    supabase = getSupabase();
  } catch {
    return { status: "error", message: "Supabase is not configured." };
  }

  const redirectTo = getAuthRedirectUri();

  // Asking Supabase for a URL to redirect to for Google sign in
  const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (oauthError) {
    return { status: "error", message: oauthError.message };
  }
  const authUrl = data?.url;
  if (!authUrl) {
    return { status: "error", message: "No OAuth URL returned." };
  }
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);

  if (result.type === "cancel" || result.type === "dismiss") {
    return { status: "cancelled" };
  }

  if (result.type !== "success" || !result.url) {
    return { status: "error", message: "Sign-in was not completed." };
  }

  try {
    const applied = await createSessionFromUrl(result.url);
    if (!applied) {
      return {
        status: "error",
        message: "No session in redirect URL.",
      };
    }
    return { status: "success" };
  } catch (e) {
    const message = e instanceof Error ? e.message : "OAuth failed.";
    return { status: "error", message };
  }
}
