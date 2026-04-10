import { View, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import { Text } from '@/components/ui/text'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { firstParamString } from '@/lib/expo-router/params'

export default function EventBooked() {
    const router = useRouter()
    const params = useLocalSearchParams<{
        bookingId?: string | string[]
        paymentStatus?: string | string[]
        eventTitle?: string | string[]
    }>()
    const bookingId = firstParamString(params.bookingId)
    const paymentStatus = firstParamString(params.paymentStatus)
    const eventTitle = firstParamString(params.eventTitle)

    const isCompleted = paymentStatus?.toUpperCase() === 'COMPLETED'

    const goToEvents = useCallback(() => {
        router.dismissAll()
        router.replace('/(main)/(tabs)/events')
    }, [router])

    useEffect(() => {
        if (!bookingId) return
        const timer = setTimeout(goToEvents, 3000)
        return () => clearTimeout(timer)
    }, [bookingId, goToEvents])

    if (!bookingId) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
                <Text className="text-center text-secondary-foreground text-sm mb-4">
                    Missing booking details.
                </Text>
                <TouchableOpacity
                    onPress={goToEvents}
                    activeOpacity={0.85}
                    className="bg-primary px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-semibold text-sm">Go to my events</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <View className="items-center justify-center mb-4 -mt-16">
                <Image
                    source={require('@/assets/images/create/img.gif')}
                    style={{ width: 250, height: 250 }}
                    contentFit="contain"
                />
            </View>
            <Text className="text-primary font-semibold text-2xl text-center px-6">
                {"Booking Done!"}
            </Text>
            {eventTitle ? (
                <Text
                    className="text-secondary-foreground text-sm text-center mt-2 px-8"
                    numberOfLines={2}
                >
                    {eventTitle}
                </Text>
            ) : null}
            <Text className="text-[rgba(15,23,42,0.7)] text-xs text-center mt-3 px-8 leading-snug">
                {isCompleted
                    ? 'No payment required — you are all set.'
                    : 'Payment is still pending. Complete it when you are ready.'}
            </Text>
            {/* <Text className="text-secondary-foreground text-[11px] text-center mt-4 px-6">
                Reference: {bookingId}
            </Text> */}
        </SafeAreaView>
    )
}
