import FeaturedEventCard from '@/components/FeaturedEventCard'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CATEGORY_COLORS } from '@/constants/categoryColors'
import { EVENT_CATEGORY_ICONS, EVENT_CATEGORY_LABELS } from '@/constants/eventCategories'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { useDiscoverEvents } from '@/hooks/api'
import { readUserLocation, type StoredUserLocation } from '@/lib/user-location'
import MaskedView from '@react-native-masked-view/masked-view'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Link } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
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

const CARD_W = 160;
const CARD_H = 230;
const CARD_GAP = 16;
const CARD_RADIUS = 16;
/** Inline — NativeWind spacing can be ignored on web / some RN layouts. */
const CARD_INNER_PAD = 14;

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
  <Card
    className='p-0 gap-0 border-0 overflow-hidden justify-end bg-transparent'
    style={{
      width: CARD_W,
      height: CARD_H,
      borderRadius: CARD_RADIUS,
      flexShrink: 0,
      marginRight: CARD_GAP,
    }}
  >
    <Image
      source={bg}
      style={{
        width: CARD_W,
        height: CARD_H,
        position: 'absolute',
        borderRadius: CARD_RADIUS,
      }}
      contentFit='cover'
    />
    <LinearGradient
      colors={[eventColor, '#040047']}
      locations={[0, 0.4]}
      style={{
        width: CARD_W,
        height: CARD_H,
        position: 'absolute',
        opacity: 0.4,
        borderRadius: CARD_RADIUS,
      }}
    />

    <View
      style={{
        paddingHorizontal: CARD_INNER_PAD,
        paddingTop: 12,
        paddingBottom: 12,
      }}
    >
      <Badge variant='outline' className='self-start border-0 mb-1 p-1 px-2' style={{ backgroundColor: eventColor }}>
        {/* <Image source={categoryIcon} style={{ width: 14, height: 14 }} contentFit='contain' /> */}
        <Text className='text-[#040047] font-medium text-[10px]' numberOfLines={1}>{category}</Text>
      </Badge>

      <Text className='text-primary-foreground font-semibold text-[13px]' numberOfLines={1}>{title}</Text>

      {/* Fixed 2-line height so badge stays at the same Y across all cards */}
      <Text
        className='text-primary-foreground text-[10px]'
        numberOfLines={2}
        style={{ height: 24, lineHeight: 12 }}
      >
        {description}
      </Text>

      <View className='flex-row items-center gap-1.5 mt-3'>
        <Image source={require('@/assets/images/home/calender.svg')} style={{ width: 12, height: 12 }} contentFit='contain' />
        <Text className='text-primary-foreground text-[10px]' numberOfLines={1} style={{ flex: 1 }}>{date}</Text>
      </View>

      <View className='flex-row items-center gap-1.5 mt-1'>
        <Image source={require('@/assets/images/home/location2.svg')} style={{ width: 12, height: 12 }} contentFit='contain' />
        <Text className='text-primary-foreground text-[10px]' numberOfLines={1} style={{ flex: 1 }}>{location}</Text>
      </View>

      <Link href={`/event/${id}`} asChild>
        <TouchableOpacity
          activeOpacity={0.8}
          className='border-0 bg-secondary rounded-lg mt-3 flex-row items-center justify-center gap-2'
          style={{ height: 36, marginHorizontal: 0 }}
        >
          <Text className='text-primary-foreground text-[10px] font-semibold'>Join Now</Text>
          <Image source={require('@/assets/images/home/arrow.svg')} style={{ width: 12, height: 12 }} contentFit='contain' />
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
  const [stored, setStored] = useState<StoredUserLocation | null | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All Events');

  useEffect(() => {
    let cancelled = false;
    readUserLocation().then((loc) => {
      if (!cancelled) setStored(loc);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
    (stored ? 'Near you' : stored === null ? 'Location not set' : '');

  const locationHydrating = stored === undefined;
  const showBlockingLoading = stored != null && isLoading;
  const showNoLocation = stored === null;

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <View className='flex-1'>
        <View className='px-5 py-5 pb-3 bg-secondary shrink-0'>

          <View className='flex-row items-center justify-between mb-1'>
            <View className='flex-row items-center gap-2'>
              <Image source={require('@/assets/images/home/location.svg')} style={{ width: 18, height: 18 }} contentFit='contain' />
              <Text className='text-primary-foreground text-xs' numberOfLines={1}>
                {locationLabel}
              </Text>
            </View>
            <View>
              <Image source={require('@/assets/images/home/bell.svg')} style={{ width: 22, height: 22 }} contentFit='contain' />
            </View>
          </View>

          <MaskedView
            maskElement={
              <Text className='text-2xl font-bold'>
                Discover Events
              </Text>
            }
          >
            <LinearGradient
              colors={['#C4F000', '#FF1962']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ height: 52 }}
            />
          </MaskedView>

          <View className='flex-row items-center bg-surface rounded-lg px-3 gap-2'>
            <Image source={require('@/assets/images/home/search.svg')} style={{ width: 11, height: 11 }} />
            <Input
              placeholder='Search by events, activities, venues, artists...'
              className='flex-1  text-xs border-0 font-medium placeholder:text-[rgba(15,23,42,0.5)] px-0'
            />
          </View>
        </View>

        <View className='mt-1.5 shrink-0'>
          <View className='flex-row items-center justify-between px-5 mb-4'>
            <View className='flex-row items-center gap-1'>
              <Text className='text-primary text-[18px] font-bold'>
                Trending now – Feel the Buzz
              </Text>
              <Image source={require('@/assets/images/home/fire.gif')} style={{ width: 30, height: 30 }} />
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
            contentContainerStyle={{
              flexDirection: 'row',
              alignItems: 'stretch',
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            {locationHydrating ? (
              <View className="pl-6 pr-10 py-8 items-center justify-center">
                <ActivityIndicator />
              </View>
            ) : showNoLocation ? (
              <View className="pl-2 pr-6 py-6 justify-center max-w-[280px]">
                <Text className="text-primary text-xs mb-2">
                  Allow location to see events near you.
                </Text>
                <Link href="/(main)/location" asChild>
                  <TouchableOpacity>
                    <Text className="text-primary text-xs font-semibold underline">Open location</Text>
                  </TouchableOpacity>
                </Link>
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

        <View className='shrink-0'>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, paddingTop: 10, paddingBottom: 10 }}
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
                  {cat.icon && <Image source={cat.icon} style={{ width: 10, height: 10 }} contentFit='contain' />}
                  <Text className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-primary'}`}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 4, paddingBottom: 8 }}>
          {locationHydrating ? (
            <View className="px-5 py-12 items-center">
              <ActivityIndicator />
            </View>
          ) : showNoLocation ? (
            <View className="px-5 py-10">
              <Text className="text-primary text-xs text-center">
                Featured events appear after you share your location.
              </Text>
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
              <Link key={card.id} href={`/event/${card.id}`} asChild>
                <TouchableOpacity activeOpacity={0.8}>
                  <FeaturedEventCard {...toFeaturedDiscoverProps(card)} />
                </TouchableOpacity>
              </Link>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
