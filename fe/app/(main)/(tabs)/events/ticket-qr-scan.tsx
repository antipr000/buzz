import { Text } from '@/components/ui/text'
import { useVerifyBooking } from '@/hooks/api'
import { mapVerifyBookingError } from '@/lib/bookings/map-verify-error'
import { firstParamString } from '@/lib/expo-router/params'
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React, { useCallback, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Platform,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const IMG_QR_BADGE = require('@/assets/images/createdEvents/verify/QR.svg')
const IMG_KEYBOARD = require('@/assets/images/createdEvents/verify/keyboard.svg')

function parseBookingIdFromScan(data: string): string {
    const trimmed = data.trim()
    if (!trimmed) return ''
    const match = trimmed.match(/bkg_[a-zA-Z0-9_-]+/)
    if (match) return match[0]
    return trimmed
}

export default function TicketQrScanScreen() {
    const router = useRouter()
    const params = useLocalSearchParams<{ eventId?: string | string[] }>()
    const eventId = firstParamString(params.eventId)
    const { width } = useWindowDimensions()
    const viewfinderSize = Math.min(width - 100, 280)

    const [permission, requestPermission] = useCameraPermissions()
    const verify = useVerifyBooking()
    const [inlineError, setInlineError] = useState<string | null>(null)

    const lockRef = useRef(false)

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

    const onBarcodeScanned = useCallback(
        (result: BarcodeScanningResult) => {
            setInlineError(null)
            if (!eventId || lockRef.current || verify.isPending) return

            const booking_id = parseBookingIdFromScan(result.data)
            if (!booking_id) return

            lockRef.current = true
            verify.mutate(
                { eventId, booking_id },
                {
                    onSuccess: (data) => {
                        router.replace({
                            pathname: '/events/ticket-verified',
                            params: {
                                eventId,
                                bookingId: data.booking.id,
                            },
                        })
                    },
                    onError: (err) => {
                        setInlineError(mapVerifyBookingError(err))
                    },
                    onSettled: () => {
                        lockRef.current = false
                    },
                }
            )
        },
        [eventId, router, verify]
    )

    return (
        <SafeAreaView className='flex-1 bg-[rgba(249,250,251,1)]' edges={['top']}>
            <View className='flex-1'>
                {header}

                <View className='flex-1 px-5 pb-6'>
                    <View className='mt-2 flex-row items-center gap-2 self-center rounded-sm bg-secondary px-7 py-2'>
                        <Image
                            source={IMG_QR_BADGE}
                            style={{ width: 15, height: 15 }}
                            contentFit='contain'
                        />
                        <Text className='text-xs font-medium text-background'>QR Scan</Text>
                    </View>

                    {!eventId ? (
                        <Text className='mt-4 max-w-[320px] self-center text-center text-xs text-primary'>
                            Open verification from one of your created events (Verify on the event card).
                        </Text>
                    ) : null}

                    {eventId && Platform.OS === 'web' ? (
                        <Text className='mt-4 max-w-[320px] self-center text-center text-xs text-[rgba(15,23,42,0.8)]'>
                            QR scanning is not available on web. Use Enter code instead.
                        </Text>
                    ) : null}

                    {eventId && Platform.OS !== 'web' && permission === null ? (
                        <View className='mt-10 items-center'>
                            <ActivityIndicator size='small' color='rgba(4, 0, 71, 1)' />
                        </View>
                    ) : null}

                    {eventId && Platform.OS !== 'web' && permission && !permission.granted ? (
                        <View className='mt-6 items-center gap-3'>
                            <Text className='max-w-[300px] text-center text-xs text-[rgba(15,23,42,0.8)]'>
                                Camera access is needed to scan ticket QR codes.
                            </Text>
                            <TouchableOpacity
                                className='rounded-sm bg-secondary px-6 py-3.5'
                                onPress={() => requestPermission()}
                                activeOpacity={0.85}
                            >
                                <Text className='text-xs font-medium text-background'>
                                    Allow camera
                                </Text>
                            </TouchableOpacity>
                            {permission.canAskAgain === false ? (
                                <Text className='max-w-[280px] text-center text-xs text-[rgba(15,23,42,0.55)]'>
                                    Camera is off for this app. Enable it in system settings, then return
                                    here.
                                </Text>
                            ) : null}
                        </View>
                    ) : null}

                    {eventId && Platform.OS !== 'web' && permission?.granted ? (
                        <View className='mt-6 flex-1 min-h-[220px]'>
                            <View
                                className='self-center overflow-hidden rounded-xl bg-black'
                                style={{
                                    width: viewfinderSize,
                                    height: viewfinderSize,
                                }}
                            >
                                <CameraView
                                    style={{ width: '100%', height: '100%' }}
                                    facing='back'
                                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                                    onBarcodeScanned={verify.isPending ? undefined : onBarcodeScanned}
                                    active={!verify.isPending}
                                />
                                {verify.isPending ? (
                                    <View className='absolute inset-0 items-center justify-center bg-black/35'>
                                        <ActivityIndicator
                                            size='large'
                                            color='rgba(249, 250, 251, 1)'
                                        />
                                    </View>
                                ) : null}
                            </View>

                            <Text className='mt-4 max-w-[300px] self-center text-center text-xs text-[rgba(15,23,42,0.8)]'>
                                Point the camera at the ticket QR code
                            </Text>

                            {inlineError ? (
                                <Text className='mt-3 max-w-[320px] self-center text-center text-xs text-primary'>
                                    {inlineError}
                                </Text>
                            ) : null}
                        </View>
                    ) : null}

                    <View className='mt-4 w-fit mx-auto flex-row flex-wrap justify-center gap-3 p-2'>
                        <TouchableOpacity
                            className='items-center justify-center rounded-sm border border-[rgba(0,0,0,0.12)] bg-white px-6 py-3.5'
                            onPress={() => router.back()}
                            activeOpacity={0.8}
                        >
                            <Text className='text-xs text-[rgba(15,23,42,0.8)]'>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className='flex-row items-center justify-center gap-2 rounded-sm border border-[rgba(0,0,0,0.12)] bg-[rgba(244,248,255,1)] px-6 py-3.5'
                            disabled={!eventId}
                            onPress={() => {
                                if (!eventId) return
                                router.push({
                                    pathname: '/events/ticket-enter-code',
                                    params: { eventId },
                                })
                            }}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={IMG_KEYBOARD}
                                style={{ width: 12, height: 12 }}
                                contentFit='contain'
                            />
                            <Text className='text-xs font-medium text-[rgba(15,23,42,0.8)]'>
                                Enter code
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}
