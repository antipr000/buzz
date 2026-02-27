import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function WelcomeScreen() {
    return (
        <View className="flex-1 bg-primary relative overflow-hidden">
            {/* Background Image with Opacity */}
            <Image
                source={require("@/assets/images/first/img1.png")}
                style={[StyleSheet.absoluteFillObject, { opacity: 0.15 }]}
                contentFit="cover"
            />

            <SafeAreaView className="flex-1 px-5 justify-center">

                <View className="flex-1 items-center justify-center -mt-10">
                    <Text className="text-white text-[32px] font-bold text-center leading-[38px]">
                        What&apos;s buzzing{"\n"}near you ?
                    </Text>
                    <Text className="text-[rgba(196,240,0,1)] text-sm  mt-3 text-center">
                        Discover nearby events or create your own
                    </Text>

                    <View className="mt-12 mb-10">
                        <Image
                            source={require("@/assets/images/first/location.gif")}
                            style={{ width: 100, height: 100, borderRadius: 50 }}
                            contentFit="contain"
                        />
                    </View>

                    <View className="w-full gap-6 mt-6 px-10">
                        <Link href="/(auth)/signup" asChild>
                            <Button className="w-full bg-white rounded-lg h-12">
                                <Text className="text-secondary-foreground text-sm font-medium">
                                    Find events near me
                                </Text>
                            </Button>
                        </Link>

                        <Link href="/(auth)/signup" asChild>
                            <Button
                                variant="outline"
                                className="w-full bg-primary border border-white/40 rounded-lg h-12"
                            >
                                <Text className="text-white  text-sm font-medium">
                                    Create an Event
                                </Text>
                            </Button>
                        </Link>
                    </View>
                </View>

            </SafeAreaView>
        </View>
    );
}
