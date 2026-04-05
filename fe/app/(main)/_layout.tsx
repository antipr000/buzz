import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack } from "expo-router";

export default function MainLayout() {
  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/login" />;
  }

  console.log("session", session.access_token);

  return (
    <Stack
      screenOptions={({ route }) => {
        const name = route.name;
        if (name === "event-created") {
          return {
            headerShown: false,
            presentation: "fullScreenModal" as const,
          };
        }
        if (
          name === "create-event" ||
          name === "event/[id]" ||
          name === "all"
        ) {
          return {
            headerShown: false,
            presentation: "modal" as const,
          };
        }
        return { headerShown: false };
      }}
    />
  );
}
