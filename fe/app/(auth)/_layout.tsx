import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack, usePathname } from "expo-router";

export default function AuthLayout() {
  const { session } = useAuth();
  const pathname = usePathname();

  // Let login/signup finish GET /users/me after OAuth or email sign-up before navigating.
  if (session && pathname !== "/login" && pathname !== "/signup") {
    return <Redirect href="/location" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
