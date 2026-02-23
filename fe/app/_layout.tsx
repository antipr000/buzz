import { NAV_THEME } from "@/lib/theme";
import "../global.css";


import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    Poppins_Medium: Poppins_500Medium,
    Poppins_SemiBold: Poppins_600SemiBold,
    Poppins_Bold: Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return <ThemeProvider value={NAV_THEME['light']}>
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-event" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="all" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  </ThemeProvider>

}
