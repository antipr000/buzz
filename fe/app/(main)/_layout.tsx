import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function MainLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

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
