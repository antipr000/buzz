import FeaturedEventCard from '@/components/FeaturedEventCard'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CATEGORY_COLORS } from '@/constants/categoryColors'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import MaskedView from '@react-native-masked-view/masked-view'
import { Image, ImageSource } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'

const EVENTS = [
  {
    id: '1',
    category: 'Music',
    categoryIcon: require('@/assets/images/events/music/music2.svg'),
    title: 'Hoop Music Festival',
    description: 'The biggest music festival of the year featuring world...',
    date: 'Thu, Jan 15 | 8 PM',
    location: 'Central Park Arena',
    bg: require('@/assets/images/home/bg_music.png'),
    eventColor: CATEGORY_COLORS.Music
  },
  {
    id: '2',
    category: 'Tech',
    categoryIcon: require('@/assets/images/events/tech/tech2.svg'),
    title: 'Hackathon',
    description: 'Build real solutions with code, creativity, and collab...',
    date: 'Fri, Jan 23 | 11 AM',
    location: 'Innovation Hub',
    bg: require('@/assets/images/home/bg_hackathon.png'),
    eventColor: CATEGORY_COLORS.Tech
  },
  {
    id: '3',
    category: 'Food',
    categoryIcon: require('@/assets/images/events/food/food2.svg'),
    title: 'Street Food Fest',
    description: 'A culinary journey through the best street food from...',
    date: 'Tue, Feb 2 | 5 PM',
    location: 'River Walk Plaza',
    bg: require('@/assets/images/home/bg_streetfood.png'),
    eventColor: CATEGORY_COLORS.Food
  },
]

const FEATURED_EVENTS = [
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

const CATEGORIES = [
  { label: 'All Events', icon: null },
  { label: 'Music', icon: require('@/assets/images/events/music/music.svg') },
  { label: 'Art', icon: require('@/assets/images/events/art/art.svg') },
  { label: 'Food', icon: require('@/assets/images/events/food/food.svg') },
  { label: 'Tech', icon: require('@/assets/images/events/tech/tech.svg') },
  { label: 'Fitness', icon: require('@/assets/images/events/fitness/fitness.svg') },
]

type EventCardProps = {
  id: string
  category: string
  categoryIcon: ImageSource
  title: string
  description: string
  date: string
  location: string
  bg: ImageSource,
  eventColor: string
}

const EventCard = ({ id, category, categoryIcon, title, description, date, location, bg, eventColor }: EventCardProps) => (
  <Card className='mr-4 p-0 gap-0 border-0 overflow-hidden w-[160px] h-[230px] flex items-center justify-end'>
    {/* Background Image + Overlay */}
    <Image source={bg} style={{ width: '100%', height: '100%', position: 'absolute' }} contentFit='cover' />
    <LinearGradient
      colors={[eventColor, '#040047']}
      locations={[0, 0.4]}
      style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0.4 }}
    />

    {/* Content */}
    <View className='p-3.5'>
      {/* Category Badge */}
      <Badge variant='outline' className='self-start border-0 mb-1 p-1 px-2' style={{ backgroundColor: eventColor }}>
        <Image source={categoryIcon} style={{ width: 14, height: 14 }} contentFit='contain' />
        <Text className='text-primary-foreground text-[10px]'>{category}</Text>
      </Badge>

      {/* Title */}
      <Text className='text-primary-foreground font-semibold text-sm' numberOfLines={1}>{title}</Text>

      {/* Description */}
      <Text className='text-primary-foreground text-[10px] ' numberOfLines={2}>{description}</Text>

      {/* Date */}
      <View className='flex-row items-center gap-1.5 mt-3'>
        <Image source={require('@/assets/images/home/calender.svg')} style={{ width: 12, height: 12 }} contentFit='contain' />
        <Text className='text-primary-foreground text-[10px]'>{date}</Text>
      </View>

      {/* Location */}
      <View className='flex-row items-center gap-1.5 mt-1'>
        <Image source={require('@/assets/images/home/location2.svg')} style={{ width: 12, height: 12 }} contentFit='contain' />
        <Text className='text-primary-foreground text-[10px]'>{location}</Text>
      </View>

      {/* Join Now Button */}
      <Link href={`/event/${id}`} asChild>
        <TouchableOpacity activeOpacity={0.8} className='border-0 p-0 h-9  bg-secondary rounded-lg mt-3 flex-row items-center justify-center gap-2'>
          <Text className='text-primary-foreground text-[10px] font-semibold'>Join Now</Text>
          <Image source={require('@/assets/images/home/arrow.svg')} style={{ width: 12, height: 12 }} contentFit='contain' />
        </TouchableOpacity>
      </Link>
    </View>
  </Card>
)

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Events');

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <View className='flex-1'>
        <View className='px-5 py-5 pb-3 bg-secondary shrink-0'>

          {/* Header: Location + Notification */}
          <View className='flex-row items-center justify-between mb-1'>
            <View className='flex-row items-center gap-2'>
              <Image source={require('@/assets/images/home/location.svg')} style={{ width: 18, height: 18 }} contentFit='contain' />
              <Text className='text-primary-foreground text-xs'>New Delhi, India</Text>
            </View>
            <View>
              <Image source={require('@/assets/images/home/bell.svg')} style={{ width: 22, height: 22 }} contentFit='contain' />
              {/* Green notification dot */}
              {/* <View style={{
              position: 'absolute',
              top: -1,
              right: -1,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#22C55E',
            }} /> */}
            </View>
          </View>

          {/* Gradient Headline */}
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
              style={{ height: 52 }}  // LinearGradient requires inline style
            />
          </MaskedView>

          {/* Search Bar */}
          <View className='flex-row items-center bg-surface rounded-lg px-3 gap-2'>
            <Image source={require('@/assets/images/home/search.svg')} style={{ width: 11, height: 11 }} />
            <Input
              placeholder='Search by events, activities, venues, artists...'
              className='flex-1  text-xs border-0 font-medium placeholder:text-[rgba(15,23,42,0.5)] px-0'
            />
          </View>
        </View>

        {/* Trending Section */}
        <View className='mt-1.5 shrink-0'>
          {/* Section Header */}
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

          {/* Horizontal Event Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8, paddingTop: 10, paddingBottom: 10 }}
          >
            {EVENTS.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
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

        {/* Featured Event Cards */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 4, paddingBottom: 8 }}>
          {FEATURED_EVENTS.map((event) => (
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

export default Home