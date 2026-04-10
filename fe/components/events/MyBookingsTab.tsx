import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { useBookings } from '@/hooks/api'
import {
    formatBookingDoneAt,
    formatEventWhen,
    formatTicketLines,
    getBookingStatusPresentation,
} from '@/lib/bookings/display'
import type { BookingListItem } from '@/services/types/booking'
import { isAxiosError } from 'axios'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native'

const FALLBACK_EVENT_IMAGE = require('@/assets/images/home/bg_music.png')

function isUnauthorizedError(error: unknown): boolean {
    if (!isAxiosError(error)) return false
    const s = error.response?.status
    return s === 401 || s === 403
}

export default function MyBookingsTab() {
    const router = useRouter()
    const { data, isLoading, isError, error, refetch, isRefetching } = useBookings()

    const bookings = useMemo(() => data?.data ?? [], [data?.data])
    const unauthorized = isError && isUnauthorizedError(error)
    const initialLoading = isLoading && bookings.length === 0

    if (initialLoading) {
        return (
            <View className='flex-1 items-center justify-center px-10'>
                <ActivityIndicator className='text-primary' />
            </View>
        )
    }

    if (unauthorized) {
        return (
            <View className='flex-1 items-center justify-center px-10'>
                <Text className='text-center text-sm text-primary'>
                    Sign in to see your bookings.
                </Text>
            </View>
        )
    }

    if (isError) {
        return (
            <ScrollView
                className='flex-1'
                contentContainerClassName='flex-grow items-center justify-center px-10 py-10'
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
                }
            >
                <Text className='text-center text-sm text-primary'>
                    Could not load your events. Pull to retry.
                </Text>
            </ScrollView>
        )
    }

    if (bookings.length === 0) {
        return (
            <ScrollView
                className='flex-1'
                contentContainerClassName='flex-grow items-center justify-center px-10 py-10'
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
                }
            >
                <Text className='text-center text-sm font-medium text-[rgba(15,23,42,0.8)]'>
                    You have no bookings yet.
                </Text>
                <Text className='mt-2 text-center text-xs text-[rgba(15,23,42,0.55)]'>
                    When you buy tickets, they will show up here.
                </Text>
                <Text className='mt-4 text-center text-[11px] text-[rgba(15,23,42,0.45)]'>
                    Pull down to refresh.
                </Text>
            </ScrollView>
        )
    }

    return (
        <ScrollView
            className='flex-1'
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            refreshControl={
                <RefreshControl
                    refreshing={isRefetching && !isLoading}
                    onRefresh={() => refetch()}
                />
            }
        >
            {bookings.map((booking: BookingListItem) => {
                const statusUi = getBookingStatusPresentation(booking.status)
                const cover = booking.event_image?.trim() ?? ''
                const imageSource = cover !== '' ? { uri: cover } : FALLBACK_EVENT_IMAGE
                const lang =
                    booking.language?.trim() && booking.language.trim() !== ''
                        ? booking.language.trim()
                        : '—'

                return (
                    <View key={booking.id} className='mb-6'>
                        <Text className='mb-3 ml-1 text-[11px] font-medium text-[rgba(15,23,42,0.7)]'>
                            Booking done on: {formatBookingDoneAt(booking.booking_date)}
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                                router.push({
                                    pathname: '/events/ticket',
                                    params: {
                                        bookingId: booking.id,
                                        eventId: booking.event_id,
                                    },
                                })
                            }
                        >
                            <Card className='gap-0 overflow-hidden rounded-xl border border-[rgba(0,0,0,0.07)] bg-[rgba(244,248,255,1)] p-0 shadow-sm'>
                                <View className='flex-row gap-4 p-4'>
                                    <Image
                                        source={imageSource}
                                        style={{ width: 101, height: 131, borderRadius: 12 }}
                                        contentFit='cover'
                                    />

                                    <View className='flex-1'>
                                        <View className='flex-row items-start'>
                                            <View className='flex-1 pr-2'>
                                                <Text
                                                    className='text-xs font-bold text-secondary-foreground'
                                                    numberOfLines={3}
                                                >
                                                    {booking.title}
                                                </Text>
                                                <Text className='mt-0.5 text-[11px] text-[rgba(15,23,42,0.7)]'>
                                                    {lang}
                                                </Text>
                                            </View>
                                            <Text
                                                className='text-[11px] font-semibold text-[rgba(15,23,42,0.7)]'
                                                style={{ flexShrink: 0 }}
                                            >
                                                E-Ticket
                                            </Text>
                                        </View>

                                        <View className='mt-7 gap-0.5'>
                                            <Text className='text-[11px] font-semibold text-secondary-foreground'>
                                                {formatEventWhen(booking.date)}
                                            </Text>
                                            <Text className='text-[11px] text-[rgba(15,23,42,0.7)]'>
                                                {booking.location}
                                            </Text>
                                            <Text className='mt-1 text-[11px] font-medium text-secondary-foreground'>
                                                {formatTicketLines(booking.tickets)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <Separator className=' w-[92%] self-center bg-[rgba(0,0,0,0.07)]' />

                                <View className='flex-row items-center gap-3 px-4 py-4'>
                                    <View
                                        className='rounded-lg px-2 py-1.5'
                                        style={{ backgroundColor: statusUi.badgeColor }}
                                    >
                                        <Text className='text-[10px] font-semibold tracking-wider text-white'>
                                            {statusUi.label}
                                        </Text>
                                    </View>
                                    <Separator
                                        orientation='vertical'
                                        className='h-full w-[1px] bg-[rgba(0,0,0,0.05)]'
                                    />
                                    {statusUi.message ? (
                                        <Text className='flex-1 text-[11px] text-[rgba(15,23,42,0.7)]'>
                                            {statusUi.message}
                                        </Text>
                                    ) : null}
                                </View>
                            </Card>
                        </TouchableOpacity>
                    </View>
                )
            })}
        </ScrollView>
    )
}
