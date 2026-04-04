import FeaturedEventCard from '@/components/events/FeaturedEventCard'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EVENT_CATEGORY_ICONS, EVENT_CATEGORY_LABELS } from '@/constants/eventCategories'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { useDiscoverEvents } from '@/hooks/api'
import { readUserLocation, type StoredUserLocation } from '@/lib/location/user-location'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native'
import { Link, useRouter } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  type HomeTrendingCardProps,
  toFeaturedDiscoverProps,
  toHomeTrendingCardProps,
} from "@/screens/home/discoverAdapters";

const CATEGORIES = [
  { label: 'All Events', icon: null as null },
  ...EVENT_CATEGORY_LABELS.map((label) => ({
    label,
    icon: EVENT_CATEGORY_ICONS[label],
  })),
]

const EventCard = ({
  id,
  category,
  categoryIcon,
  title,
  description,
  date,
  location,
  bg,
  eventColor,
}: HomeTrendingCardProps) => (
  <Card className='relative mr-4 h-[230px] w-[160px] shrink-0 overflow-hidden rounded-2xl border-0 bg-transparent p-0 justify-end gap-0'>
    <View className='absolute inset-0 overflow-hidden rounded-2xl'>
      <Image source={bg} style={StyleSheet.absoluteFillObject} contentFit='cover' />
    </View>
    <View className='pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-40'>
      <LinearGradient
        colors={[eventColor, '#040047']}
        locations={[0, 0.4]}
        style={{ flex: 1 }}
      />
    </View>

    <View className='px-[14px] py-3'>
      <Badge
        variant='outline'
        className='mb-1 self-start border-0 p-1 px-2'
        style={{ backgroundColor: eventColor }}
      >
        {/* <Image source={categoryIcon} style={{ width: 14, height: 14 }} contentFit='contain' /> */}
        <Text className='text-white font-medium text-[10px]' numberOfLines={1}>{category}</Text>
      </Badge>

      <Text className='text-primary-foreground font-semibold text-[13px]' numberOfLines={1}>{title}</Text>

      {/* Fixed 2-line height so badge stays at the same Y across all cards */}
      <Text
        className='h-6 text-[10px] leading-[12px] text-primary-foreground'
        numberOfLines={2}
      >
        {description}
      </Text>

      <View className='mt-3 flex-row items-center gap-1.5'>
        <Image
          source={require('@/assets/images/home/calender.svg')}
          className='size-3'
          contentFit='contain'
        />
        <Text className='min-w-0 flex-1 text-[10px] text-primary-foreground' numberOfLines={1}>
          {date}
        </Text>
      </View>

      <View className='mt-1 flex-row items-center gap-1.5'>
        <Image
          source={require('@/assets/images/home/location2.svg')}
          className='size-3'
          contentFit='contain'
        />
        <Text className='min-w-0 flex-1 text-[10px] text-primary-foreground' numberOfLines={1}>
          {location}
        </Text>
      </View>

      <Link href={`/event/${id}`} asChild>
        <TouchableOpacity
          activeOpacity={0.8}
          className='mx-0 mt-3 h-9 flex-row items-center justify-center gap-2 rounded-lg border-0 bg-secondary'
        >
          <Text className='text-[10px] font-semibold text-primary-foreground'>Join Now</Text>
          <Image
            source={require('@/assets/images/home/arrow.svg')}
            className='size-3'
            contentFit='contain'
          />
        </TouchableOpacity>
      </Link>
    </View>
  </Card>
)

function discoverErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return 'Could not load events.';
}

/** Home tab (Discover) — route file stays thin; UI lives here. */
export default function HomeTabScreen() {
  const router = useRouter();
  const [stored, setStored] = useState<StoredUserLocation | null | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All Events');
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      readUserLocation().then((loc) => {
        if (cancelled) return;
        setStored(loc);
        if (loc === null) {
          router.replace('/settings/location');
        }
      });
      return () => {
        cancelled = true;
      };
    }, [router])
  );

  const apiCategory = useMemo(
    () =>
      selectedCategory === 'All Events' ? null : selectedCategory.toLowerCase(),
    [selectedCategory]
  );

  const { data, isLoading, isError, error } = useDiscoverEvents({
    lat: stored === undefined ? undefined : stored?.latitude,
    lng: stored === undefined ? undefined : stored?.longitude,
    category: apiCategory,
    limit: 5,
  });

  const trending = data?.trending_events ?? [];
  const compactRows = useMemo(
    () => trending.map(toHomeTrendingCardProps),
    [trending]
  );

  const locationLabel =
    data?.user_location ??
    (stored ? '' : stored === null ? 'Location not set' : '');

  const locationHydrating = stored === undefined;
  const showBlockingLoading = stored != null && isLoading;
  const showNoLocation = stored === null;
  const showTrendingCarousel =
    selectedCategory === 'All Events' && searchQuery.trim() === '';

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <View className='flex-1'>
        <View className='px-5 py-5 pb-3 bg-secondary shrink-0'>

          <View className='mb-1 flex-row items-center justify-between'>
            <View className='flex-row items-center gap-2'>
              <Image
                source={require('@/assets/images/home/location.svg')}
                className='size-[18px]'
                contentFit='contain'
              />
              <Text className='text-xs text-primary-foreground' numberOfLines={1}>
                {locationLabel}
              </Text>
            </View>
            <View>
              <Image
                source={require('@/assets/images/home/bell.svg')}
                className='size-[22px]'
                contentFit='contain'
              />
            </View>
          </View>

          <Text className='mb-2 text-2xl font-bold text-[#F97316]'>
            Discover Events
          </Text>

          <View className='flex-row items-center gap-2 rounded-lg bg-surface px-3'>
            <Image
              source={require('@/assets/images/home/search.svg')}
              className='size-[11px]'
            />
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder='Search by events, activities, venues, artists...'
              className='flex-1  text-xs border-0 font-medium placeholder:text-[rgba(15,23,42,0.5)] px-0'
            />
          </View>
        </View>

        {showTrendingCarousel ? (
          <View className='mt-1.5 shrink-0'>
            <View className='flex-row items-center justify-between px-5 mb-4'>
              <View className='flex-row items-center gap-1'>
                <Text className='text-[18px] font-bold text-primary'>
                  Trending now – Feel the Buzz
                </Text>
                <Image
                  source={require('@/assets/images/home/fire.gif')}
                  className='size-[30px]'
                />
              </View>
              <Link href="/all" asChild>
                <TouchableOpacity>
                  <Text className='ml-2 text-primary text-xs font-medium translate-y-3'>See all</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName='flex-row items-stretch px-5 py-2.5'
            >
              {locationHydrating ? (
                <View className="pl-6 pr-10 py-8 items-center justify-center">
                  <ActivityIndicator />
                </View>
              ) : showNoLocation ? (
                <View className="pl-6 pr-10 py-8 items-center justify-center">
                  <ActivityIndicator />
                </View>
              ) : showBlockingLoading ? (
                <View className="pl-6 pr-10 py-8 items-center justify-center">
                  <ActivityIndicator />
                </View>
              ) : isError ? (
                <View className="pl-2 pr-6 py-6 justify-center max-w-[280px]">
                  <Text className="text-primary text-xs">{discoverErrorMessage(error)}</Text>
                </View>
              ) : compactRows.length === 0 ? (
                <View className="pl-2 pr-6 py-6 justify-center">
                  <Text className="text-primary text-xs">No events in this category yet.</Text>
                </View>
              ) : (
                compactRows.map((event) => (
                  <EventCard key={event.id} {...event} />
                ))
              )}
            </ScrollView>
          </View>
        ) : null}

        <View className='shrink-0'>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName='pl-4 pr-2 py-2.5'
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.label;
              return (
                <TouchableOpacity
                  key={cat.label}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCategory(cat.label)}
                  className={`flex-row items-center gap-[6px] rounded-full border border-primary mr-3 px-4 py-1.5 ${isSelected ? 'bg-primary' : 'bg-transparent'}`}
                >
                  {cat.icon && (
                    <Image source={cat.icon} className='size-2.5' contentFit='contain' />
                  )}
                  <Text className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-primary'}`}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName='pt-1 pb-2'
        >
          {locationHydrating ? (
            <View className="px-5 py-12 items-center">
              <ActivityIndicator />
            </View>
          ) : showNoLocation ? (
            <View className="px-5 py-12 items-center">
              <ActivityIndicator />
            </View>
          ) : showBlockingLoading ? (
            <View className="px-5 py-12 items-center">
              <ActivityIndicator />
            </View>
          ) : isError ? (
            <View className="px-5 py-10">
              <Text className="text-primary text-xs text-center">{discoverErrorMessage(error)}</Text>
            </View>
          ) : trending.length === 0 ? (
            <View className="px-5 py-10">
              <Text className="text-primary text-xs text-center">No featured events in this category yet.</Text>
            </View>
          ) : (
            trending.map((card) => (
              <FeaturedEventCard key={card.id} {...toFeaturedDiscoverProps(card)} />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
