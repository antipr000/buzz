import { createSessionFromUrl } from "@/lib/auth/auth-redirect";
import { getSupabase } from "@/lib/auth/supabase";
import * as Linking from "expo-linking";
import { useEffect } from "react";

/**
 * Completes Supabase auth when the app opens or receives a deep link: OAuth return URL,
 * email confirmation / magic-link redirects (same `emailRedirectTo` as OAuth), etc.
 *
 * {@link https://docs.expo.dev/versions/latest/sdk/linking/ Linking.useLinkingURL} covers
 * cold start (`getInitialURL`) and subsequent `url` events.
 */
export function useAuthDeepLink(): void {
  const url = Linking.useLinkingURL();

  useEffect(() => {
    if (!url) return;

    try {
      getSupabase();
    } catch {
      return;
    }

    void (async () => {
      try {
        await createSessionFromUrl(url);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn("[auth] createSessionFromUrl:", msg);
      }
    })();
  }, [url]);
}
