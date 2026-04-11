import { Text } from '@/components/ui/text'
import { Image } from 'expo-image'
import { type Href, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React from 'react'
import { TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const IMG_QR_BADGE = require('@/assets/images/createdEvents/verify/QR.svg')
const IMG_KEYBOARD = require('@/assets/images/createdEvents/verify/keyboard.svg')

const VIEWFINDER_GREY = 'rgba(217, 217, 217, 1)'

export default function TicketQrScanScreen() {
    const router = useRouter()
    const { width } = useWindowDimensions()
    const viewfinderSize = Math.min(width - 100, 200)

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

                <View className='flex-1 justify-center items-center px-5'>
                    <View className='flex-row items-center gap-2 rounded-sm bg-secondary px-7 py-2'>
                        <Image
                            source={IMG_QR_BADGE}
                            style={{ width: 15, height: 15 }}
                            contentFit='contain'
                        />
                        <Text className='text-xs font-medium text-background'>QR Scan</Text>
                    </View>

                    <View
                        style={{
                            width: viewfinderSize,
                            height: viewfinderSize,
                            marginTop: 24,
                            backgroundColor: VIEWFINDER_GREY,
                        }}
                    />

                    <Text className='mt-6 max-w-[300px] text-center text-xs text-[rgba(15,23,42,0.8)]'>
                        Point the camera at the ticket QR code
                    </Text>

                    <View className='mt-4 w-fit mx-auto p-5 flex-row gap-3'>
                            <TouchableOpacity
                                className='items-center px-6 py-3.5 justify-center rounded-sm border border-[rgba(0,0,0,0.12)] bg-white px-6 py-3'
                                onPress={() => router.back()}
                                activeOpacity={0.8}
                            >
                            <Text className='text-xs text-[rgba(15,23,42,0.8)] '>
                                Back
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className=' flex-row items-center justify-center gap-2 rounded-sm border border-[rgba(0,0,0,0.12)] bg-[rgba(244,248,255,1)] px-6 py-3.5'
                            onPress={() => router.push('/events/ticket-enter-code' as Href)}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={IMG_KEYBOARD}
                                style={{ width: 12, height: 12 }}
                                contentFit='contain'
                            />
                            <Text className='text-xs font-medium text-[rgba(15,23,42,0.8)] '>
                                Enter code
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}
