import { NAV_THEME } from "@/lib/theme";
import "../global.css";


import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";

export default function RootLayout() {
  return <ThemeProvider value={NAV_THEME['light']}>
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-event" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  </ThemeProvider>

}
