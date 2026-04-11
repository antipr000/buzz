import { Text } from '@/components/ui/text'
import { useVerifyBooking } from '@/hooks/api'
import { mapVerifyBookingError } from '@/lib/bookings/map-verify-error'
import { firstParamString } from '@/lib/expo-router/params'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, QrCode } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const IMG_KEYBOARD = require('@/assets/images/createdEvents/verify/keyboard.svg')
const IMG_SEARCH = require('@/assets/images/home/search.svg')
export default function TicketEnterCodeScreen() {
    const router = useRouter()
    const params = useLocalSearchParams<{ eventId?: string | string[] }>()
    const eventId = firstParamString(params.eventId)
    const verify = useVerifyBooking()
    const [code, setCode] = useState('')
    const [inlineError, setInlineError] = useState<string | null>(null)

    const trimmed = code.trim()
    const canSubmit = Boolean(eventId && trimmed.length > 0 && !verify.isPending)

    const submit = () => {
        setInlineError(null)
        if (!eventId) {
            setInlineError('Open verification from one of your created events.')
            return
        }
        if (!trimmed) {
            setInlineError('Enter the booking ID from the ticket.')
            return
        }
        verify.mutate(
            { eventId, booking_id: trimmed },
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
            }
        )
    }

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

                <View className='flex-1 justify-center px-5 pb-10'>
                    <View className='w-full max-w-[400px] self-center'>
                        {!eventId ? (
                            <Text className='mb-4 text-center text-xs text-primary'>
                                Open verification from one of your created events (Verify on the event
                                card).
                            </Text>
                        ) : null}
                        <View className='items-center'>
                            <Image
                                source={IMG_KEYBOARD}
                                style={{ width: 20, height: 20 }}
                                contentFit='contain'
                            />
                            <Text className='mt-4 text-center text-sm font-semibold text-secondary-foreground'>
                                Enter Ticket Code
                            </Text>
                            <Text className='mt-1.5 max-w-[320px] text-center text-xs leading-5 text-[rgba(15,23,42,0.7)]'>
                                Type the order ID shown on the attendee&apos;s ticket
                            </Text>
                        </View>

                        <View className='mt-6 flex-row items-center rounded-xl border border-secondary bg-white pl-3.5 pr-3 py-0.5'>
                            <Image
                                source={IMG_SEARCH}
                                style={{ width: 15, height: 15 }}
                                contentFit='contain'
                            />
                            <TextInput
                                className='min-h-[48px] flex-1 py-1 pl-2.5 text-xs text-[rgba(15,23,42,1)]'
                                placeholder='e.g. bkg_…'
                                placeholderTextColor='rgba(15,23,42,0.3)'
                                autoCorrect={false}
                                autoCapitalize='none'
                                value={code}
                                onChangeText={(t) => {
                                    setCode(t)
                                    if (inlineError) setInlineError(null)
                                }}
                                onSubmitEditing={() => {
                                    if (canSubmit) submit()
                                }}
                                returnKeyType='done'
                                editable={!verify.isPending}
                            />
                        </View>

                        {inlineError ? (
                            <Text className='mt-3 text-center text-xs text-primary'>{inlineError}</Text>
                        ) : null}

                        <TouchableOpacity
                            className='mt-6 mx-auto w-fit min-w-[160px] items-center justify-center rounded-sm bg-secondary py-3.5 px-6'
                            activeOpacity={0.85}
                            disabled={!canSubmit}
                            onPress={submit}
                        >
                            {verify.isPending ? (
                                <ActivityIndicator color='rgba(249, 250, 251, 1)' />
                            ) : (
                                <Text className='text-xs font-medium text-background'>
                                    Verify Ticket
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View className='mt-4 w-fit mx-auto p-5 flex-row gap-3'>
                            <TouchableOpacity
                                className='items-center justify-center rounded-sm border border-[rgba(0,0,0,0.12)] bg-white px-6 py-3'
                                onPress={() => router.back()}
                                activeOpacity={0.8}
                            >
                                <Text className='text-xs font-medium text-[rgba(15,23,42,0.65)]'>
                                    Back
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className='flex-row items-center justify-center gap-2 rounded-sm border border-[rgba(0,0,0,0.12)] bg-[rgba(244,248,255,1)] px-6 py-3'
                                disabled={!eventId}
                                onPress={() => {
                                    if (!eventId) return
                                    router.push({
                                        pathname: '/events/ticket-qr-scan',
                                        params: { eventId },
                                    })
                                }}
                                activeOpacity={0.8}
                            >
                                <QrCode
                                    size={18}
                                    color='rgba(4, 0, 71, 1)'
                                    strokeWidth={2}
                                />
                                <Text className='text-xs font-medium text-secondary'>
                                    Scan QR
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}
