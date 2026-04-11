import OrganizerCreatedEventCard from '@/components/events/OrganizerCreatedEventCard'
import { Text } from '@/components/ui/text'
import { eventCategoryFromApiValue } from '@/constants/eventCategories'
import { useInfiniteCreatedEvents } from '@/hooks/api'
import { displayEventTitle } from '@/lib/events/display-event-title'
import {
    eventCardBackground,
    formatLongDate,
    formatTimeOfDay,
} from '@/screens/home/discoverAdapters'
import type { EventCard } from '@/services/types/events'
import { isAxiosError } from 'axios'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    View,
} from 'react-native'

function isUnauthorizedError(error: unknown): boolean {
    if (!isAxiosError(error)) return false
    const s = error.response?.status
    return s === 401 || s === 403
}

export default function EventsCreatedTab() {
    const router = useRouter()
    const {
        data,
        isLoading,
        isError,
        error,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
        isRefetching,
    } = useInfiniteCreatedEvents({ limit: 20 })

    const events = useMemo(
        () => (data?.pages ?? []).flatMap((p) => p.created_events),
        [data]
    )

    const unauthorized = isError && isUnauthorizedError(error)
    const initialLoading = isLoading && events.length === 0

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
                    Sign in to see events you created.
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

    if (events.length === 0) {
        return (
            <ScrollView
                className='flex-1'
                contentContainerClassName='flex-grow items-center justify-center px-10 py-10'
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
                }
            >
                <Text className='mb-3 text-center text-sm text-primary'>
                    You have not created any events yet.
                </Text>
                <Text className='text-center text-xs text-[rgba(15,23,42,0.55)]'>
                    Create an event from the app to see it here.
                </Text>
            </ScrollView>
        )
    }

    return (
        <FlatList<EventCard>
            data={events}
            keyExtractor={(item) => item.id}
            className='flex-1'
            contentContainerClassName='grow px-4 pb-6 pt-2'
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
            }
            onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage()
            }}
            onEndReachedThreshold={0.5}
            ItemSeparatorComponent={() => <View className='h-4' />}
            ListFooterComponent={
                isFetchingNextPage ? (
                    <View className='items-center py-4'>
                        <ActivityIndicator className='text-primary' />
                    </View>
                ) : null
            }
            renderItem={({ item }) => {
                const label = eventCategoryFromApiValue(item.category)
                const thumbnailSource = eventCardBackground(item, label)
                return (
                    <OrganizerCreatedEventCard
                        title={displayEventTitle(item.title)}
                        dateLabel={formatLongDate(item.date)}
                        timeLabel={formatTimeOfDay(item.time)}
                        attendees={item.participants}
                        thumbnailSource={thumbnailSource}
                        onPressCard={() =>
                            router.push({
                                pathname: '/settings/edit-event/[id]',
                                params: { id: item.id },
                            })
                        }
                        onPressVerify={() =>
                            router.push('/events/ticket-verification')
                        }
                    />
                )
            }}
        />
    )
}
