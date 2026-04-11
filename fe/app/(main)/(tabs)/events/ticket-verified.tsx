import { Text } from '@/components/ui/text'
import { formatEventWhen, formatTicketLines } from '@/lib/bookings/display'
import { firstParamString } from '@/lib/expo-router/params'
import { queryKeys } from '@/lib/query/query-keys'
import type {
    OrganizerVerifyBookingOutcome,
    OrganizerVerifyBookingResponse,
} from '@/services/types/booking'
import { useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React, { useMemo } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const OUTCOMES: OrganizerVerifyBookingOutcome[] = [
    'checked_in',
    'already_attended',
    'pending_payment',
    'payment_failed',
]

function isOutcome(v: string | undefined): v is OrganizerVerifyBookingOutcome {
    return v !== undefined && OUTCOMES.includes(v as OrganizerVerifyBookingOutcome)
}

export default function TicketVerifiedScreen() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const params = useLocalSearchParams<{
        eventId?: string | string[]
        bookingId?: string | string[]
    }>()

    const eventId = firstParamString(params.eventId)
    const bookingId = firstParamString(params.bookingId)

    const payload = useMemo(() => {
        if (!eventId || !bookingId) return undefined
        return queryClient.getQueryData<OrganizerVerifyBookingResponse>(
            queryKeys.events.organizerVerifyPreview(eventId, bookingId)
        )
    }, [queryClient, eventId, bookingId])

    const header = (
        <View className='px-5 py-10 pb-3 bg-secondary flex-row items-center gap-4'>
            <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <ArrowLeft size={24} color='rgba(249, 250, 251, 1)' strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className='text-background text-xl font-semibold'>Verified ticket</Text>
        </View>
    )

    if (!eventId || !bookingId) {
        return (
            <SafeAreaView className='flex-1 bg-background' edges={['top']}>
                <View className='flex-1'>
                    {header}
                    <View className='flex-1 items-center justify-center px-8'>
                        <Text className='text-[rgba(15,23,42,0.75)] text-sm text-center'>
                            Missing event or booking. Go back and verify again.
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    if (!payload) {
        return (
            <SafeAreaView className='flex-1 bg-background' edges={['top']}>
                <View className='flex-1'>
                    {header}
                    <View className='flex-1 items-center justify-center px-8'>
                        <Text className='text-[rgba(15,23,42,0.75)] text-sm text-center'>
                            Verification details are no longer available. Return to verification and
                            scan or enter the code again.
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    const { booking, outcome } = payload
    const outcomeOk = isOutcome(outcome) ? outcome : undefined

    const lang =
        booking.language?.trim() && booking.language.trim() !== ''
            ? booking.language.trim()
            : '—'
    const ticketsText = formatTicketLines(booking.tickets)

    let banner: React.ReactNode = null
    if (outcomeOk === 'checked_in') {
        banner = (
            <View className='bg-[rgba(9,183,9,0.08)] border border-[rgba(9,183,9,0.2)] flex-row items-center gap-2 p-3 rounded-md mb-6'>
                <Image
                    source={require('@/assets/images/tick.svg')}
                    style={{ width: 12, height: 12 }}
                    contentFit='contain'
                />
                <Text className='text-[#16A34A] font-bold text-xs'>Checked in successfully</Text>
            </View>
        )
    } else if (outcomeOk === 'already_attended') {
        banner = (
            <View className='bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] p-3 rounded-md mb-6'>
                <Text className='text-[#2563EB] font-bold text-xs'>Already checked in</Text>
                <Text className='text-[rgba(15,23,42,0.7)] text-[11px] mt-1'>
                    This ticket was verified earlier.
                </Text>
            </View>
        )
    } else if (outcomeOk === 'pending_payment') {
        banner = (
            <View className='bg-[rgba(234,179,8,0.1)] border border-[rgba(234,179,8,0.35)] p-3 rounded-md mb-6'>
                <Text className='text-[#CA8A04] font-bold text-xs'>Payment pending</Text>
                <Text className='text-[rgba(15,23,42,0.7)] text-[11px] mt-1'>
                    Payment is not completed for this booking.
                </Text>
            </View>
        )
    } else if (outcomeOk === 'payment_failed') {
        banner = (
            <View className='bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] p-3 rounded-md mb-6'>
                <Text className='text-[#DC2626] font-bold text-xs'>Payment failed</Text>
                <Text className='text-[rgba(15,23,42,0.7)] text-[11px] mt-1'>
                    This booking does not have a successful payment.
                </Text>
            </View>
        )
    }

    return (
        <SafeAreaView className='flex-1 bg-background' edges={['top']}>
            <View className='flex-1'>
                {header}

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                >
                    {banner}

                    <View className='bg-white w-full max-w-[400px] self-center rounded-xl overflow-hidden border border-[rgba(0,0,0,0.06)]'>
                        <View className='items-center pt-8 pb-6 px-4'>
                            <Text className='text-[rgba(15,23,42,0.6)] font-medium text-xs tracking-wider'>
                                BOOKING ID
                            </Text>
                            <Text
                                className='text-secondary-foreground font-semibold text-xs mt-1 px-2 text-center'
                                selectable
                            >
                                {booking.id}
                            </Text>
                        </View>

                        <View className='flex-row items-center w-full px-2 overflow-hidden'>
                            <View className='w-full h-[1px] border-b border-dashed border-[rgba(0,0,0,0.2)]' />
                        </View>

                        <View className='p-6 pt-5 gap-1'>
                            <Text className='text-secondary-foreground font-semibold text-sm'>
                                {booking.title}
                            </Text>
                            <Text className='text-[rgba(15,23,42,0.7)] text-[11px] mb-2 font-medium'>
                                {lang}
                            </Text>

                            <Text className='text-secondary-foreground font-semibold text-[11px] mt-1'>
                                {formatEventWhen(booking.date)}
                            </Text>
                            <Text className='text-[rgba(15,23,42,0.7)] text-[11px] mb-2 font-medium'>
                                {booking.location}
                            </Text>
                            <Text className='text-secondary-foreground font-medium text-[11px]'>
                                {ticketsText}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
