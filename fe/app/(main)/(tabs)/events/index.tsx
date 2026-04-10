import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { useBookings } from '@/hooks/api'
import {
    formatBookingDoneAt,
    formatEventWhen,
    formatTicketLines,
    getBookingStatusPresentation,
} from '@/lib/bookings/display'
import { cn } from '@/lib/utils'
import type { BookingListItem } from '@/services/types/booking'
import { isAxiosError } from 'axios'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
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

const Events = () => {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'created' | 'bookings'>('bookings')
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

    const tabBar = (
        <View className='bg-[rgba(249,250,251,1)] px-4 pb-4 pt-6'>
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as 'created' | 'bookings')}
                className='w-full gap-0'
            >
                <TabsList className='h-[28px] w-[85%] max-w-[340px] self-center flex-row rounded-xl bg-white p-0.5 shadow-sm shadow-black/5'>
                    <TabsTrigger
                        value='created'
                        className={cn(
                            'h-[24px] flex-1 rounded-lg border-0 px-1 py-0 shadow-none',
                            activeTab === 'created' ? 'bg-primary' : 'bg-white'
                        )}
                    >
                        <Text
                            className={cn(
                                'text-center text-[12px] font-medium',
                                activeTab === 'created' ? 'text-white' : 'text-primary'
                            )}
                        >
                            Events Created
                        </Text>
                    </TabsTrigger>
                    <TabsTrigger
                        value='bookings'
                        className={cn(
                            'h-[24px] flex-1 rounded-lg border-0 px-1 py-0 shadow-none',
                            activeTab === 'bookings' ? 'bg-primary' : 'bg-white'
                        )}
                    >
                        <Text
                            className={cn(
                                'text-center text-[12px] font-medium',
                                activeTab === 'bookings' ? 'text-white' : 'text-primary'
                            )}
                        >
                            My Bookings
                        </Text>
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </View>
    )

    const createdPlaceholder = (
        <View className='flex-1 items-center justify-center px-10'>
            <Text className='text-center text-sm font-medium text-[rgba(15,23,42,0.75)]'>
                Events you create will show up here.
            </Text>
            <Text className='mt-2 text-center text-xs text-[rgba(15,23,42,0.5)]'>
                Switch to My Bookings to see tickets you have purchased.
            </Text>
        </View>
    )

    return (
        <SafeAreaView className='flex-1 bg-background' edges={['top']}>
            <View className='flex-1'>
                {header}
                {tabBar}

                {activeTab === 'created' ? (
                    createdPlaceholder
                ) : initialLoading ? (
                    <View className='flex-1 items-center justify-center px-10'>
                        <ActivityIndicator className='text-primary' />
                    </View>
                ) : unauthorized ? (
                    <View className='flex-1 items-center justify-center px-10'>
                        <Text className='text-center text-sm text-primary'>
                            Sign in to see your bookings.
                        </Text>
                    </View>
                ) : isError ? (
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
                ) : bookings.length === 0 ? (
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
                ) : (
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
                                                style={{ width: 101, height: 131, borderRadius: 12 }}
                                                contentFit='cover'
                                            />

                                            <View className='flex-1'>
                                                <View className='flex-row items-start'>
                                                    <View className='flex-1 pr-2'>
                                                        <Text
                                                            className='text-secondary-foreground font-bold text-xs'
                                                            numberOfLines={3}
                                                        >
                                                            {booking.title}
                                                        </Text>
                                                        <Text className='text-[rgba(15,23,42,0.7)] text-[11px] mt-0.5'>
                                                            {lang}
                                                        </Text>
                                                    </View>
                                                    <Text
                                                        className='text-[rgba(15,23,42,0.7)] font-semibold text-[11px]'
                                                        style={{ flexShrink: 0 }}
                                                    >
                                                        E-Ticket
                                                    </Text>
                                                </View>

                                                <View className='mt-7 gap-0.5'>
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
                                                className='px-2 py-1.5 rounded-lg'
                                                style={{ backgroundColor: statusUi.badgeColor }}
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
                )}
            </View>
        </SafeAreaView>
    )
}

export default Events
