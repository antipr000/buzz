import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { Image } from 'expo-image'
import { Link, router } from "expo-router"
import React, { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Reusing the same structure as the sign-up page for consistency
const LoginScreen = () => {
    const [keepSignedIn, setKeepSignedIn] = useState(false)

    return (
        <SafeAreaView className='flex-1 bg-background'>
            <ScrollView
                contentContainerClassName='flex-grow items-center justify-center px-8'
                keyboardShouldPersistTaps='handled'
                automaticallyAdjustKeyboardInsets={true}
                showsVerticalScrollIndicator={false}
            >
                {/* Logo */}
                <Image
                    source={require("@/assets/images/top.svg")}
                    contentFit="contain"
                    style={{ width: 60, height: 63 }}
                />

                {/* Title */}
                <Text className='text-secondary text-xl font-medium mt-2 mb-7'>
                    Welcome Back
                </Text>

                {/* Email */}
                <View className='w-full mb-3'>
                    <View className='flex flex-row items-center gap-2 mb-1.5'>
                        <Image
                            source={require("@/assets/images/email.svg")}
                            contentFit="contain"
                            style={{ width: 15, height: 15 }}
                        />
                        <Text className='text-xs font-medium text-secondary-foreground'>Email</Text>
                    </View>
                    <Input
                        placeholder="you@gmail.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="h-10 text-xs placeholder:text-[rgba(10,13,26,0.3)]"
                    />
                </View>

                {/* Password */}
                <View className='w-full mb-4'>
                    <View className='flex flex-row items-center gap-2 mb-1.5'>
                        <Image
                            source={require("@/assets/images/lock.svg")}
                            contentFit="contain"
                            style={{ width: 15, height: 15 }}
                        />
                        <Text className='text-xs font-medium text-secondary-foreground'>Password</Text>
                    </View>
                    <Input
                        placeholder="••••••••••"
                        secureTextEntry
                        className="h-10 text-xs placeholder:text-[rgba(10,13,26,0.3)]"
                    />
                </View>

                {/* Keep me signed in Checkbox */}
                <View className='flex flex-row items-center gap-2 w-full mb-6'>
                    <Checkbox
                        checked={keepSignedIn}
                        onCheckedChange={setKeepSignedIn}
                        className="rounded-sm w-4 h-4"

                    />
                    <Text className='text-[11px] text-muted-foreground'>
                        Keep me signed in
                    </Text>
                </View>

                {/* Sign In Button */}
                <Button className='w-full rounded-xl h-11 mb-4 bg-primary'>
                    <Text className='text-primary-foreground text-sm font-medium'>Sign in</Text>
                </Button>

                {/* OR Divider */}
                <Text className='text-secondary-foreground text-xs font-bold mb-4'>OR</Text>

                {/* Google Sign In */}
                <Button onPress={() => router.replace("/(tabs)")} variant='outline' className='w-full rounded-xl h-11 border-primary bg-background mb-4'>
                    <Image
                        source={require("@/assets/images/google.svg")}
                        contentFit="contain"
                        style={{ width: 15, height: 15 }}
                    />
                    <Text className='text-primary text-sm font-medium'>Sign in with Google</Text>
                </Button>

                {/* Don't have an account? Sign up */}
                <View className='flex flex-row items-center mb-6'>
                    <Text className='text-xs text-muted-foreground opacity-60'>Don't have an account? </Text>
                    <Link href={"/(auth)" as any} asChild>
                        <Text className='text-xs text-primary font-medium'>Sign up</Text>
                    </Link>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default LoginScreen
