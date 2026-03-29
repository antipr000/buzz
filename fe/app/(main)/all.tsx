import { Text } from '@/components/ui/text'
import { TouchableOpacity, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Link, useRouter } from 'expo-router'
import { CATEGORY_COLORS } from '@/constants/categoryColors'
import { EVENT_CATEGORY_ICONS } from '@/constants/eventCategories'
import FeaturedEventCard from '@/components/FeaturedEventCard'

const TRENDING_EVENTS = [
    {
        id: 'f1',
        category: 'Music',
        categoryIcon: EVENT_CATEGORY_ICONS.Music,
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
        categoryIcon: EVENT_CATEGORY_ICONS.Tech,
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
        categoryIcon: EVENT_CATEGORY_ICONS.Food,
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

export default function TrendingEvents() {
    const router = useRouter()

    return (
        <SafeAreaView className='flex-1 bg-surface'>
            <View className='flex-1'>
                <View className='px-5 py-3 bg-[rgba(238,237,255,1)]'>
                    <View className='flex-row justify-end mb-2'>
                        <TouchableOpacity onPress={() => router.back()} className='flex-row items-center gap-1'>
                            <Image source={require('@/assets/images/arrow_back.svg')} style={{ width: 8, height: 8 }} contentFit='contain' className='rounded-full' />
                            <Text className='text-secondary-foreground text-xs font-medium'>Back Home</Text>
                        </TouchableOpacity>
                    </View>

                    <View className='flex-row items-center gap-2'>
                        <Text className='text-secondary-foreground text-base font-bold tracking-tight'>
                            Trending now - feel it, reel it
                        </Text>
                        <Image source={require('@/assets/images/home/fire.gif')} style={{ width: 30, height: 30 , borderRadius:999}} />
                    </View>
                </View>

                {/* Featured Event Cards list */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}>
                    {TRENDING_EVENTS.map((event) => (
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
