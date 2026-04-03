import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { useBookings } from '@/hooks/api'
import type { BookingListItem, BookingTicketLineOut } from '@/services/types/booking'
import { isAxiosError } from 'axios'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React, { useMemo } from 'react'
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const FALLBACK_EVENT_IMAGE = require('@/assets/images/home/bg_music.png')

function isUnauthorizedError(error: unknown): boolean {
    if (!isAxiosError(error)) return false
    const s = error.response?.status
    return s === 401 || s === 403
}

function formatBookingDoneAt(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
    })
}

function formatEventWhen(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const datePart = d.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
    const timePart = d.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    })
    return `${datePart} | ${timePart}`
}

function formatTicketLines(tickets: BookingTicketLineOut[]): string {
    return tickets
        .map((line) => {
            const seats = line.seats.map((s) => s.trim()).filter(Boolean)
            const seatPart = seats.length ? ` - ${seats.join(', ')}` : ''
            const n = line.quantity
            const unit = n === 1 ? 'Ticket' : 'Tickets'
            return `${n} ${unit}: ${line.ticket_tier}${seatPart}`
        })
        .join('\n')
}

function getBookingStatusPresentation(status: string): {
    label: string
    message: string
    badgeClassName: string
} {
    const u = status.trim().toUpperCase()
    switch (u) {
        case 'UPCOMING':
            return {
                label: 'UPCOMING',
                message: 'Your e-ticket is ready. See you at the event!',
                badgeClassName: 'bg-[rgba(59,130,246,1)]',
            }
        case 'ATTENDED':
            return {
                label: 'ATTENDED',
                message: 'Hope you had an amazing time!',
                badgeClassName: 'bg-[rgba(145,145,145,1)]',
            }
        case 'CANCELLED':
            return {
                label: 'CANCELLED',
                message: 'This booking was cancelled.',
                badgeClassName: 'bg-[rgba(239,68,68,1)]',
            }
        default:
            return {
                label: u || status,
                message: '',
                badgeClassName: 'bg-[rgba(145,145,145,1)]',
            }
    }
}

const Events = () => {
    const router = useRouter()
    const { data, isLoading, isError, error, refetch, isRefetching } = useBookings()

    const bookings = useMemo(() => data?.data ?? [], [data?.data])
    const unauthorized = isError && isUnauthorizedError(error)
    const initialLoading = isLoading && bookings.length === 0

    const header = (
        <View className='px-5 py-10 pb-3 bg-secondary flex-row items-center gap-4'>
            <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <ArrowLeft size={24} color='rgba(249, 250, 251, 1)' strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className='text-background text-xl font-semibold'>Your Events</Text>
        </View>
    )

    if (initialLoading) {
        return (
            <SafeAreaView className='flex-1 bg-background' edges={['top']}>
                <View className='flex-1'>
                    {header}
                    <View className='flex-1 items-center justify-center px-10'>
                        <ActivityIndicator className='text-primary' />
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    if (unauthorized) {
        return (
            <SafeAreaView className='flex-1 bg-background' edges={['top']}>
                <View className='flex-1'>
                    {header}
                    <View className='flex-1 items-center justify-center px-10'>
                        <Text className='text-primary text-sm text-center'>
                            Sign in to see your bookings.
                        </Text>
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
                    <ScrollView
                        className='flex-1'
                        contentContainerClassName='flex-grow items-center justify-center px-10 py-10'
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={() => refetch()}
                            />
                        }
                    >
                        <Text className='text-primary text-sm text-center'>
                            Could not load your events. Pull to retry.
                        </Text>
                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }

    if (bookings.length === 0) {
        return (
            <SafeAreaView className='flex-1 bg-background' edges={['top']}>
                <View className='flex-1'>
                    {header}
                    <ScrollView
                        className='flex-1'
                        contentContainerClassName='flex-grow items-center justify-center px-10 py-10'
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={() => refetch()}
                            />
                        }
                    >
                        <Text className='text-[rgba(15,23,42,0.8)] text-sm text-center font-medium'>
                            You have no bookings yet.
                        </Text>
                        <Text className='text-[rgba(15,23,42,0.55)] text-xs text-center mt-2'>
                            When you buy tickets, they will show up here.
                        </Text>
                        <Text className='text-[rgba(15,23,42,0.45)] text-[11px] text-center mt-4'>
                            Pull down to refresh.
                        </Text>
                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className='flex-1 bg-background' edges={['top']}>
            <View className='flex-1'>
                {header}

                <ScrollView
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
                        const imageSource =
                            cover !== '' ? { uri: cover } : FALLBACK_EVENT_IMAGE
                        const lang =
                            booking.language?.trim() && booking.language.trim() !== ''
                                ? booking.language.trim()
                                : '—'

                        return (
                            <View key={booking.id} className='mb-6'>
                                <Text className='text-[rgba(15,23,42,0.7)] text-[11px] font-medium mb-3 ml-1'>
                                    Booking done on:{' '}
                                    {formatBookingDoneAt(booking.booking_date)}
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
                                    <Card className='p-0 bg-[rgba(244,248,255,1)] border border-[rgba(0,0,0,0.07)] shadow-sm rounded-xl overflow-hidden gap-0'>
                                        <View className='p-4 flex-row gap-4'>
                                            <Image
                                                source={imageSource}
                                                style={{ width: 100, height: 130, borderRadius: 12 }}
                                                contentFit='cover'
                                            />

                                            <View className='flex-1 shrink'>
                                                <View className='flex-row justify-between items-start'>
                                                    <View className='flex-1 pr-2'>
                                                        <Text className='text-secondary-foreground font-bold text-xs'>
                                                            {booking.title}
                                                        </Text>
                                                        <Text className='text-[rgba(15,23,42,0.7)] text-[11px] mt-0.5'>
                                                            {lang}
                                                        </Text>
                                                    </View>
                                                    <Text className='text-[rgba(15,23,42,0.7)] font-semibold text-[11px]'>
                                                        E-Ticket
                                                    </Text>
                                                </View>

                                                <View className='mt-9 gap-0.5'>
                                                    <Text className='text-secondary-foreground font-semibold text-[11px]'>
                                                        {formatEventWhen(booking.date)}
                                                    </Text>
                                                    <Text className='text-[rgba(15,23,42,0.7)] text-[11px]'>
                                                        {booking.location}
                                                    </Text>
                                                    <Text className='text-secondary-foreground font-medium text-[11px] mt-1'>
                                                        {formatTicketLines(booking.tickets)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <Separator className=' bg-[rgba(0,0,0,0.07)] w-[92%] self-center' />

                                        <View className='px-4 py-4 flex-row items-center gap-3'>
                                            <View
                                                className={`px-2 py-1.5 rounded-lg ${statusUi.badgeClassName}`}
                                            >
                                                <Text className='text-white font-semibold text-[10px] tracking-wider'>
                                                    {statusUi.label}
                                                </Text>
                                            </View>
                                            <Separator
                                                orientation='vertical'
                                                className='w-[1px] h-full bg-[rgba(0,0,0,0.05)]'
                                            />
                                            {statusUi.message ? (
                                                <Text className='text-[rgba(15,23,42,0.7)] text-[11px] flex-1'>
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
            </View>
        </SafeAreaView>
    )
}

export default Events
