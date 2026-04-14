import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack, usePathname } from "expo-router";

export default function AuthLayout() {
  const { session } = useAuth();
  const pathname = usePathname();

  // Let the login screen finish API verification before navigating. Other auth
  // routes (e.g. signup) still bounce logged-in users to the app.
  if (session && pathname !== "/login") {
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
