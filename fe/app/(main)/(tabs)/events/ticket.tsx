import { Text } from '@/components/ui/text'
import { useBookings } from '@/hooks/api'
import { formatEventWhen, formatTicketLines } from '@/lib/bookings/display'
import { firstParamString } from '@/lib/expo-router/params'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React, { useMemo } from 'react'
import {
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Ticket = () => {
    const router = useRouter()
    const params = useLocalSearchParams<{
        bookingId?: string | string[]
        eventId?: string | string[]
    }>()

    const bookingId = firstParamString(params.bookingId)
    const eventIdParam = firstParamString(params.eventId)

    const { data, isLoading, isError, refetch, isFetching } = useBookings()

    const booking = useMemo(() => {
        if (!bookingId || !data?.data) return undefined
        const row = data.data.find((b) => b.id === bookingId)
        if (!row) return undefined
        if (eventIdParam && row.event_id !== eventIdParam) return undefined
        return row
    }, [bookingId, data?.data, eventIdParam])

    const listSettled = !isLoading && data !== undefined
    const notFound = Boolean(bookingId) && listSettled && !booking && !isError

    const header = (
        <View className='px-5 py-10 pb-3 bg-secondary flex-row items-center gap-4'>
            <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <ArrowLeft size={24} color='rgba(249, 250, 251, 1)' strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className='text-background text-xl font-semibold'>E-Ticket</Text>
        </View>
    )

    if (!bookingId) {
        return (
            <SafeAreaView className='flex-1 bg-background' edges={['top']}>
                <View className='flex-1'>
                    {header}
                    <View className='flex-1 items-center justify-center px-8'>
                        <Text className='text-[rgba(15,23,42,0.75)] text-sm text-center'>
                            Missing booking. Open this screen from your bookings list.
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    if (isLoading && !data) {
        return (
            <SafeAreaView className='flex-1 bg-background' edges={['top']}>
                <View className='flex-1'>
                    {header}
                    <View className='flex-1 items-center justify-center'>
                        <ActivityIndicator className='text-primary' />
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    if (isError) {
        return (
            <SafeAreaView className='flex-1 bg-background' edges={['top']}>
                <View className='flex-1'>
                    {header}
                    <View className='flex-1 items-center justify-center px-8 gap-4'>
                        <Text className='text-primary text-sm text-center'>
                            Could not load booking details.
                        </Text>
                        <TouchableOpacity onPress={() => refetch()} activeOpacity={0.8}>
                            <Text className='text-[#FF8A00] text-sm font-medium'>Try again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    if (notFound) {
        return (
            <SafeAreaView className='flex-1 bg-background' edges={['top']}>
                <View className='flex-1'>
                    {header}
                    <View className='flex-1 items-center justify-center px-8 gap-4'>
                        <Text className='text-[rgba(15,23,42,0.75)] text-sm text-center'>
                            This booking was not found. It may have been removed or the link is
                            outdated.
                        </Text>
                        <TouchableOpacity
                            onPress={() => refetch()}
                            activeOpacity={0.8}
                            disabled={isFetching}
                        >
                            <Text className='text-[#FF8A00] text-sm font-medium'>
                                {isFetching ? 'Refreshing…' : 'Refresh'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    if (!booking) {
        return (
            <SafeAreaView className='flex-1 bg-background' edges={['top']}>
                <View className='flex-1'>
                    {header}
                    <View className='flex-1 items-center justify-center'>
                        <ActivityIndicator className='text-primary' />
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    const lang =
        booking.language?.trim() && booking.language.trim() !== ''
            ? booking.language.trim()
            : '—'
    const ticketsText = formatTicketLines(booking.tickets)
    const statusNorm = (booking.status ?? '').trim().toUpperCase()
    const showThanksBanner =
        statusNorm === 'UPCOMING' || statusNorm === 'ATTENDED'

    return (
        <SafeAreaView className='flex-1 bg-background' edges={['top']}>
            <View className='flex-1'>
                {header}

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                >
                    {showThanksBanner ? (
                        <View className='bg-[rgba(9,183,9,0.05)] border border-[rgba(9,183,9,0.05)] flex-row items-center gap-2 p-3 rounded-md mb-6'>
                            <Image
                                source={require('@/assets/images/tick.svg')}
                                style={{ width: 12, height: 12 }}
                                contentFit='contain'
                            />
                            <Text className='text-[#22C55E] font-bold text-xs'>
                                Thank you for trusting us!
                            </Text>
                        </View>
                    ) : null}

                    <View className='bg-white w-full max-w-[400px] self-center rounded-xl overflow-hidden border border-[rgba(0,0,0,0.06)]'>
                        <View className='items-center pt-8 pb-6 px-4'>
                            <Image
                                source={require('@/assets/images/qr.svg')}
                                style={{ width: 90, height: 90 }}
                                contentFit='contain'
                            />
                            <Text className='text-[rgba(15,23,42,0.6)] font-medium text-xs tracking-wider mt-5'>
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

export default Ticket
