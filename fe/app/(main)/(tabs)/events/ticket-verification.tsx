import { Text } from '@/components/ui/text'
import { Image } from 'expo-image'
import { type Href, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const IMG_QR = require('@/assets/images/verify/QR.svg')
const IMG_CAMERA = require('@/assets/images/verify/camera.svg')
const IMG_KEYBOARD = require('@/assets/images/verify/keyboard.svg')

export default function TicketVerificationScreen() {
    const router = useRouter()

    const header = (
        <View className='flex-row items-center gap-4 bg-secondary px-5 py-10 pb-3'>
            <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <ArrowLeft size={24} color='rgba(249, 250, 251, 1)' strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className='text-xl font-semibold text-background'>Your Events</Text>
        </View>
    )

    return (
        <SafeAreaView className='flex-1 bg-[rgba(249,250,251,1)]' edges={['top']}>
            <View className='flex-1'>
                {header}

                <ScrollView
                    className='flex-1'
                    contentContainerClassName='items-center px-5 pb-10 pt-8'
                    showsVerticalScrollIndicator={false}
                >
                    <Image
                        source={IMG_QR}
                        style={{ width: 95, height: 95 }}
                        contentFit='contain'
                    />

                    <Text className='mt-6 text-center text-base font-semibold text-[rgba(15,23,42,1)]'>
                        Ticket Verification
                    </Text>
                    <Text className='mt-2 max-w-[300px] text-center text-xs text-[rgba(15,23,42,0.7)]'>
                        Choose how you’d like to verify attendee tickets
                    </Text>

                    <View className='mt-9 w-full max-w-[400px] gap-4'>
                        <TouchableOpacity
                            className='flex-row mx-4 items-center gap-3.5 rounded-2xl border border-[rgba(0,0,0,0.08)] bg-[rgba(244,248,255,1)] px-4 py-3 shadow-sm shadow-black/5'
                            onPress={() => router.push('/events/ticket-qr-scan' as Href)}
                            activeOpacity={0.8}
                        >
                            <View className='h-12 w-12 items-center justify-center rounded-xl bg-[rgba(79,70,229,1)]'>
                                <Image
                                    source={IMG_CAMERA}
                                    style={{ width: 26, height: 24 }}
                                    contentFit='contain'
                                />
                            </View>
                            <View className='min-w-0 flex-1'>
                                <Text className='text-sm font-medium text-[rgba(15,23,42,1)]'>
                                    Scan QR Code
                                </Text>
                                <Text className='mt-0.5 text-xs text-[rgba(15,23,42,0.7)]'>
                                    Use camera to scan ticket QR
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className='flex-row mx-4 items-center gap-3.5 rounded-2xl border border-[rgba(0,0,0,0.08)] bg-[rgba(244,248,255,1)] px-4 py-3 shadow-sm shadow-black/5'
                            onPress={() => router.push('/events/ticket-enter-code' as Href)}
                            activeOpacity={0.8}
                        >
                            <View className='h-12 w-12 items-center justify-center rounded-xl bg-[rgba(79,70,229,1)]'>
                                <Image
                                    source={IMG_KEYBOARD}
                                    style={{ width: 26, height: 26 }}
                                    contentFit='contain'
                                />
                            </View>
                            <View className='min-w-0 flex-1'>
                                <Text className='text-sm font-medium text-[rgba(15,23,42,1)]'>
                                    Enter Code Manually
                                </Text>
                                <Text className='mt-0.5 text-xs text-[rgba(15,23,42,0.7)]'>
                                    Type the ticket code
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
