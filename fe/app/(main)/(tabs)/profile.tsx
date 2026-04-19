import { View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { Image, type ImageSource } from 'expo-image'
import { Card } from '@/components/ui/card'
import { ChevronRight, Wallet } from 'lucide-react-native'
import { Link, Href } from 'expo-router'
import { SignOutDialog } from '@/components/account/SignOutDialog'
import { useProfileStats } from '@/hooks/api'
import type { StatsOut } from '@/services/types/profile'

const AVATAR_SIZE = 30

function firstLetterFromName(name: string): string {
  const t = name.trim()
  if (!t) return '?'
  return t[0].toUpperCase()
}

const STAT_ROWS: {
  icon: ImageSource
  label: string
  key: keyof StatsOut
}[] = [
  {
    icon: require('@/assets/images/profile/calender.svg'),
    label: 'Events attended',
    key: 'events_attended',
  },
  {
    icon: require('@/assets/images/profile/heart.svg'),
    label: 'Saved Events',
    key: 'saved_events',
  },
  {
    icon: require('@/assets/images/profile/pen.svg'),
    label: 'Events created',
    key: 'events_created',
  },
]

const MENU_ITEMS: { icon: ImageSource; label: string; href: Href }[] = [
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

function ProfileLoading() {
  return (
    <SafeAreaView className='flex-1 bg-background' edges={['top']}>
      <View className='flex-1 items-center justify-center px-10'>
        <ActivityIndicator className='text-primary' />
      </View>
    </SafeAreaView>
  )
}

const Profile = () => {
  const { data, isPending, isError, refetch, isRefetching } = useProfileStats()

  const stats = useMemo(
    () =>
      data
        ? STAT_ROWS.map((row) => ({
            ...row,
            count: String(data.stats[row.key]),
          }))
        : [],
    [data]
  )

  if (isPending && !data) {
    return <ProfileLoading />
  }

  // Query v5 can keep `data` after a failed refetch; avoid replacing the whole screen then.
  if (isError && !data) {
    return (
      <SafeAreaView className='flex-1 bg-background' edges={['top']}>
        <View className='flex-1 items-center justify-center px-10 gap-4'>
          <Text className='text-primary text-sm text-center'>
            Could not load profile.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className='py-2.5 px-8 rounded-full border border-primary'
          >
            <Text className='text-primary font-semibold text-sm'>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (!data) {
    return null
  }

  const { user } = data
  const avatarUrl = user.profile_image?.trim()
  const avatarFrameStyle = {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  }

  return (
    <SafeAreaView className='flex-1 bg-background' edges={['top']}>
      {/* Header / Profile Info */}
      <View className='px-5 py-6 pb-4 bg-secondary flex-row items-center justify-between'>
        <View className='flex-row items-center gap-3'>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={avatarFrameStyle}
              contentFit='cover'
            />
          ) : (
            <View
              style={avatarFrameStyle}
              className='items-center justify-center bg-white'
            >
              <Text className='text-black font-semibold text-base leading-none'>
                {firstLetterFromName(user.name)}
              </Text>
            </View>
          )}
          <View>
            <Text className='text-white font-semibold text-base mb-0.5'>{user.name}</Text>
            <Text className='text-[rgba(249,250,251,0.7)] text-[10px]'>{user.email}</Text>
          </View>
        </View>
        <Link href="/profile/edit" asChild>
          <TouchableOpacity className='px-4 py-1 rounded-full border border-background'>
            <Text className='text-white text-xs'>Edit</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView
        className='flex-1'
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
      >

        {/* Stats Row */}
        <View className='flex-row gap-1 mb-7'>
          {stats.map((stat, index) => (
            <Card key={index} className='flex-1 mx-1 gap-0 border border-primary items-center py-2.5 px-0 bg-transparent rounded-xl shadow-none'>
              <Image source={stat.icon} style={{ width: 15, height: 15, marginBottom: 8 }} contentFit='contain' />
              <Text className='text-primary font-semibold text-sm mb-1'>{stat.count}</Text>
              <Text className='text-[10px] text-center text-secondary-foreground'>{stat.label}</Text>
            </Card>
          ))}
        </View>

        <Link href="/profile/payout-detail" asChild>
          <TouchableOpacity activeOpacity={0.7} className="mb-3">
            <Card className="flex-row border border-[rgba(4,0,71,0.1)] items-center justify-between px-6 py-6 bg-background rounded-xl shadow-none">
              <View className="flex-row items-center gap-4">
                <Wallet size={15} color="rgba(79, 70, 229, 1)" />
                <Text className="text-black font-medium text-xs">Payout accounts</Text>
              </View>
              <ChevronRight size={15} color="rgba(79, 70, 229, 1)" />
            </Card>
          </TouchableOpacity>
        </Link>

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
        <SignOutDialog>
          <TouchableOpacity className='mt-24 py-2.5 px-12 self-center rounded-full border border-primary items-center justify-center bg-transparent'>
            <Text className='text-primary font-semibold text-sm'>Sign out</Text>
          </TouchableOpacity>
        </SignOutDialog>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile
