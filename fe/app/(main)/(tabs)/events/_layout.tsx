import { Stack } from 'expo-router';

export default function EventsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="ticket" />
            <Stack.Screen name="ticket-verification" />
            <Stack.Screen name="ticket-qr-scan" />
            <Stack.Screen name="ticket-enter-code" />
        </Stack>
    );
}
