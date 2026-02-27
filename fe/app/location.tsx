import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LocationAccessScreen() {
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
                    <Link href="/(tabs)" asChild>
                        <Button className="w-full bg-primary rounded-xl h-12">
                            <Text className="text-white text-sm font-semibold">
                                Allow Location
                            </Text>
                        </Button>
                    </Link>

                    <Link href="/(tabs)" asChild>
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
