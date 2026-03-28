import { getSupabase } from "@/lib/supabase";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";

/**
 * Deep link / web return URL for Supabase Auth (`redirectTo`, `emailRedirectTo`, etc.):
 * OAuth, email confirmation, magic links. Must match entries in Supabase → Auth → URL Configuration
 * (e.g. `eventapp://**`, `exp://**` for Expo Go). See `app.json` `scheme`.
 */
export function getAuthRedirectUri(): string {
  return makeRedirectUri({
    scheme: "eventapp",
  });
}

/**
 * Completes Supabase auth from a redirect URL (OAuth callback, email confirmation link, etc.).
 * Handles PKCE (`code`) and implicit (`access_token` + `refresh_token` in query or hash).
 *
 * @see https://supabase.com/docs/guides/auth/native-mobile-deep-linking
 */
export async function createSessionFromUrl(url: string): Promise<boolean> {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const oauthError = params.error;
  if (oauthError) {
    throw new Error(params.error_description?.replace(/\+/g, " ") ?? oauthError);
  }

  const supabase = getSupabase();

  const code = params.code;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw error;
    }
    return true;
  }

  const access_token = params.access_token;
  const refresh_token = params.refresh_token;

  if (!access_token) {
    return false;
  }

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? "",
  });

  if (error) {
    throw error;
  }

  return true;
}
