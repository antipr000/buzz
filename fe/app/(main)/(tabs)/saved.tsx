import FeaturedEventCard from '@/components/FeaturedEventCard'
import { Text } from '@/components/ui/text'
import { useInfiniteSavedEvents } from '@/hooks/api'
import { toFeaturedDiscoverProps } from '@/screens/home/discoverAdapters'
import type { EventCard } from '@/services/types/events'
import { isAxiosError } from 'axios'
import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React, { useMemo } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function isUnauthorizedError(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const s = error.response?.status
  return s === 401 || s === 403
}

export default function SavedEvents() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
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
  } = useInfiniteSavedEvents({ limit: 20 })

  const events = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.saved_events),
    [data]
  )

  const unauthorized = isError && isUnauthorizedError(error)

  const listHeader = (
    <View
      className='w-full flex-row items-center gap-4 bg-secondary px-5 pb-4 mb-4'
      style={{ paddingTop: Math.max(insets.top, 40) }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className='p-1'
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ArrowLeft size={24} color='rgba(249, 250, 251, 1)' strokeWidth={2.5} />
      </TouchableOpacity>
      <Text className='text-xl font-semibold text-[#F97316]'>Saved Events</Text>
    </View>
  )

  if (isLoading && events.length === 0) {
    return (
      <View className='flex-1 bg-surface'>
        {listHeader}
        <View className='flex-1 items-center justify-center px-10'>
          <ActivityIndicator className='text-primary' />
        </View>
      </View>
    )
  }

  if (unauthorized) {
    return (
      <View className='flex-1 bg-surface'>
        {listHeader}
        <View className='flex-1 items-center justify-center px-10'>
          <Text className='text-primary text-sm text-center'>
            Sign in to see your saved events.
          </Text>
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View className='flex-1 bg-surface'>
        {listHeader}
        <ScrollView
          className='flex-1'
          contentContainerClassName='flex-grow items-center justify-center px-10'
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
            />
          }
        >
          <Text className='text-primary text-sm text-center'>
            Could not load saved events. Pull to retry.
          </Text>
        </ScrollView>
      </View>
    )
  }

  if (events.length === 0) {
    return (
      <View className='flex-1 bg-surface'>
        {listHeader}
        <View className='flex-1 items-center justify-center px-10'>
          <Text className='text-primary text-sm text-center mb-3'>
            No saved events yet.
          </Text>
          <Text className='text-[#A1A1AA] text-xs text-center mb-4'>
            Save events from Discover to find them here.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(main)/(tabs)')}
            activeOpacity={0.7}
          >
            <Text className='text-[#FF8A00] text-sm font-medium'>
              Browse home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View className='flex-1 bg-surface'>
      <FlatList<EventCard>
        data={events}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <FeaturedEventCard {...toFeaturedDiscoverProps(item)} />
        )}
        className='flex-1 bg-surface'
        contentContainerClassName='grow pb-6'
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className='items-center py-4'>
              <ActivityIndicator className='text-primary' />
            </View>
          ) : null
        }
      />
    </View>
  )
}
