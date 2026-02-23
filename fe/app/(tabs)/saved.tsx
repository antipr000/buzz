import { Text } from '@/components/ui/text'
import { TouchableOpacity, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, useRouter } from 'expo-router'
import { CATEGORY_COLORS } from '@/constants/categoryColors'
import FeaturedEventCard from '@/components/FeaturedEventCard'
import { ArrowLeft } from 'lucide-react-native'
import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'

const SAVED_EVENTS = [
  {
    id: 'f1',
    category: 'Music',
    categoryIcon: require('@/assets/images/events/music/music2.svg'),
    calendarIcon: require('@/assets/images/events/music/calender.svg'),
    timeIcon: require('@/assets/images/events/music/time.svg'),
    locationIcon: require('@/assets/images/events/music/location.svg'),
    title: 'Hoop Music Festival',
    description: 'The biggest electronic music festival of the year featuring world class DJs and immersive light shows.',
    date: 'Thu, Jan 15, 2026',
    time: '8 PM',
    location: 'Central Park Arena',
    bg: require('@/assets/images/home/bg_music.png'),
    eventColor: CATEGORY_COLORS.Music,
    price: '1500',
    attendees: 2337,
    organizer: 'Pulse Events',
    organizerLogo: require('@/assets/images/home/logo1.svg'),
    isFeatured: true,
    isPopular: true,
  },
  {
    id: 'f2',
    category: 'Tech',
    categoryIcon: require('@/assets/images/events/tech/tech2.svg'),
    calendarIcon: require('@/assets/images/events/tech/calender.svg'),
    timeIcon: require('@/assets/images/events/tech/time.svg'),
    locationIcon: require('@/assets/images/events/tech/location.svg'),
    title: 'Hackathon',
    description: 'Build real solutions with code, creativity, and collaboration. An intense 24–48 hour challenge to build bold ideas from scratch.',
    date: 'Fri, Jan 23, 2026',
    time: '11 AM',
    location: 'Innovation Hub',
    bg: require('@/assets/images/home/bg_hackathon.png'),
    eventColor: CATEGORY_COLORS.Tech,
    price: '750',
    attendees: 564,
    organizer: 'Startup Grind',
    organizerLogo: require('@/assets/images/home/logo2.svg'),
    isFeatured: true,
    isPopular: false,
  },
  {
    id: 'f3',
    category: 'Food',
    categoryIcon: require('@/assets/images/events/food/food2.svg'),
    calendarIcon: require('@/assets/images/events/food/calender.svg'),
    timeIcon: require('@/assets/images/events/food/time.svg'),
    locationIcon: require('@/assets/images/events/food/location.svg'),
    title: 'Street Food Festival',
    description: 'A culinary journey through the best street food from around the world. Taste, explore, enjoy.',
    date: 'Tue, Feb 2, 2026',
    time: '5 PM',
    location: 'River Walk Plaza',
    bg: require('@/assets/images/home/bg_streetfood.png'),
    eventColor: CATEGORY_COLORS.Food,
    price: 'Free',
    attendees: 1820,
    organizer: 'Foodie Network',
    organizerLogo: require('@/assets/images/home/logo3.svg'),
    isFeatured: true,
    isPopular: true,
  },
]

export default function SavedEvents() {
  const router = useRouter()

  return (
    <SafeAreaView className='flex-1 bg-surface' edges={['top']}>
      <View className='flex-1'>
        <View className='px-5 py-5 pb-3  bg-secondary'>
          <TouchableOpacity
            onPress={() => router.back()}
            className='flex-row items-center gap-2 mb-0.5'
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={15} color='white' strokeWidth={2.5} />
            <MaskedView
              maskElement={
                <Text className='text-xl font-bold'>
                  Saved Events
                </Text>
              }
              style={{ width: 200, height: 30 }}
            >
              <LinearGradient
                colors={['#FF8A00', '#FF5A5F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </MaskedView>
          </TouchableOpacity>
          <Text className='text-[#A1A1AA] text-xs  ml-6'>
            {SAVED_EVENTS.length} events saved
          </Text>
        </View>

        {/* Event Cards list */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        >
          {SAVED_EVENTS.map((event) => (
            <Link key={event.id} href={`/event/${event.id}`} asChild>
              <TouchableOpacity activeOpacity={0.8}>
                <FeaturedEventCard {...event} />
              </TouchableOpacity>
            </Link>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}