import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import MaskedView from '@react-native-masked-view/masked-view'
import { Image, ImageSource } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const EVENTS = [
  {
    id: '1',
    category: 'Music',
    categoryIcon: require('@/assets/images/events/music.svg'),
    title: 'Hoop Music Festival',
    description: 'The biggest music festival of the year featuring world...',
    date: 'Thu, Jan 15 | 8 PM',
    location: 'Central Park Arena',
    bg: require('@/assets/images/home/bg_music.png'),
    eventColor: 'rgba(236,72,153,1)'
  },
  {
    id: '2',
    category: 'Tech',
    categoryIcon: require('@/assets/images/events/tech.svg'),
    title: 'Hackathon',
    description: 'Build real solutions with code, creativity, and collab...',
    date: 'Fri, Jan 23 | 11 AM',
    location: 'Innovation Hub',
    bg: require('@/assets/images/home/bg_hackathon.png'),
    eventColor: 'rgba(37,99,235,1)'
  },
  {
    id: '3',
    category: 'Food',
    categoryIcon: require('@/assets/images/events/food.svg'),
    title: 'Street Food Fest',
    description: 'A culinary journey through the best street food from...',
    date: 'Tue, Feb 2 | 5 PM',
    location: 'River Walk Plaza',
    bg: require('@/assets/images/home/bg_streetfood.png'),
    eventColor: 'rgba(249,115,22,1)'
  },
]

const CATEGORIES = [
  { label: 'All Events', icon: null },
  { label: 'Music', icon: require('@/assets/images/events/music.svg') },
  { label: 'Art', icon: require('@/assets/images/events/art.svg') },
  { label: 'Food', icon: require('@/assets/images/events/food.svg') },
  { label: 'Tech', icon: require('@/assets/images/events/tech.svg') },
  { label: 'Fitness', icon: require('@/assets/images/events/fitness.svg') },
]

type EventCardProps = {
  category: string
  categoryIcon: ImageSource
  title: string
  description: string
  date: string
  location: string
  bg: ImageSource,
  eventColor: string
}

const EventCard = ({ category, categoryIcon, title, description, date, location, bg, eventColor }: EventCardProps) => (
  <Card className='mr-4 p-0 gap-0 border-0 overflow-hidden w-[168px] h-[242px] flex items-center justify-end'>
    {/* Background Image + Overlay */}
    <Image source={bg} style={{ width: '100%', height: '100%', position: 'absolute' }} contentFit='cover' />
    <View className='w-full h-full absolute opacity-40' style={{ backgroundColor: eventColor }} />

    {/* Content */}
    <View className='p-3.5'>
      {/* Category Badge */}
      <Badge variant='outline' className='self-start border-0 mb-1 p-1 px-2' style={{ backgroundColor: eventColor }}>
        {/* <Image source={categoryIcon} style={{ width: 14, height: 14 }} contentFit='contain' /> */}
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
      <Button variant='outline' className='border-0 p-0 h-9  bg-secondary rounded-lg mt-3 flex-row items-center justify-center gap-2'>
        <Text className='text-primary-foreground text-[10px] font-semibold'>Join Now</Text>
        <Image source={require('@/assets/images/home/arrow.svg')} style={{ width: 12, height: 12 }} contentFit='contain' />
      </Button>
    </View>
  </Card>
)

const Home = () => {
  return (
    <SafeAreaView className='flex-1 bg-surface'>
      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        <View className='px-5 py-5 pb-7 bg-secondary'>

          {/* Header: Location + Notification */}
          <View className='flex-row items-center justify-between mb-8'>
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
            <Image source={require('@/assets/images/home/search.svg')} style={{ width: 15, height: 15 }} />
            <Input
              placeholder='Search by events, activities, venues, artists...'
              className='flex-1 text-xs border-0 font-medium placeholder:text-[rgba(15,23,42,0.5)] px-0'
            />
          </View>
        </View>

        {/* Trending Section */}
        <View className='mt-6'>
          {/* Section Header */}
          <View className='flex-row items-center justify-between px-5 mb-4'>
            <View className='flex-row items-center gap-1'>


              <Text className='text-primary text-[18px] font-bold'>
                Trending now – Feel the Buzz
              </Text>

          
              <Image source={require('@/assets/images/home/fire.gif')} style={{ width: 30, height: 30 }}  />
            </View>
            <TouchableOpacity>
              <Text className='ml-2 text-primary text-xs font-medium translate-y-3'>See all</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Event Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
          >
            {EVENTS.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </ScrollView>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, paddingTop: 20, paddingBottom: 20 }}
        >
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat.label}
              variant='outline'
              className='border-primary/30 mr-3 px-4 py-2'
            >
              {cat.icon && <Image source={cat.icon} style={{ width: 16, height: 16 }} contentFit='contain' />}
              <Text className='text-primary text-xs font-medium'>{cat.label}</Text>
            </Badge>
          ))}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Home