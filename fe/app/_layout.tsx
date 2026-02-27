import { NAV_THEME } from "@/lib/theme";
import "../global.css";

import { useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    Poppins_Medium: Poppins_500Medium,
    Poppins_SemiBold: Poppins_600SemiBold,
    Poppins_Bold: Poppins_700Bold,
  });

  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);

  if (!fontsLoaded || !splashAnimationFinished) {
    return (
      <AnimatedSplashScreen
        onAnimationFinish={() => setSplashAnimationFinished(true)}
      />
    );
  }

  return <ThemeProvider value={NAV_THEME['light']}>
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="location" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-event" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="all" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  </ThemeProvider>;
}
