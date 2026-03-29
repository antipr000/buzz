import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { Link, router } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const USER_LOCATION_KEY = "buzz:user_location";

export default function LocationAccessScreen() {
    const [requesting, setRequesting] = useState(false);

    const onAllowLocation = useCallback(async () => {
        setRequesting(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Location access",
                    "Permission was denied. You can enable it in system settings or enter a location manually."
                );
                return;
            }
            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const { latitude, longitude } = position.coords;
            await AsyncStorage.setItem(
                USER_LOCATION_KEY,
                JSON.stringify({ latitude, longitude, updatedAt: Date.now() })
            );
            router.replace("/(main)/(tabs)");
        } catch (e) {
            console.warn("Location error", e);
            Alert.alert(
                "Could not get location",
                "Something went wrong reading your position. Try again or enter a location manually."
            );
        } finally {
            setRequesting(false);
        }
    }, []);
    return (
        <View className="flex-1 bg-white relative">
            {/* Background Map Image */}
            <Image
                source={require("@/assets/images/location/map.png")}
                style={[StyleSheet.absoluteFillObject, { opacity: 0.25 }]}
                contentFit="cover"
            />

            {/* White Overlay to ensure text readability */}
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255, 255, 255, 0.4)' }]} />

            <SafeAreaView className="flex-1 items-center px-8 py-4 justify-center">

                {/* Top Section - Globe Icon */}
                <View className="flex-1 items-center justify-center w-full max-h-[300px]">
                    <View className="w-[170px] h-[170px] bg-white rounded-full items-center justify-center shadow-lg border border-gray-100">
                        <Image
                            source={require("@/assets/images/location/earth.gif")}
                            style={{ width: 150, height: 150 }}
                            contentFit="contain"
                        />
                    </View>
                </View>

                {/* Middle Section - Text Content */}
                <View className="items-center mb-10 w-full">
                    <Text className="text-primary text-2xl font-medium text-center mb-4">
                        Allow Location Access
                    </Text>
                    <Text className="text-primary text-xs font-medium text-center px-4 leading-[20px]">
                        We use your location to show events happening around you
                    </Text>
                </View>

                {/* Bottom Section - Action Buttons */}
                <View className="w-full gap-6 mt-8">
                    <Button
                        className="w-full bg-primary rounded-xl h-12"
                        onPress={onAllowLocation}
                        disabled={requesting}
                    >
                        {requesting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-sm font-semibold">
                                Allow Location
                            </Text>
                        )}
                    </Button>

                    <Link href="/(main)/(tabs)" asChild>
                        <Button
                            variant="outline"
                            className="w-full bg-white border border-primary rounded-xl h-12"
                        >
                            <Text className="text-primary text-sm font-semibold">
                                Enter Location Manually
                            </Text>
                        </Button>
                    </Link>
                </View>

            </SafeAreaView>
        </View>
    );
}
