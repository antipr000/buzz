import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { Image } from 'expo-image'
import { Card } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react-native'
import { Link, Href } from 'expo-router'

const STATS = [
  {
    icon: require('@/assets/images/profile/calender.svg'),
    count: '12',
    label: 'Events attended'
  },
  {
    icon: require('@/assets/images/profile/heart.svg'),
    count: '3',
    label: 'Saved Events'
  },
  {
    icon: require('@/assets/images/profile/pen.svg'),
    count: '2',
    label: 'Events created'
  }
]

const MENU_ITEMS: { icon: string; label: string; href: Href }[] = [
  {
    icon: require('@/assets/images/profile/bell.svg'),
    label: 'Notifications',
    href: '/notifications' as Href
  },
  {
    icon: require('@/assets/images/profile/settings.svg'),
    label: 'Settings',
    href: '/settings' as Href
  },
  {
    icon: require('@/assets/images/profile/shield.svg'),
    label: 'Privacy Policy',
    href: '/privacy' as Href
  },
  {
    icon: require('@/assets/images/profile/question.svg'),
    label: 'Help & support',
    href: '/help' as Href
  }
]

const Profile = () => {
  return (
    <SafeAreaView className='flex-1 bg-background' edges={['top']}>
      {/* Header / Profile Info */}
      <View className='px-5 py-6 pb-4 bg-secondary flex-row items-center justify-between'>
        <View className='flex-row items-center gap-3'>
          <Image
            source={require('@/assets/images/profile/profile.jpg')}
            style={{ width: 30, height: 30, borderRadius: 22 }}
            contentFit='cover'
          />
          <View>
            <Text className='text-white font-semibold text-base mb-0.5'>Tayne Smith</Text>
            <Text className='text-[rgba(249,250,251,0.7)] text-[10px]'>you@gmail.com</Text>
          </View>
        </View>
        <TouchableOpacity className='px-4 py-1 rounded-full border border-background'>
          <Text className='text-white text-xs'>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className='flex-1' contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Stats Row */}
        <View className='flex-row gap-1 mb-7'>
          {STATS.map((stat, index) => (
            <Card key={index} className='flex-1 mx-1 gap-0 border border-primary items-center py-2.5 px-0 bg-transparent rounded-xl shadow-none'>
              <Image source={stat.icon} style={{ width: 15, height: 15, marginBottom: 8 }} contentFit='contain' />
              <Text className='text-primary font-semibold text-sm mb-1'>{stat.count}</Text>
              <Text className='text-[10px] text-center text-secondary-foreground'>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Menu Options */}
        <View className='gap-3'>
          {MENU_ITEMS.map((item, index) => (
            <Link key={index} href={item.href} asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Card className='flex-row border border-[rgba(4,0,71,0.1)] items-center justify-between px-6 py-6 bg-background rounded-xl shadow-none'>
                  <View className='flex-row items-center gap-4'>
                    <Image source={item.icon} style={{ width: 15, height: 15 }} contentFit='contain' />
                    <Text className='text-black font-medium text-xs'>{item.label}</Text>
                  </View>
                  <ChevronRight size={15} color="rgba(79, 70, 229, 1)" />
                </Card>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Sign out button */}
        <TouchableOpacity className='mt-24 py-2.5 px-12 self-center rounded-full border border-primary items-center justify-center bg-transparent'>
          <Text className='text-primary font-semibold text-sm'>Sign out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({})